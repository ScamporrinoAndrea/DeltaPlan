'use strict';
import * as db from '../db/dao.js';
import { isValidDate, findOrCreateIngredient } from './utils.js'

export const getInventory = async (req, res) => {
    try {
        const url = req.path;
        const pathSegments = url.split('/');

        let inventory;
        if (pathSegments.length == 3) {
            inventory = await db.getFirstInventoryData();
        }
        else {
            inventory = await db.getInventoryData();
        }
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const addToInventory = async (req, res) => {
    try {
        const { name, quantity, unit_of_measure, expiration_date } = req.body;

        if (!name || name.trim() == "" || !quantity || isNaN(quantity)) {
            return res.status(400).json({ error: 'Name and quantity are required fields.' });
        }

        if (expiration_date && !isValidDate(expiration_date)) {
            return res.status(400).json({ error: 'Invalid expiration date. It should be a valid date and not before today.' });
        }

        const ingredient_id = await findOrCreateIngredient(name);
        const inventoryItem = {
            id: ingredient_id,
            quantity,
            unitOfMeasure: unit_of_measure ?? '',
            expirationDate: expiration_date || null,
        };
        const result = await db.addInventoryItem(inventoryItem);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const updateInventory = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }

        const { name, quantity, unit_of_measure, expiration_date } = req.body;

        if (!name || name.trim() == "" || !quantity || isNaN(quantity)) {
            return res.status(400).json({ error: 'Name and quantity are required fields.' });
        }

        if (expiration_date && !isValidDate(expiration_date)) {
            return res.status(400).json({ error: 'Invalid expiration date. It should be a valid date and not before today.' });
        }
        const ingredient_id = await findOrCreateIngredient(name);
        const inventoryItem = {
            id: ingredient_id,
            quantity,
            unitOfMeasure: unit_of_measure ?? '',
            expirationDate: expiration_date || null,
        };
        const result = await db.deleteInventoryItem(itemId);
        if (result?.error)
            return res.status(404).json(result)
        else {
            const result = await db.addInventoryItem(inventoryItem);
            if (result.error)
                return res.status(404).json(result);
            else {
                res.status(200).json(result);
            }
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const deleteFromInventory = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }
        const result = await db.deleteInventoryItem(itemId);
        if (result?.error)
            return res.status(404).json(result);
        else {
            res.status(200).json({ message: `Item ${itemId} has been deleted.` });
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};