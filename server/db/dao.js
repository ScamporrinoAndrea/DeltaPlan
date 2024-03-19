'use strict';
import sqlite from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { computeFinalDate, isPresent, addThenConvert, subThenConvert } from '../controllers/utils.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'deltaPlan.db');
let db = new sqlite.Database(dbPath, (err) => {
  if (err) throw err;
});

/**
 * Operations on Ingredient
 */
export const getAllIngredients = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM INGREDIENT';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const result = rows.map(({ user_id, ...other }) => ({
          ...other,
          isUser: user_id === 1,
        }));

        resolve(result || []);
      }
    });
  });
};

export const findIngredientByName = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM INGREDIENT WHERE name = ?';
    db.get(sql, [name], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
};

export const addIngredient = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO INGREDIENT (name, user_id, path) VALUES (?, ?, ?)';
    db.run(sql, [name, 1, "NotFound.webp"], function (err) {
      if (err) {
        reject(err);
      } else {
        const insertedId = this.lastID;
        resolve(insertedId);
      }
    });
  });
};

export const getOtherMissingIngredients = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT M.ingredient_id, M.quantity, M.unit_of_measure, I.quantity as inv_quantity, I.unit_of_measure as inv_unit
      FROM MEAL M
      LEFT JOIN INVENTORY I ON M.ingredient_id = I.ingredient_id
      WHERE activity_id = ? AND (M.ingredient_id IS NOT NULL);
    `;

    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const result = rows.filter(row => {
          return !(isPresent(row.quantity, row.unit_of_measure, row.inv_quantity, row.inv_unit));
        })
          .map(row => {
            if (row.inv_quantity !== null) {
              const { quantity, unit_of_measure } = subThenConvert({ quantity: row.inv_quantity, unitOfMeasure: row.inv_unit }, { quantity: row.quantity, unit_of_measure: row.unit_of_measure })
              return {
                ingredient_id: row.ingredient_id,
                quantity: quantity,
                unit_of_measure: unit_of_measure,
              };
            }
            else {
              return {
                ingredient_id: row.ingredient_id,
                quantity: row.quantity,
                unit_of_measure: row.unit_of_measure,
              };
            }
          });
        resolve(result);
      }
    });
  });
};

/**
 * Operations on Recipes
 */
export const getAllRecipes = (meal) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        R.*,
        I.name as ingredient_name,
        R_I.quantity,
        R_I.unit_of_measure,
        INV.quantity as inv_quantity,
        INV.unit_of_measure as inv_unit_of_measure
      FROM
        RECIPE R
      JOIN
        RECIPE_ING R_I ON R.id = R_I.recipe_id
      JOIN
        INGREDIENT I ON I.id = R_I.ingredient_id
      LEFT JOIN
        INVENTORY INV ON INV.ingredient_id = I.id
      WHERE
        type = ?`;
    db.all(sql, [meal], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const groupedRecipes = {};

        rows.forEach((recipe) => {
          const key = recipe.id;

          if (!groupedRecipes[key]) {
            groupedRecipes[key] = {
              id: recipe.id,
              name: recipe.name,
              path: recipe.path,
              type: recipe.meal_type,
              description: recipe.description,
              ingredients: [],
            };
          }

          const ingredient = {
            name: recipe.ingredient_name,
            quantity: recipe.quantity,
            unit_of_measure: recipe.unit_of_measure,
            isPresent: isPresent(recipe.quantity, recipe.unit_of_measure, recipe.inv_quantity, recipe.inv_unit_of_measure)
          }

          groupedRecipes[key].ingredients.push(ingredient);
        });
        const result = Object.values(groupedRecipes);
        resolve(result);
      }
    });
  });
};

