'use strict';
import * as db from '../db/dao.js';
import dayjs from 'dayjs';

const conversionMap = {
    "g": 1,
    "kg": 1000,
    "ml": 1,
    "l": 1000,
    "": 1,
};

export const isValidDate = (dateString) => {
    const date = dayjs(dateString);
    const currentDate = dayjs();

    return date.isValid() && !date.isBefore(currentDate, 'day');
};

const isValidTime = (time) => {
    const timeRegex = /^(0\d|1\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    return typeof time === 'string' && timeRegex.test(time);
};

export const computeFinalDate = (date1, date2) => {
    if (date1 !== null && date2 !== null) {
        const dayJs1 = dayjs(date1);
        const dayJs2 = dayjs(date2);
        return dayJs1.isBefore(dayJs2) ? date1 : date2;
    } else {
        return date1 || date2;
    }
}

export const findOrCreateIngredient = async (name) => {
    try {
        const existingId = await db.findIngredientByName(name);
        if (existingId) {
            return existingId;
        } else {
            const newId = await db.addIngredient(name);
            return newId;
        }
    } catch (error) {
        throw new Error(`Error finding or creating item: ${error.message}`);
    }
};

export const getIngredients = async (req, res) => {
    try {
        const ingredients = await db.getAllIngredients();
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const getRecipes = async (req, res) => {
    try {
        if (!req.query.meal) {
            return res.status(400).json({ error: "Meal parameter is required." });
        }
        const meal = req.query.meal.charAt(0).toUpperCase();
        const recipes = await db.getAllRecipes(meal);
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const filterRepeated = (activities, target) => {
    const targetDate = dayjs(target);
    return activities.filter(activity => {
        const activityDate = dayjs(activity.date);
        if (activityDate.isSame(targetDate, 'day')) {
            return true;
        }
        else if (activity.repeat === 'd') {
            return true;
        }
        else if (activity.repeat === 'w') {
            return activityDate.day() === targetDate.day();
        }
        else if (activity.repeat === 'm') {
            return activityDate.date() === targetDate.date();
        }
        return false;
    });
};

export const isPresent = (q1, u1, q2, u2) => {
    if (q2 === null) {
        return false;
    }

    const val1 = q1 * conversionMap[u1];
    const val2 = q2 * conversionMap[u2];

    return val1 <= val2;
}

export const addThenConvert = (toAdd, stored) => {
    let toAddConverted = toAdd.quantity * conversionMap[toAdd.unitOfMeasure];
    let storedConverted = stored.quantity * conversionMap[stored.unit_of_measure];

    let quantityResult = toAddConverted + storedConverted;
    let unitOfMeasureResult = "";

    if (toAdd.unitOfMeasure === "g" || toAdd.unitOfMeasure === "kg") {
        if (quantityResult >= 1000) {
            unitOfMeasureResult = "kg";
            quantityResult = quantityResult / 1000;
        }
        else {
            unitOfMeasureResult = "g";
        }
    }
    else if (toAdd.unitOfMeasure === "ml" || toAdd.unitOfMeasure === "l") {
        if (quantityResult >= 1000) {
            unitOfMeasureResult = "l";
            quantityResult = quantityResult / 1000;
        } else {
            unitOfMeasureResult = "ml";
        }
    }

    return {
        ...stored,
        quantity: quantityResult.toFixed(1),
        unit_of_measure: unitOfMeasureResult,
    };
};

export const subThenConvert = (toSub, stored) => {
    let toSubConverted = toSub.quantity * conversionMap[toSub.unitOfMeasure];
    let storedConverted = stored.quantity * conversionMap[stored.unit_of_measure];
    
    let quantityResult = storedConverted - toSubConverted;
    let unitOfMeasureResult = "";

    if (toSub.unitOfMeasure === "g" || toSub.unitOfMeasure === "kg") {
        if (quantityResult >= 1000) {
            unitOfMeasureResult = "kg";
            quantityResult = quantityResult / 1000;
        }
        else {
            unitOfMeasureResult = "g";
        }
    }
    else if (toSub.unitOfMeasure === "ml" || toSub.unitOfMeasure === "l") {
        if (quantityResult >= 1000) {
            unitOfMeasureResult = "l";
            quantityResult = quantityResult / 1000;
        } else {
            unitOfMeasureResult = "ml";
        }
    }

    return {
        ...stored,
        quantity: quantityResult.toFixed(1),
        unit_of_measure: unitOfMeasureResult,
    };
};

export const validateBody = (body) => {

    // Valid start and end time
    if ((!isValidTime(body.start_time) || !isValidTime(body.end_time)) || body.start_time >= body.end_time) {
        return ({ error: 'Invalid time. It should be a valid time and start should be before the end one.' });
    }

    // Valid date
    if (!isValidDate) {
        return ({ error: 'Invalid expiration date. It should be a valid date and not before today.' });
    }

    // Verify that the date + time is after now
    const dateTimeString = `${body.date} ${body.start_time}`;
    const myDateTime = dayjs(dateTimeString, { format: 'YYYY-MM-DD HH:mm:ss' });

    const now = dayjs();
    if (myDateTime.isBefore(now)) {
        return ({ error: 'Invalid combination of date and time. It could not insert an activity in the past.' });
    };

    //Verify repeat
    const validRepeat = ["n", "d", "w", "m"];
        if (typeof body.repeat !== 'string' || !validRepeat.includes(body.repeat)) {
            return { error: 'Invalid repeat. It should be a string and one of: n, d, w, m.' };
        }

    // Verify type = 'general' constraints
    if (body.type === 'general') {
        if (typeof body.title !== 'string' || body.title.trim() === '') {
            return { error: 'Invalid title for type "general". It should be a non-null string.' };
        }
        if (body.notes && typeof body.notes !== 'string') {
            return { error: 'Invalid notes for type "general". It should be a string or null.' };
        }
    }
    // Verify type = 'meal' constraints
    else if (body.type === 'meal') {
        const validMealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
        if (typeof body.meal_type !== 'string' || !validMealTypes.includes(body.meal_type)) {
            return { error: 'Invalid meal_type for type "meal". It should be a string and one of: Breakfast, Lunch, Dinner, Snack.' };
        }
        if (!Array.isArray(body.recipes) || !body.recipes.every(id => !isNaN(id) && id >= 1)) {
            return { error: 'Invalid recipes for type "meal". It should be an array containing ids greater than or equal to 1.' };
        }
        if (
            !Array.isArray(body.other_ingredients) || !body.other_ingredients.every(
                ingredient =>
                    typeof ingredient === 'object' &&
                    ingredient.hasOwnProperty('name') &&
                    typeof ingredient.name === 'string' &&
                    ingredient.name.trim() !== '' &&
                    ingredient.hasOwnProperty('quantity') &&
                    !isNaN(ingredient.quantity) &&
                    ingredient.quantity >= 0 &&
                    ingredient.hasOwnProperty('unit_of_measure') &&
                    typeof ingredient.unit_of_measure === 'string'
            )
        ) {
            return { error: 'Invalid other_ingredients for type "meal". It should be an array containing objects with valid properties.' };
        }
    }
    else {
        return { error: 'Invalid meal_type. It should be either meal or general' };
    }
}

export const checkTimeIntersections = (date, start, end, repeat, actData) => {
    const targetDate = dayjs(date);
    if (repeat === "n") {
        for (const a of actData) {
            const aDate = dayjs(a.date);
            if (targetDate.isSame(aDate) || targetDate.isAfter(aDate) && (a.repeat === "d" || (a.repeat === "w" && aDate.day() === targetDate.day()) || (a.repeat === "m" && aDate.date() === targetDate.date()))) {
                if (!(end < a.start_time || a.end_time < start))
                    {
                        return true;
                    }
            }
        }
    } else if (repeat === "d") {
        for (const a of actData) {
            const aDate = dayjs(a.date);
            if (!targetDate.isAfter(aDate) || (a.repeat == "d" || a.repeat == "w" || a.repeat == "m")) {
                if (!(end < a.start_time || a.end_time < start))
                    return true;
            }
        }
    } else if (repeat === "w") {
        for (const a of actData) {
            const aDate = dayjs(a.date);
            if (targetDate.isSame(aDate) || (targetDate.isBefore(aDate) && targetDate.day() === aDate.day()) || (a.repeat == "d" || (a.repeat == "w" && aDate.day() === targetDate.day()) || a.repeat == "m")) {
                if (!(end < a.start_time || a.end_time < start))
                    return true;
            }
        }
    } else if (repeat === "m") {
        for (const a of actData) {
            const aDate = dayjs(a.date);
            if (targetDate.isSame(aDate) || (targetDate.isBefore(aDate) && targetDate.date() === aDate.date()) || (a.repeat == "d" || (a.repeat === "m" && aDate.date() === targetDate.date()) || a.repeat == "w")) {
                if (!(end < a.start_time || a.end_time < start))
                    return true;
            }
        }
    }
    return false;
}

export const findMissingIngredients = async (recipes, others, id) => {
    let res = [];
    if (recipes) {
        const tmp = await db.getRecipesMissingIngredients(id);
        res = res.concat(tmp);
    }
    if (others) {
        const tmp = await db.getOtherMissingIngredients(id);
        res = res.concat(tmp);
    }
    return res;
};