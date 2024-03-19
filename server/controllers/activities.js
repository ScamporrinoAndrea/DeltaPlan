'use strict';
import dayjs from 'dayjs';
import * as db from '../db/dao.js';
import { findOrCreateIngredient, filterRepeated, validateBody, checkTimeIntersections, findMissingIngredients } from './utils.js'


export const getActivities = async (req, res) => {
    try {
        const url = req.path;
        const pathSegments = url.split('/');
        const queryDate = req.query.date;
        const targetDate = queryDate ? dayjs(queryDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

        const activities = await db.getAllActivities(targetDate);
        const activitiesDone = await db.getActivitiesDone(targetDate);
        const filteredActivities = filterRepeated(activities, targetDate).map(({ date, ...other }) => other).map( activity =>  
            {
                const done = activitiesDone.some(doneAct => doneAct.id === activity.id);
                return { ...activity, done };
            });

        if (pathSegments.length === 3) {
            const currentTime = dayjs().format('HH:mm:ss');

            const result = filteredActivities
                .sort((a, b) => a.start_time.localeCompare(b.start_time, undefined, { numeric: true }))
                .filter(activity => activity.end_time >= currentTime)
                .slice(0, 3);

            res.status(200).json(result);
        } else {
            const result = filteredActivities.sort((a, b) => {
                return a.start_time.localeCompare(b.start_time, undefined, { numeric: true });
            });

            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const getActivity = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }

        const activity = await db.getActivityById(itemId);
        if (activity?.error) {
            return res.status(404).json(activity);
        }
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const addActivity = async (req, res) => {
    try {
        const valid = validateBody(req.body);

        if (valid && valid.error) {
            return res.status(400).json(valid);
        }

        const { date, start_time, end_time, repeat, type, title, notes, meal_type, recipes, other_ingredients } = req.body;

        const activitiesData = await db.getActivitiesData();
        if (checkTimeIntersections(date, start_time, end_time, repeat, activitiesData)) {
            return res.status(400).json({ error: "Time interval select has a conflict with another activity" });
        }
        const activity = {
            date: date,
            start_time: start_time,
            end_time: end_time,
            type: type,
            title: type === "general" ? title : null,
            notes: type === "general" ? (notes ?? null) : null,
            meal_type: type === "meal" ? meal_type[0] : null,
            repeat: repeat,
        }
        const activityId = await db.insertActivity(activity);
        if (type === 'meal') {
            for (const r of recipes) {
                const meal = {
                    activity_id: activityId,
                    recipe_id: r,
                    ingredient_id: null,
                    quantity: null,
                    unit_of_measure: null,
                }
                await db.insertMeal(meal);
            }
            const others = [];
            for (const item of other_ingredients) {
                const id = await findOrCreateIngredient(item.name);
                others.push({ ...item, id });
                const meal = {
                    activity_id: activityId,
                    recipe_id: null,
                    ingredient_id: id,
                    quantity: item.quantity,
                    unit_of_measure: item.unit_of_measure,
                }
                await db.insertMeal(meal);
            }
            const missing = await findMissingIngredients(recipes.length > 0, others.length > 0, activityId);
            for (const item of missing) {
                const toAdd = {
                    id: item.ingredient_id,
                    quantity: item.quantity,
                    unitOfMeasure: item.unit_of_measure ?? '',
                    buyByDate: date
                }
                await db.addShoppingListItem(toAdd);
            }
        }
        res.status(201).json({ message: `Activity ${activityId} has been successfully created.` });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const updateActivity = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }

        const valid = validateBody(req.body);

        if (valid && valid.error) {
            return res.status(400).json(valid);
        }

        const { date, start_time, end_time, repeat, type, title, notes, meal_type, recipes, other_ingredients } = req.body;

        const activitiesData = await db.getActivitiesData();
        const filtered = activitiesData.filter(item => item.id != itemId);
        if (checkTimeIntersections(date, start_time, end_time, repeat, filtered)) {
            return res.status(400).json({ error: "Time interval select has a conflict with another activity" });
        }

        const deleted = await db.deleteActivity(itemId);
        if (deleted?.error)
            return res.status(404).json(deleted);
        else if (deleted?.type === 'meal') {
            const toDelete = await db.getToDeleteIngredients(itemId);
            for (const item of toDelete) {
                if (item.op === 'delete') {
                    await db.deleteShoppingListItem(item.id);
                }
                else if (item.op === 'update') {
                    await db.updateShoppingListItem(item);
                }
            }
            const deleted = await db.deleteMeal(itemId);
            if (deleted?.error)
                return res.status(404).json(deleted);
        }

        const activity = {
            date: date,
            start_time: start_time,
            end_time: end_time,
            type: type,
            title: type === "general" ? title : null,
            notes: type === "general" ? (notes ?? null) : null,
            meal_type: type === "meal" ? meal_type[0] : null,
            repeat: repeat,
        }
        const activityId = await db.insertActivity(activity);
        if (type === 'meal') {
            for (const r of recipes) {
                const meal = {
                    activity_id: activityId,
                    recipe_id: r,
                    ingredient_id: null,
                    quantity: null,
                    unit_of_measure: null,
                }
                await db.insertMeal(meal);
            }
            const others = [];
            for (const item of other_ingredients) {
                const id = await findOrCreateIngredient(item.name);
                others.push({ ...item, id });
                const meal = {
                    activity_id: activityId,
                    recipe_id: null,
                    ingredient_id: id,
                    quantity: item.quantity,
                    unit_of_measure: item.unit_of_measure,
                }
                await db.insertMeal(meal);
            }
            const missing = await findMissingIngredients(recipes.length > 0, others.length > 0, activityId);
            for (const item of missing) {
                const toAdd = {
                    id: item.ingredient_id,
                    quantity: item.quantity,
                    unitOfMeasure: item.unit_of_measure ?? '',
                    buyByDate: date
                }
                await db.addShoppingListItem(toAdd);
            }
        }
        res.status(200).json({ message: `Activity has been successfully modified.` });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const deleteActivity = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }

        const deleted = await db.deleteActivity(itemId);
        if (deleted?.error)
            return res.status(404).json(deleted);
        else if (deleted?.type === 'meal') {
            const toDelete = await db.getToDeleteIngredients(itemId);
            for (const item of toDelete) {
                if (item.op === 'delete') {
                    await db.deleteShoppingListItem(item.id);
                }
                else if (item.op === 'update') {
                    await db.updateShoppingListItem(item);
                }
            }
            const deleted = await db.deleteMeal(itemId);
            if (deleted?.error)
                return res.status(404).json(deleted);
        }
        res.status(200).json({ message: `Activity ${itemId} has been deleted.` });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const setActivityDone = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { date } = req.body;

        if (!itemId || isNaN(itemId) || itemId < 1 || !Number.isInteger(Number(itemId))) {
            return res.status(400).json({ error: 'Invalid itemId. It should be a positive integer.' });
        }

        const dateToValid = dayjs(date);
        if (!dateToValid.isValid()) {
            return res.status(400).json({ error: 'Invalid date. It should be a valid date.' });
        }

        const activity = await db.getActivityById(itemId);
        if (activity?.error) {
            return res.status(404).json(activity);
        }
        const filteredActivities = filterRepeated([activity], date);
        if(filteredActivities.length == 0){
            return res.status(404).json({error: `Activity ${itemId} is not planned on ${date}.` })
        }
        const isDone = await db.IsActivityDone(itemId, date);
        if (isDone) {
            return res.status(400).json({ error: `Activity ${itemId} is already set as done` });
        }
        await db.insertDone(itemId, date);
        if (activity.type === 'meal') {
            const toDelete = await db.getToRemoveFromInventory(activity.id);
            for (const item of toDelete) {
                if (item.op === 'delete') {
                    await db.deleteInventoryItem(item.inv_id);
                }
                else if (item.op === 'update') {
                    await db.deleteInventoryItem(item.inv_id);
                    await db.addInventoryItem(item);
                }
            }
        }

        res.status(200).json({ message: `Activity ${itemId} has been set as done.` });
    } catch (error) {
        res.status(500).json(error.message);
    }
};