export const getRecipesMissingIngredients = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT M.recipe_id, RI.ingredient_id, RI.quantity, RI.unit_of_measure, I.quantity as inv_quantity, I.unit_of_measure as inv_unit
    FROM MEAL M
    JOIN RECIPE_ING RI ON RI.recipe_id = M.recipe_id
    LEFT JOIN INVENTORY I ON RI.ingredient_id = I.ingredient_id
    WHERE activity_id = ?;
    `;

    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const result = rows.filter(row => {
          return !(isPresent(row.quantity, row.unit_of_measure, row.inv_quantity, row.inv_unit));
        })
          .map(row => {
            if (row.inv_quantity !== null) {
              const { quantity, unit_of_measure } = subThenConvert({ quantity: row.inv_quantity, unitOfMeasure: row.inv_unit }, { quantity: row.quantity, unit_of_measure: row.unit_of_measure })
              return {
                ingredient_id: row.ingredient_id,
                quantity: quantity,
                unit_of_measure: unit_of_measure,
              };
            }
            else {
              return {
                ingredient_id: row.ingredient_id,
                quantity: row.quantity,
                unit_of_measure: row.unit_of_measure,
              };
            }
          });
        resolve(result);
      }
    });
  });
};


/**
 * Operations on Inventory
 */

export const getInventoryData = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT V.*, I.name, I.path FROM INVENTORY V INNER JOIN INGREDIENT I ON V.ingredient_id = I.id';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let inventory = rows.map((row) => ({
          id: row.id,
          ingredient_name: row.name,
          path: row.path,
          quantity: row.quantity,
          unit_of_measure: row.unit_of_measure || undefined,
          expiration_date: row.expiration_date,
        }));
        resolve(inventory);
      }
    });
  });
};

export const getFirstInventoryData = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT V.id, V.quantity, V.unit_of_measure, I.name FROM INVENTORY V INNER JOIN INGREDIENT I ON V.ingredient_id = I.id ORDER BY V.id LIMIT 3';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let inventory = rows.map((row) => ({
          id: row.id,
          ingredient_name: row.name,
          quantity: row.quantity,
          unit_of_measure: row.unit_of_measure,
        }));
        resolve(inventory);
      }
    });
  });
};

export const addInventoryItem = (item) => {
  const sql = 'SELECT * FROM INVENTORY WHERE ingredient_id = ?';
  return new Promise((resolve, reject) => {
    db.get(sql, [item.id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        // Entry exists, perform update
        Promise.resolve(addThenConvert(item, row))
          .then(converted => increaseInventoryItem(item, converted))
          .then(resolve)
          .catch(reject);
      } else {
        // Entry doesn't exist, perform insert
        insertInventoryItem(item)
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

const increaseInventoryItem = (item, row) => {
  const finalExpirationDate = computeFinalDate(row.expiration_date, item.expirationDate);

  const sql = 'UPDATE INVENTORY SET quantity = ?, expiration_date = ?, unit_of_measure = ? WHERE ingredient_id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [row.quantity, finalExpirationDate, row.unit_of_measure, item.id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: 'Inventory item updated successfully',
          item: { ...row, expiration_date: finalExpirationDate },
        });
      }
    });
  });
};

export const insertInventoryItem = (item) => {
  const sql = 'INSERT INTO INVENTORY (ingredient_id, quantity, unit_of_measure, expiration_date) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.run(sql, [item.id, item.quantity, item.unitOfMeasure, item.expirationDate], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: 'Inventory item added successfully',
          item: {
            id: this.lastID,
            ingredient_id: item.id,
            quantity: item.quantity,
            unit_of_measure: item.unitOfMeasure,
            expiration_date: item.expirationDate,
          },
        });
      }
    });
  });
};

export const updateInventoryItem = (item) => {
  const sql = 'UPDATE INVENTORY SET ingredient_id = ?, quantity = ?, unit_of_measure = ?, expiration_date = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [item.ingredientId, item.quantity, item.unitOfMeasure, item.expirationDate, item.id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes !== 1) {
        resolve({ error: 'Nothing was updated.' });
      } else {
        item.ingredient_id = item.ingredientId;
        item.unit_of_measure = item.unitOfMeasure;
        item.expiration_date = item.expirationDate;
        delete item.ingredientId;
        delete item.unitOfMeasure;
        delete item.expirationDate;

        resolve({
          message: 'Inventory item updated successfully',
          item,
        });
      }
    });
  });
};

export const deleteInventoryItem = (id) => {
  const sql = 'DELETE FROM INVENTORY WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes !== 1) {
        resolve({ error: 'Nothing was deleted.' });
      } else {
        resolve();
      }
    });
  });
};

/**
 * Operations on Shopping List
 */


export const getShoppingListData = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT SL.*, I.name, I.path FROM SHOPPINGLIST SL INNER JOIN INGREDIENT I ON SL.ingredient_id = I.id';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let list = rows.map((row) => ({
          id: row.id,
          ingredient_name: row.name,
          quantity: row.quantity,
          unit_of_measure: row.unit_of_measure || undefined,
          buy_by_date: row.buy_by_date,
          path: row.path,
        }));
        resolve(list);
      }
    });
  });
};

export const getShoppingListNearestData = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT SL.id, I.name FROM SHOPPINGLIST SL INNER JOIN INGREDIENT I ON SL.ingredient_id = I.id ORDER BY SL.buy_by_date ASC LIMIT 3';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        let list = rows.map((row) => ({
          id: row.id,
          ingredient_name: row.name
        }));
        resolve(list);
      }
    });
  });
};


export const addShoppingListItem = (item) => {
  const sql = 'SELECT * FROM SHOPPINGLIST WHERE unit_of_measure = ? AND ingredient_id = ?';
  return new Promise((resolve, reject) => {
    db.get(sql, [item.unitOfMeasure, item.id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        // Entry exists, perform update
        increaseShoppingListItem(item, row)
          .then(resolve)
          .catch(reject);
      } else {
        // Entry doesn't exist, perform insert
        insertShoppingListItem(item)
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

const increaseShoppingListItem = (item, row) => {
  const finalBBDate = computeFinalDate(row.buy_by_date, item.buyByDate);

  const sql = 'UPDATE SHOPPINGLIST SET quantity = quantity + ?, buy_by_date = ? WHERE unit_of_measure = ? AND ingredient_id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [item.quantity, finalBBDate, item.unitOfMeasure, item.id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: 'Shopping List item updated successfully',
          item: { ...row, quantity: Number(row.quantity) + Number(item.quantity), buy_by_date: finalBBDate },
        });
      }
    });
  });
};

const insertShoppingListItem = (item) => {
  const sql = 'INSERT INTO SHOPPINGLIST (ingredient_id, quantity, unit_of_measure, buy_by_date) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.run(sql, [item.id, item.quantity, item.unitOfMeasure, item.buyByDate], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: 'Shopping List item added successfully',
          item: {
            id: this.lastID,
            ingredient_id: item.id,
            quantity: item.quantity,
            unit_of_measure: item.unitOfMeasure,
            buy_by_date: item.buyByDate,
          },
        });
      }
    });
  });
};

export const updateShoppingListItem = (item) => {
  const sql = 'UPDATE SHOPPINGLIST SET ingredient_id = ?, quantity = ?, unit_of_measure = ?, buy_by_date = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [item.ingredientId, item.quantity, item.unitOfMeasure, item.buyByDate, item.id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes !== 1) {
        resolve({ error: 'Nothing was updated.' });
      } else {
        item.ingredient_id = item.ingredientId;
        item.unit_of_measure = item.unitOfMeasure;
        item.buy_by_date = item.buyByDate;
        delete item.ingredientId;
        delete item.unitOfMeasure;
        delete item.buyByDate;

        resolve({
          message: 'Shopping List item updated successfully',
          item,
        });
      }
    });
  });
};

export const deleteShoppingListItem = (id) => {
  const sql1 = 'SELECT * FROM SHOPPINGLIST WHERE id = ?';
  const sql2 = 'DELETE FROM SHOPPINGLIST WHERE id = ?';

  return new Promise((resolve, reject) => {
    db.get(sql1, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      else if (!row) {
        resolve({ error: 'Nothing was deleted.' });
      }
      else {
        db.run(sql2, [id], function (err) {
          if (err) {
            reject(err);
          } else {
            const result = {
              id: row.ingredient_id,
              quantity: row.quantity,
              unitOfMeasure: row.unit_of_measure,
              expirationDate: null
            };
            resolve(result);
          }
        })
      };
    });
  });
};

/**
 * Operations on Activities
 */

export const getAllActivities = (targetDate) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT 
    A.*,
    CASE A.meal_type
        WHEN 'B' THEN 'Breakfast'
        WHEN 'L' THEN 'Lunch'
        WHEN 'D' THEN 'Dinner'
        WHEN 'S' THEN 'Snack'
        ELSE A.meal_type
    END AS meal_type,
    M.recipe_id,
	M.ingredient_id,
	M.quantity as ing_quantity,
	M.unit_of_measure as ing_unit,
    R.name,
    R.description,
    R.path,
    RI.quantity as recipe_quantity,
    RI.unit_of_measure as recipe_unit,
    RI.ingredient_id as recipe_ing_id,
    I1.name as i1name,
	I2.name as i2name,
	INV1.quantity as inv1_quantity,
	INV1.unit_of_measure as inv1_unit,
	INV2.quantity as inv2_quantity,
	INV2.unit_of_measure as inv2_unit
FROM 
    ACTIVITY A
LEFT JOIN 
    MEAL M ON A.id = M.activity_id
LEFT JOIN 
    RECIPE R ON M.recipe_id = R.id
LEFT JOIN 
    RECIPE_ING RI ON R.id = RI.recipe_id
LEFT JOIN
    INGREDIENT I1 ON RI.ingredient_id = I1.id
LEFT JOIN
    INVENTORY INV1 ON RI.ingredient_id = INV1.ingredient_id
LEFT JOIN
    INGREDIENT I2 ON M.ingredient_id = I2.id
LEFT JOIN
    INVENTORY INV2 ON M.ingredient_id = INV2.ingredient_id	
WHERE 
    A.date = ? OR (A.repeat IN ('d', 'w', 'm') AND A.date < ?);
    `;
    db.all(sql, [targetDate, targetDate], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const groupedActivities = {};

        rows.forEach((activity) => {
          const key = activity.id;

          if (!groupedActivities[key]) {
            groupedActivities[key] = {
              id: activity.id,
              date: activity.date,
              start_time: activity.start_time,
              end_time: activity.end_time,
              type: activity.type,
              title: activity.title !== null ? activity.title : undefined,
              notes: activity.notes !== null ? activity.notes : undefined,
              repeat: activity.repeat,
              meal_type: activity.meal_type !== null ? activity.meal_type : undefined,
              recipes: [],
              other_ingredients: [],
            };
          }

          if (activity.type === 'general') {
            groupedActivities[key].recipes = undefined;
            groupedActivities[key].other_ingredients = undefined;
          } else if (activity.recipe_id) {
            const recipeId = activity.recipe_id;
            const existingRecipe = groupedActivities[key].recipes.find(recipe => recipe && recipe.recipe_id === recipeId);

            if (!existingRecipe) {
              const newRecipe = {
                recipe_id: recipeId,
                name: activity.name,
                description: activity.description,
                path: activity.path,
                ingredients: []
              }
              groupedActivities[key].recipes.push(newRecipe);
            }

            const ingredient = {
              ingredient_id: activity.recipe_ing_id,
              name: activity.i1name,
              quantity: activity.recipe_quantity,
              unit_of_measure: activity.recipe_unit,
              isPresent: isPresent(activity.recipe_quantity, activity.recipe_unit, activity.inv1_quantity, activity.inv1_unit),
            };
            (existingRecipe || groupedActivities[key].recipes[groupedActivities[key].recipes.length - 1]).ingredients.push(ingredient);
          } else {
            const ingredient = {
              ingredient_id: activity.ingredient_id,
              name: activity.i2name,
              quantity: activity.ing_quantity,
              unit_of_measure: activity.ing_unit,
              isPresent: isPresent(activity.ing_quantity, activity.ing_unit, activity.inv2_quantity, activity.inv2_unit),
            };
            groupedActivities[key].other_ingredients.push(ingredient);
          }
        });

        const result = Object.values(groupedActivities);

        resolve(result);
      }
    });
  });
};

