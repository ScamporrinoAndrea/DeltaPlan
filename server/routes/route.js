'use strict';
import { Router } from 'express';
import { getInventory, addToInventory, updateInventory, deleteFromInventory } from '../controllers/inventory.js';
import { getShoppingList, addToShoppingList, updateShoppingList, deleteFromShoppingList } from '../controllers/shoppingList.js';
import { getActivities, getActivity, addActivity, updateActivity, deleteActivity, setActivityDone } from '../controllers/activities.js';
import { getIngredients, getRecipes } from '../controllers/utils.js';


const router = Router();

/**
 * Ingredients routes
 */
router.get('/ingredients', getIngredients);

/**
 * Recipes routes
 */
router.get('/recipes', getRecipes);

/**
 * Inventory routes
 */
router.get('/inventory', getInventory);
router.get('/inventory/first-three', getInventory);
router.post('/inventory', addToInventory)
router.put('/inventory/:itemId', updateInventory);
router.delete('/inventory/:itemId', deleteFromInventory);

/**
 * Shopping List routes
 */
router.get('/shopping-list', getShoppingList);
router.get('/shopping-list/nearest-three', getShoppingList);
router.post('/shopping-list', addToShoppingList);
router.put('/shopping-list/:itemId', updateShoppingList);
router.delete('/shopping-list/:itemId', deleteFromShoppingList);
router.post('/shopping-list/bought/:itemId', deleteFromShoppingList);

/**
 * Activities routes
 */
router.get('/activities/first-three', getActivities);
router.get('/activities', getActivities);
router.get('/activities/:itemId', getActivity);
router.post('/activities', addActivity);
router.put('/activities/:itemId', updateActivity);
router.delete('/activities/:itemId', deleteActivity);
router.post('/activities/:itemId/done', setActivityDone);

export default router;