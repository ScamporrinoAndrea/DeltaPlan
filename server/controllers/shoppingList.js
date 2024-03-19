'use strict';
import * as db from '../db/dao.js';
import { isValidDate, findOrCreateIngredient } from './utils.js'

export const getShoppingList = async (req, res) => {
    try {
        const url = req.path;
        const pathSegments = url.split('/');

        let list = [];
        if (pathSegments.length == 3) {
            list = await db.getShoppingListNearestData();
        }
        else {
            list = await db.getShoppingListData();
        }
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const addToShoppingList = async (req, res) => {
    try {
        const { name, quantity, unit_of_measure, buy_by_date } = req.body;

        if (!name || name.trim() == "" || !quantity || isNaN(quantity)) {
            return res.status(400).json({ error: 'Name and quantity are required fields.' });
        }

        if (buy_by_date && !isValidDate(buy_by_date)) {
            return res.status(400).json({ error: 'Invalid buy by date. It should be a valid date and not before today.' });
        }

        const ingredient_id = await findOrCreateIngredient(name);
        const shoppingListItem = {
            id: ingredient_id,
            quantity,
            unitOfMeasure: unit_of_measure ?? '',
            buyByDate: buy_by_date || null,
        };
        const result = await db.addShoppingListItem(shoppingListItem);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const updateShoppingList = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }

        const { name, quantity, unit_of_measure, buy_by_date } = req.body;

        if (!name || name.trim() == "" || !quantity || isNaN(quantity)) {
            return res.status(400).json({ error: 'Name and quantity are required fields.' });
        }

        if (buy_by_date && !isValidDate(buy_by_date)) {
            return res.status(400).json({ error: 'Invalid buy by date. It should be a valid date and not before today.' });
        }
        const ingredient_id = await findOrCreateIngredient(name);
        const shoppingListItem = {
            id: itemId,
            ingredientId: ingredient_id,
            quantity,
            unitOfMeasure: unit_of_measure ?? '',
            buyByDate: buy_by_date || null,
        };
        const result = await db.updateShoppingListItem(shoppingListItem);
        if (result.error)
            return res.status(404).json(result);
        else {
            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const deleteFromShoppingList = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }
        const url = req.path;
        const pathSegments = url.split('/');

        const deleted = await db.deleteShoppingListItem(itemId);
        if (deleted?.error)
            res.status(404).json(deleted);
        else if(pathSegments.length == 4){
            const result = await db.addInventoryItem(deleted);
            result.message = `Shopping List Item ${itemId} eliminated, ${result.message}`;
            res.status(200).json(result);
        }
        else{
            res.status(200).json({ message: `Item ${itemId} has been deleted.` });
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};