export const getActivitiesData = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, start_time, end_time, date, repeat, meal_type FROM ACTIVITY`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getActivityById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT 
    A.*,
    CASE A.meal_type
        WHEN 'B' THEN 'Breakfast'
        WHEN 'L' THEN 'Lunch'
        WHEN 'D' THEN 'Dinner'
        WHEN 'S' THEN 'Snack'
        ELSE A.meal_type
    END AS meal_type,
    M.recipe_id,
	M.ingredient_id as m_ing,
	M.quantity as m_quantity,
	M.unit_of_measure as m_unit,
    R.name,
    R.description,
    R.path,
    RI.quantity as r_quantity,
    RI.unit_of_measure as r_unit,
    RI.ingredient_id as r_ing,
    I1.name as i1name,
	I2.name as i2name,
	INV1.quantity as inv1_quantity,
	INV1.unit_of_measure as inv1_unit,
	INV2.quantity as inv2_quantity,
	INV2.unit_of_measure as inv2_unit
FROM 
    ACTIVITY A
LEFT JOIN 
    MEAL M ON A.id = M.activity_id
LEFT JOIN 
    RECIPE R ON M.recipe_id = R.id
LEFT JOIN 
    RECIPE_ING RI ON R.id = RI.recipe_id
LEFT JOIN
    INGREDIENT I1 ON RI.ingredient_id = I1.id
LEFT JOIN
    INVENTORY INV1 ON RI.ingredient_id = INV1.ingredient_id
LEFT JOIN
    INGREDIENT I2 ON M.ingredient_id = I2.id
LEFT JOIN
    INVENTORY INV2 ON M.ingredient_id = INV2.ingredient_id	
WHERE 
    A.id = ?;`;
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      } else if (rows.length == 0) {
        resolve({ error: `Activity ${id} not Found` })
      } else {
        const result = {
          id: rows[0].id,
          date: rows[0].date,
          start_time: rows[0].start_time,
          end_time: rows[0].end_time,
          type: rows[0].type,
          title: rows[0].title !== null ? rows[0].title : undefined,
          notes: rows[0].notes !== null ? rows[0].notes : undefined,
          repeat: rows[0].repeat,
          meal_type: rows[0].meal_type !== null ? rows[0].meal_type : undefined,
          recipes: [],
          other_ingredients: [],
        }
        for (const item of rows) {
          if (item.type === 'general') {
            result.recipes = undefined;
            result.other_ingredients = undefined;
          } else if (item.recipe_id) {
            const recipeId = item.recipe_id;
            const existingRecipe = result.recipes.find(recipe => recipe && recipe.recipe_id === recipeId);

            if (!existingRecipe) {
              const newRecipe = {
                recipe_id: recipeId,
                name: item.name,
                description: item.description,
                path: item.path,
                ingredients: []
              }
              result.recipes.push(newRecipe);
            }

            const ingredient = {
              ingredient_id: item.r_ing,
              name: item.i1name,
              quantity: item.r_quantity,
              unit_of_measure: item.r_unit,
              isPresent: isPresent(item.r_quantity, item.r_unit, item.inv1_quantity, item.inv1_unit),
            };
            (existingRecipe || result.recipes[result.recipes.length - 1]).ingredients.push(ingredient);
          } else {
            const ingredient = {
              ingredient_id: item.m_ing,
              name: item.i2name,
              quantity: item.m_quantity,
              unit_of_measure: item.m_unit,
              isPresent: isPresent(item.m_quantity, item.m_unit, item.inv2_quantity, item.inv2_unit),
            };
            result.other_ingredients.push(ingredient);
          }
        }
        resolve(result);
      }
    });
  });
};

