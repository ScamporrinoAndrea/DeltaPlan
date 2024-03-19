/**
 * All the API calls
 */
import dayjs from 'dayjs';
const URL = import.meta.env.VITE_NET_IP ? `http://${import.meta.env.VITE_NET_IP}:3001/` : `http://localhost:3001/`;

function callAPI(endpoint, method, body) {
    let options = {};

    if (method == 'POST' || method == 'PUT' || method == 'DELETE') {
        options.method = method;
        if (body != null) {
            options.headers = {};
            if (body instanceof FormData) {
                options.headers['enctype'] = 'multipart/form-data';
            } else {
                options.headers['Content-Type'] = 'application/json';
            }
            options.body = body;
        }
    }
    return new Promise((resolve, reject) => {
        fetch(URL + 'api' + endpoint, options)
            .then((response) => {
                if (response.ok) {
                    response
                        .json()
                        .then((res) => resolve(res))
                        .catch(() => {
                            reject(new Error('Cannot parse server response.'));
                        });
                } else {
                    response
                        .json() // analyze the cause of error
                        .then((message) => {
                            reject(message);
                        }) // error message in the response body
                        .catch(() => {
                            reject(new Error('Cannot parse server response2.'));
                        });
                }
            })
            .catch(() => {
                reject(new Error('Cannot communicate with the server.'));
            }); // connection errors
    });
}

function getFirstThreeInventory() {
    return callAPI('/inventory/first-three', 'GET', null);
}

function getFirstThreeShoppingList() {
    return callAPI('/shopping-list/nearest-three', 'GET', null);
}

function bought(id) {
    return callAPI('/shopping-list/bought/' + id, 'POST', null);
}

function getShoppingListElements() {
    return callAPI('/shopping-list', 'GET', null);
}

function deleteShoppingListElement(id) {
    return callAPI('/shopping-list/' + id, 'DELETE', null);
}

function deleteInventoryItem(id) {
    return callAPI('/inventory/' + id, 'DELETE', null)
}

function getFirstThreeActivities() {
    return callAPI('/activities/first-three', 'GET', null);
}

function getAllActivitiesofDay(date) {
    return callAPI('/activities?date=' + date, 'GET', null);
}

function getAllInventory() {
    return callAPI('/inventory', 'GET', null);
}

function getAllIngredients() {
    return callAPI('/ingredients', 'GET', null);
}

function updateItemShoppingList(id, object) {
    let body = JSON.stringify(Object.assign({}, object));
    return callAPI('/shopping-list/' + id, 'PUT', body);
}

function addToShoppingList(object) {
    let body = JSON.stringify(Object.assign({}, object));
    return callAPI('/shopping-list', 'POST', body);
}
function updateItemInventory(id, object) {
    let body = JSON.stringify(Object.assign({}, object));
    return callAPI('/inventory/' + id, 'PUT', body);
}
function addToInventory(object) {
    let body = JSON.stringify(Object.assign({}, object));
    return callAPI('/inventory', 'POST', body);
}
function getMealTypeRecipes(mealType) {
    return callAPI('/recipes?meal=' + mealType, 'GET', null);
}

function addActivity(activity) {
    return callAPI('/activities', 'POST', JSON.stringify(activity));
}

function deleteActivity(id) {
    return callAPI('/activities/' + id, 'DELETE', null);
}

function getActivity(id) {
    return callAPI('/activities/' + id, 'GET', null);
}

function updateActivity(id, activity) {
    return callAPI('/activities/' + id, 'PUT', JSON.stringify(activity));
}

function doneActivity(id, date) {
    return callAPI('/activities/' + id + '/done', 'POST', JSON.stringify(date));
}

const API = {
    getFirstThreeInventory,
    getFirstThreeShoppingList,
    bought,
    getShoppingListElements,
    deleteShoppingListElement,
    getFirstThreeActivities,
    getAllActivitiesofDay,
    getAllInventory,
    getAllIngredients,
    addToShoppingList,
    getMealTypeRecipes,
    updateItemShoppingList,
    deleteInventoryItem,
    updateItemInventory,
    addToInventory,
    addActivity,
    deleteActivity,
    getActivity,
    updateActivity,
    URL,
    doneActivity,
};
export default API;