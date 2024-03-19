BEGIN TRANSACTION;

-- Tables Creation -- 

CREATE TABLE IF NOT EXISTS INGREDIENT (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id INT,
    path VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS INVENTORY (
    id INTEGER PRIMARY KEY,
    ingredient_id INTEGER REFERENCES INGREDIENT(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    expiration_date VARCHAR(10) -- Nullable
);

CREATE TABLE IF NOT EXISTS SHOPPINGLIST (
    id INTEGER PRIMARY KEY,
    ingredient_id INTEGER REFERENCES INGREDIENT(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    buy_by_date VARCHAR(10) -- Nullable
);

CREATE TABLE IF NOT EXISTS ACTIVITY (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(10) NOT NULL, -- Assuming types like 'meal' or 'general'
    title VARCHAR(50), -- Nullable
    notes TEXT, -- Nullable
    meal_type CHAR(1) CHECK(meal_type IN ('B', 'L', 'D', 'S')), -- Nullable, can be 'B', 'L', 'D', 'S', or NULL
    repeat CHAR(1) CHECK(repeat IN ('n', 'd', 'w', 'm')) DEFAULT 'n' -- Assuming repeat could be 'none', 'daily', 'weekly', 'monthly' 
);

CREATE TABLE IF NOT EXISTS ACT_DONE (
    id INTEGER NOT NULL REFERENCES ACTIVITY(ID),
    date DATE NOT NULL,
    PRIMARY KEY (id, date)
);

CREATE TABLE IF NOT EXISTS MEAL (
    id INTEGER PRIMARY KEY,
    activity_id INTEGER REFERENCES ACTIVITY(id),
    recipe_id INTEGER REFERENCES RECIPE(id),
    ingredient_id INTEGER REFERENCES INGREDIENT(id),
    quantity DECIMAL(10, 2),
    unit_of_measure VARCHAR(20),
    UNIQUE (activity_id, recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS RECIPE (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type CHAR(1) CHECK(type IN ('B', 'L', 'D', 'S')), -- Assuming types like 'breakfast', 'lunch', 'dinner', 'snack'
    description TEXT,
    path VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS RECIPE_ING (
    recipe_id INTEGER REFERENCES RECIPE(id),
    ingredient_id INTEGER REFERENCES INGREDIENT(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id)
);



-- Tables Insertions --

-- Add ingredients here
INSERT INTO INGREDIENT (name, user_id, path) VALUES
    ('Flour', NULL, 'ingredients/Flour.jpg'), --1
    ('Sugar', NULL, 'ingredients/Sugar.webp'), --2
    ('Salt', NULL, 'ingredients/Salt.jpg'), --3
    ('Egg', NULL, 'ingredients/Egg.jpg'), --4
    ('Milk', NULL, 'ingredients/Milk.jpg'), --5
    ('Bananas', NULL, 'ingredients/Bananas.jpg'), --6
    ('Mixed Nuts', NULL, 'ingredients/Mixed_Nuts.jpg'), --7
    ('Avocado', NULL, 'ingredients/Avocado.jpg'), --8
    ('Blueberries', NULL, 'ingredients/Blueberries.jpg'), --9
    ('Granola', NULL, 'ingredients/Granola.jpg'), --10
    ('Greek Yogurt', NULL, 'ingredients/Greek_Yogurt.webp'), --11
    ('Cherry Tomatoes', NULL, 'ingredients/Cherry_Tomatoes.webp'), --12
    ('Fresh Mozzarella', NULL, 'ingredients/Fresh_Mozzarella.webp'), --13
    ('Basil', NULL, 'ingredients/Basil.jpg'), --14
    ('Carrots', NULL, 'ingredients/Carrots.webp'), --15
    ('Cucumbers', NULL, 'ingredients/Cucumbers.png'), --16
    ('Hummus', NULL, 'ingredients/Hummus.jpg'), --17
    ('Pretzels', NULL, 'ingredients/Pretzels.webp'), --18
    ('Cinnamon Sugar', NULL, 'ingredients/Cinnamon_Sugar.jpg'), --19
    ('Dried Fruits', NULL, 'ingredients/Dried_Fruits.jpg'), --20
    ('Chocolate', NULL, 'ingredients/Chocolate.jpg'), --21
    ('Chicken Strips', NULL, 'ingredients/Chicken_Strips.jpg'), --22
    ('Quinoa', NULL, 'ingredients/Quinoa.webp'), --23
    ('Turkey Slices', NULL, 'ingredients/Turkey_Slices.jpg'), --24
    ('Bacon', NULL, 'ingredients/Bacon.png'), --25
    ('Lettuce', NULL, 'ingredients/Lettuce.jpg'), --26
    ('Tomato', NULL, 'ingredients/Tomato.webp'), --27
    ('Tofu', NULL, 'ingredients/Tofu.jpg'), --28
    ('Broccoli', NULL, 'ingredients/Broccoli.jpg'), --29
    ('Bell Peppers', NULL, 'ingredients/Bell_Peppers.jpg'), --30
    ('Romaine Lettuce', NULL, 'ingredients/Romain_Lettuce.jpg'), --31
    ('Croutons', NULL, 'ingredients/Croutons.webp'), --32
    ('Parmesan Cheese', NULL, 'ingredients/Parmesan_Cheese.jpg'), --33
    ('Spaghetti', NULL, 'ingredients/Spaghetti.jpg'), --34
    ('Ground Beef', NULL, 'ingredients/Ground_Beef.webp'), --35
    ('Salmon', NULL, 'ingredients/Salmon.webp'), --36
    ('Lemon juice', NULL, 'ingredients/Lemon_Juice.webp'), --37
    ('Dill', NULL, 'ingredients/Dill.png'), --38
    ('Black Beans', NULL, 'ingredients/Black_Beans.webp'), --39
    ('Corn', NULL, 'ingredients/Corn.jpg'), --40
    ('Creamy Cheese', NULL, 'ingredients/Creamy_Cheese.jpg'), --41
    ('Yeast', NULL, 'ingredients/Yeast.jpg'), --42
    ('Bread', NULL, 'ingredients/Bread.jpg'), --43
    ('Olive Oil', NULL, 'ingredients/Olive_Oil.jpg'), --44
    ('Apple', NULL, 'ingredients/Apple.jpg'), --45
    ('Kiwi', NULL, 'ingredients/Kiwi.jpg'), --46
    ('Strawberry', NULL, 'ingredients/Strawberry.jpg'), --47
    ('Spinach', NULL, 'ingredients/Spinach.jpg'), --48
    ('Artichokes', NULL, 'ingredients/Artichokes.jpg'), --49
    ('Tomato Sauce', NULL, 'ingredients/Tomato_Sauce.jpg'), --50
    ('Linguine', NULL, 'ingredients/Linguine.jpg'), --51
    ('Pesto', NULL, 'ingredients/Pesto.webp'), --52
    ('Mushrooms', NULL, 'ingredients/Mushrooms.jpg'), --53
    ('Rice', NULL, 'ingredients/Rice.jpg'), --54
    ('Shrimp', NULL, 'ingredients/Shrimp.jpg'), --55
    ('Garlic', NULL, 'ingredients/Garlic.webp'), --56
    ('White Wine', NULL, 'ingredients/White_Wine.webp'), --57
    ('Tortillas', NULL, 'ingredients/Tortillas.jpg'); --58

-- Add new recipes here
-- Breakfast Recipes
INSERT INTO RECIPE (name, type, description, path) VALUES
    ('Classic Pancakes', 'B', 'Fluffy and delicious pancakes topped with maple syrup.', 'recipes/recipe1.jpg'),
    ('Avocado and Egg Toast', 'B', 'Healthy and tasty breakfast with mashed avocado and poached eggs.', 'recipes/recipe2.jpg'),
    ('Blueberry Yogurt Parfait', 'B', 'Layered parfait with Greek yogurt, fresh blueberries, and granola.', 'recipes/recipe3.jpg'),
    ('Banana Nut Muffins', 'B', 'Moist and nutty muffins made with ripe bananas and chopped nuts.', 'recipes/recipe4.jpg'),
    ('Greek Yogurt Pancakes', 'B', 'Light and fluffy pancakes made with Greek yogurt.', 'recipes/recipe5.webp'),
    ('Vegetable Omelette', 'B', 'Healthy omelette loaded with assorted vegetables.', 'recipes/recipe6.jpg');

-- Snack Recipes
INSERT INTO RECIPE (name, type, description, path) VALUES
    ('Caprese Skewers', 'S', 'Refreshing snack with cherry tomatoes, fresh mozzarella, and basil.', 'recipes/recipe7.jpg'),
    ('Hummus with Veggie Sticks', 'S', 'Homemade hummus served with colorful vegetable sticks.', 'recipes/recipe8.jpg'),
    ('Cinnamon Sugar Pretzels', 'S', 'Soft pretzels baked to perfection, coated in cinnamon sugar.', 'recipes/recipe9.jpg'),
    ('Trail Mix', 'S', 'Energy-packed mix of nuts, dried fruits, and chocolate.', 'recipes/recipe10.jpg'),
    ('Fruit Salsa with Cinnamon Chips', 'S', 'Colorful fruit salsa served with crispy cinnamon chips.', 'recipes/recipe11.jpg'),
    ('Spinach and Artichoke Dip', 'S', 'Creamy dip with spinach, artichokes, and melted cheese.', 'recipes/recipe12.jpg');

-- Lunch Recipes
INSERT INTO RECIPE (name, type, description, path) VALUES
    ('Chicken Caesar Salad', 'L', 'Classic Caesar salad topped with grilled chicken strips.', 'recipes/recipe13.jpg'),
    ('Quinoa Salad with Roasted Vegetables', 'L', 'Nutrient-rich quinoa salad with a medley of roasted veggies.', 'recipes/recipe14.jpg'),
    ('Turkey Club Sandwich', 'L', 'Triple-decker sandwich with turkey, bacon, lettuce, and tomato.', 'recipes/recipe15.jpg'),
    ('Vegetarian Buddha Bowl', 'L', 'Wholesome bowl with a mix of grains, veggies, and a flavorful dressing.', 'recipes/recipe16.jpg'),
    ('Mediterranean Spaghetti', 'L', 'Spaghetti with tomato sauce and basil.', 'recipes/recipe17.jpg'),
    ('Linguine with pesto', 'L', 'Linguine with pesto and basil.', 'recipes/recipe18.jpg');

-- Dinner Recipes
INSERT INTO RECIPE (name, type, description, path) VALUES
    ('Spaghetti Bolognese', 'D', 'Hearty pasta dish with a rich and savory meat sauce.', 'recipes/recipe19.png'),
    ('Grilled Salmon with Lemon-Dill Sauce', 'D', 'Deliciously grilled salmon served with a zesty lemon-dill sauce.', 'recipes/recipe20.jpg'),
    ('Vegetarian Stir-Fry', 'D', 'Colorful stir-fry with tofu, broccoli, bell peppers, and a savory sauce.', 'recipes/recipe21.jpg'),
    ('Beef and Mushroom Risotto', 'D', 'Creamy risotto with tender beef and flavorful mushrooms.', 'recipes/recipe22.jpg'),
    ('Shrimp Scampi Pasta', 'D', 'Garlicky shrimp served over a bed of pasta with a lemony white wine sauce.', 'recipes/recipe23.webp'),
    ('Vegetarian Enchiladas', 'D', 'Flavorful vegetarian enchiladas with black beans, corn, and cheese.', 'recipes/recipe24.jpg');

-- Add ingredients for recipe here
INSERT INTO RECIPE_ING (recipe_id, ingredient_id, quantity, unit_of_measure) VALUES
    -- Breakfast Recipes
    (1, 1, 100, 'g'),   -- Classic Pancakes: 100 grams of Flour
    (1, 2, 30, 'g'),   -- Classic Pancakes: 30 grams of Sugar
    (1, 3, 1, 'g'),     -- Classic Pancakes: a pinch of salt
    (1, 4, 3, ''),          -- Classic Pancakes: 3 Eggs
    (1, 42, 5, 'g'),    -- Classic Pancakes: 5 grams of yeast
    (1, 5, 50, 'ml'), -- Classic Pancakes: 50 milliliters of Milk
    (2, 43, 50, 'g'),   -- Avocado and Egg Toast: 2 slices of Bread
    (2, 8, 1, ''),    -- Avocado and Egg Toast: 1 whole Avocado
    (2, 4, 2, ''),     -- Avocado and Egg Toast: 2 Eggs
    (3, 11, 150, 'g'),      -- Blueberry Yogurt Parfait: 1 cup of Yogurt
    (3, 9, 100, 'g'),      -- Blueberry Yogurt Parfait: 1 cup of Blueberries
    (3, 10, 100, 'g'),      -- Blueberry Yogurt Parfait: 1 cup of Granola
    (4, 1, 150, 'g'),      -- Banana Nut Muffins: 150 grams of Flour
    (4, 2, 75, 'g'),       -- Banana Nut Muffins: 75 grams of Sugar
    (4, 4, 3, ''),          -- Banana Nut Muffins: 3 Eggs
    (4, 7, 80, 'g'),       -- Banana Nut Muffins: 80 grams of Mixed Nuts
    (4, 6, 4, ''),     -- Banana Nut Muffins: 4 Bananas
    (5, 1, 100, 'g'),   -- Greek Yogurt Pancakes: 120 grams of Flour
    (5, 2, 30, 'g'),   -- Greek Yogurt Pancakes: 30 grams of Sugar
    (5, 3, 1, 'g'),     -- Greek Yogurt Pancakes: a pinch of salt
    (5, 4, 3, ''),          -- Greek Yogurt Pancakes: 3 Eggs
    (5, 42, 5, 'g'),    -- Greek Yogurt Pancakes: 5 grams of yeast
    (5, 11, 100, 'g'), -- Greek Yogurt Pancakes: 100 grams of yogurt
    (6, 28, 150, 'g'),   -- Vegetable Omelette: 150 grams of Tofu
    (6, 12, 120, 'g'),   -- Vegetable Omelette: 120 grams of Tomato
    (6, 30, 80, 'g'),     -- Vegetable Omelette: 80 grams of Bell Peppers
    (6, 4, 3, ''),          -- Vegetable Omelette: 3 Eggs
    (6, 29, 100, 'g'),    -- Vegetable Omelette: 100 grams of Broccoli
    (6, 44, 35, 'ml'), -- Vegetable Omelette: 35 milliliters of olive oil
    (7, 12, 125, 'g'),      -- Caprese Skewers: 125 grams of Cherry Tomatoes
    (7, 13, 125, 'g'),      -- Caprese Skewers: 125 grams of Fresh Mozzarella
    (7, 14, 50, 'g'),      -- Caprese Skewers: 50 grams of Basil
    (7, 3, 1, 'g'),      -- Caprese Skewers: a pinch of Salt
    (8, 15, 1, ''),    -- Hummus with Veggie Sticks: 1 whole Carrot
    (8, 16, 1, ''),    -- Hummus with Veggie Sticks: 1 whole Cucumber
    (8, 17, 120, 'g'),      -- Hummus with Veggie Sticks: 120 grams of Hummus
    (9, 18, 150, 'g'),  -- Cinnamon Sugar Pretzels: 1 package of Pretzels
    (9, 19, 60, 'g'),      -- Cinnamon Sugar Pretzels: 1 cup of Cinnamon Sugar
    (10, 7, 25, 'g'),      -- Trail Mix: 25 grums of Nuts
    (10, 20, 80, 'g'),      -- Trail Mix: 80 grams of dried fruits
    (10, 21, 30, 'g'),      -- Trail Mix: 30 grams of chocolate 
    (11, 45, 2, ''),      -- Fruit Salsa with Cinnamon Chips: 2 apples
    (11, 47, 150, 'g'),      -- Fruit Salsa with Cinnamon Chips: 150 grams of strawberries
    (11, 46, 2, ''),      -- Fruit Salsa with Cinnamon Chips: 2 kiwis 
    (11, 37, 25, 'ml'),      -- Fruit Salsa with Cinnamon Chips: 25 milliliters of lemon juice
    (11, 19, 8, 'g'),      -- Fruit Salsa with Cinnamon Chips: 8 grams of cinnamon sugar
    (12, 48, 150, 'g'),      -- Spinach and Artichoke Dip: 150 grams of spinach
    (12, 49, 100, 'g'),      -- Spinach and Artichoke Dip: 100 grams artichokes
    (12, 33, 80, 'g'),      -- Spinach and Artichoke Dip: 80 grams of parmesan cheese
    (12, 41, 100, 'g'),      -- Spinach and Artichoke Dip: 100 grams of creamy cheese
    (12, 3, 1, 'g'),      -- Spinach and Artichoke Dip: a pinch of salt
    (13, 22, 180, 'g'),      
    (13, 31, 120, 'g'),      
    (13, 32, 100, 'g'),      
    (13, 33, 50, 'g'),   
    (13, 44, 20, 'ml'),      
    (13, 3, 1, 'g'),      
    (13, 37, 20, 'ml'), 
    (14, 23, 140, 'g'),      
    (14, 12, 80, 'g'),      
    (14, 30, 80, 'g'),
    (15, 43, 100, 'g'),      
    (15, 24, 100, 'g'),      
    (15, 27, 50, 'g'),
    (15, 26, 50, 'g'),
    (16, 23, 100, 'g'),      
    (16, 26, 80, 'g'),      
    (16, 39, 80, 'g'),    
    (16, 8, 1, ''),      
    (16, 12, 80, 'g'),
    (16, 40, 50, 'g'),
    (17, 34, 120, 'g'),      
    (17, 50, 20, 'ml'),       
    (17, 14, 5, 'g'),
    (17, 44, 20, 'ml'),      
    (17, 33, 30, 'g'),
    (18, 51, 120, 'g'),      
    (18, 52, 50, 'g'),      
    (18, 14, 5, 'g'), 
    (18, 33, 30, 'g'),
    (19, 34, 120, 'g'),      
    (19, 50, 30, 'ml'),      
    (19, 35, 50, 'g'),
    (20, 36, 50, 'g'),      
    (20, 37, 10, 'ml'),       
    (20, 44, 10, 'ml'),  
    (20, 38, 5, 'g'),
    (21, 23, 100, 'g'),      
    (21, 30, 50, 'g'),      
    (21, 28, 50, 'g'),      
    (21, 29, 50, 'g'),      
    (21, 44, 10, 'ml'),
    (22, 54, 120, 'g'),      
    (22, 35, 80, 'g'),      
    (22, 53, 50, 'g'), 
    (22, 44, 10, 'ml'),
    (23, 51, 120, 'g'),      
    (23, 55, 90, 'g'),      
    (23, 56, 10, 'g'),
    (23, 37, 10, 'ml'),      
    (23, 57, 20, 'ml'),       
    (24, 58, 100, 'g'),
    (24, 41, 100, 'g'),      
    (24, 39, 50, 'g'),      
    (24, 40, 50, 'g');                              

-- Add Inventory here
INSERT INTO INVENTORY (ingredient_id, quantity, unit_of_measure, expiration_date)
VALUES
    (3, 500, 'g', NULL),
    (4, 12, '', '2024-02-10'),
    (5, 1, 'l', '2023-02-30'),
    (14, 300, 'g', '2024-02-22'),
    (21, 200, 'g', '2024-02-01'),
    (33, 150, 'g', '2024-02-15'),
    (23, 300, 'g', '2024-02-05'),
    (35, 250, 'ml', '2024-02-10'),
    (44, 30, 'ml', '2024-02-20'),
    (28, 300, 'g', '2024-02-08'),
    (8, 2, '', '2024-02-20'),
    (10, 200, 'g', '2024-02-24'),
    (17, 300, 'g', '2024-02-22'),
    (24, 300, 'g', '2024-02-23'),
    (43, 125, 'g', '2024-02-21');

-- Add Shopping List here
INSERT INTO SHOPPINGLIST (ingredient_id, quantity, unit_of_measure, buy_by_date)
VALUES
    (1, 500, 'g', '2024-02-28'),
    (2, 300, 'g', '2024-03-05'),
    (6, 3, '', '2024-02-25'),    
    (7, 150, 'g', '2024-03-02'),
    (9, 50, 'g', '2024-02-18'),
    (11, 200, 'g', '2024-02-15'),
    (15, 2, '', '2024-02-28'),
    (26, 50, 'g', '2024-02-28'),   
    (27, 2, '', '2024-02-28');

-- Add Activities here  
INSERT INTO ACTIVITY (date, start_time, end_time, type, title, notes, meal_type, repeat)
VALUES
    ('2023-12-28', '08:00:00', '09:00:00', 'meal', NULL, NULL, 'B', 'd'),
    ('2023-12-28', '12:30:00', '13:30:00', 'meal', NULL, NULL, 'L', 'w'),
    ('2023-12-28', '18:00:00', '19:00:00', 'general', 'Gym', 'Leg day', 'n'),
    ('2023-12-28', '19:30:00', '20:30:00', 'meal', NULL, NULL, 'D','n');

INSERT INTO MEAL (activity_id, recipe_id, ingredient_id, quantity, unit_of_measure)
VALUES
    (1, 1, NULL, NULL, NULL),
    (1, 2, NULL, NULL, NULL),
    (1, NULL, 13, 50, 'g'),
    (2, NULL, 24, 70, 'g'),
    (2, NULL, 26, 50, 'g'),
    (2, NULL, 43, 100, 'g'),
    (4, 20, NULL, NULL, NULL); 