export const insertActivity = (activity) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ACTIVITY (date, start_time, end_time, type, title, notes, meal_type, repeat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [activity.date, activity.start_time, activity.end_time, activity.type, activity.title, activity.notes, activity.meal_type, activity.repeat];

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

export const insertMeal = (meal) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO MEAL (activity_id, recipe_id, ingredient_id, quantity, unit_of_measure) VALUES (?, ?, ?, ?, ?)`;
    const params = [meal.activity_id, meal.recipe_id, meal.ingredient_id, meal.quantity, meal.unit_of_measure];

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

export const deleteActivity = (id) => {
  const getTypeSql = 'SELECT type FROM ACTIVITY WHERE id = ?';

  return new Promise((resolve, reject) => {
    db.get(getTypeSql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve({ error: 'Nothing was deleted.' });
      } else {
        const deletedType = row.type;

        const deleteSql = 'DELETE FROM ACTIVITY WHERE id = ?';
        db.run(deleteSql, [id], function (deleteErr) {
          if (deleteErr) {
            reject(deleteErr);
          } else if (this.changes !== 1) {
            resolve({ error: 'Nothing was deleted.' });
          } else {
            resolve({ type: deletedType });
          }
        });
      }
    });
  });
};

export const deleteMeal = (id) => {
  const sql = 'DELETE FROM MEAL WHERE activity_id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes < 1) {
        resolve({ error: 'Nothing was deleted.' });
      } else {
        resolve({ type: this.type });
      }
    });
  });
};

export const getToDeleteIngredients = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT
    M.ingredient_id as m_ingredient_id,        
    M.quantity as m_quantity, 
    M.unit_of_measure as m_unit, 
    R.recipe_id,
    R.ingredient_id,
    R.quantity,
    R.unit_of_measure,
    SL.id as s_id,
    SL.quantity as s_quantity,
    SL.unit_of_measure as s_unit,
    SL.buy_by_date as s_buy
    FROM MEAL M
    LEFT JOIN RECIPE_ING R ON M.recipe_id = R.recipe_id
    JOIN SHOPPINGLIST SL ON 
    (R.recipe_id IS NOT NULL AND R.ingredient_id = SL.ingredient_id) OR
    (R.recipe_id IS NULL AND M.ingredient_id = SL.ingredient_id)
    WHERE M.activity_id = ?;`;
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const result = [];
        rows.forEach(row => {
          const existingEntry = result.find(entry => entry.id === row.s_id);
          const toSub = subThenConvert({ quantity: row.quantity || row.m_quantity, unitOfMeasure: (row.unit_of_measure || row.unit_of_measure === '') ? row.unit_of_measure : row.m_unit }, { quantity: row.s_quantity, unit_of_measure: row.s_unit });
          if (existingEntry) {
            const toAdd = addThenConvert({ quantity: existingEntry.quantity, unitOfMeasure: existingEntry.unitOfMeasure }, { quantity: toSub.quantity, unit_of_measure: toSub.unit_of_measure })
            const toSub2 = subThenConvert({ quantity: row.s_quantity, unit_of_measure: row.s_unit }, { quantity: toAdd.quantity, unitOfMeasure: toAdd.unit_of_measure });
            existingEntry.quantity = toSub2.quantity;
            existingEntry.unitOfMeasure = toSub2.unit_of_measure;
            existingEntry.op = toSub2.quantity > 0 ? "update" : "delete";
          } else {
            result.push({
              op: toSub.quantity > 0 ? "update" : "delete",
              id: row.s_id,
              ingredientId: row.ingredient_id || row.m_ingredient_id,
              quantity: toSub.quantity,
              unitOfMeasure: toSub.unit_of_measure,
              buyByDate: row.s_buy
            });
          }
        });
        resolve(result);
      }
    });
  });
};

export const getToRemoveFromInventory = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT
    M.ingredient_id as m_ingredient_id,        
    M.quantity as m_quantity, 
    M.unit_of_measure as m_unit, 
    R.recipe_id,
    R.ingredient_id,
    R.quantity,
    R.unit_of_measure,
    I.id as i_id,
    I.quantity as i_quantity,
    I.unit_of_measure as i_unit,
    I.expiration_date as i_exp
    FROM MEAL M
    LEFT JOIN RECIPE_ING R ON M.recipe_id = R.recipe_id
    JOIN INVENTORY I ON 
    (R.recipe_id IS NOT NULL AND R.ingredient_id = I.ingredient_id) OR
    (R.recipe_id IS NULL AND M.ingredient_id = I.ingredient_id)
    WHERE M.activity_id = ?;`;
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const result = [];
        rows.forEach(row => {
          const existingEntry = result.find(entry => entry.inv_id === row.i_id);
          const toSub = subThenConvert({ quantity: row.quantity || row.m_quantity, unitOfMeasure: (row.unit_of_measure || row.unit_of_measure === '') ? row.unit_of_measure : row.m_unit }, { quantity: row.i_quantity, unit_of_measure: row.i_unit });
          if (existingEntry) {
            const toAdd = addThenConvert({ quantity: existingEntry.quantity, unitOfMeasure: existingEntry.unitOfMeasure }, { quantity: toSub.quantity, unit_of_measure: toSub.unit_of_measure })
            const toSub2 = subThenConvert({ quantity: row.i_quantity, unitOfMeasure: row.i_unit }, { quantity: toAdd.quantity, unit_of_measure: toAdd.unit_of_measure });
            existingEntry.quantity = toSub2.quantity;
            existingEntry.unitOfMeasure = toSub2.unit_of_measure;
            existingEntry.op = toSub2.quantity > 0 ? "update" : "delete";
          } else {
            result.push({
              op: toSub.quantity > 0 ? "update" : "delete",
              inv_id: row.i_id,
              id: row.ingredient_id || row.m_ingredient_id,
              quantity: toSub.quantity,
              unitOfMeasure: toSub.unit_of_measure,
              expirationDate: row.i_exp
            });
          }
        });
        resolve(result);
      }
    });
  });
};

/**
 * Operations on Activities Done
 */

export const IsActivityDone = (id, date) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM ACT_DONE WHERE id = ? AND date = ?';
    db.all(sql, [id, date], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.length == 1);
      }
    });
  });
};

export const getActivitiesDone = (date) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id FROM ACT_DONE WHERE date = ?';
    db.all(sql, [date], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const insertDone = (id, date) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ACT_DONE (id, date) VALUES (?, ?)`;
    const params = [id, date];

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};