import mysql from "mysql2/promise";

// Kör node.js createdb flr att sätta upp databasen.

// Replace these with your actual MySQL credentials
const dbConfig = {
  host: "localhost",
  user: "root", // MySQL username
  password: "", // MySQL password
  // database will be specified later
};

// Name of the database to create
const databaseName = "beautytestdb"; //(OOPS!!) IF YOU TAKE beauty.db as name or the same name as you already have it will reset it with new tables and info.

// SQL Statements for Table Creation
const tableCreationQueries = [
  // Table: Users
  `CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Table: Categories
  `CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100),
    parent_category_id INT,
    FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
  );`,

  // Table: Brands
  `CREATE TABLE Brands (
      brand_id INT AUTO_INCREMENT PRIMARY KEY,
      brand_name VARCHAR(100)
    );`,

  // Table: serviceCategories
  `CREATE TABLE serviceCategories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100)
  );`,

  // Table: Products
  `CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    description TEXT,
    category_id INT,
    brand_id INT,
    featured boolean,
    usage_products TEXT,
    ingredients TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url_primary TEXT,
    image_url_secondary TEXT,
    image_url_third TEXT,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES Brands(brand_id) ON DELETE SET NULL
  );`,

  // Table: Orders
  `CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_status VARCHAR(50),
    total_amount DECIMAL(10,2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
  );`,

  // create Table product_sizes
  `CREATE TABLE ProductSizes (
    size_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    size VARCHAR(50),
    price DECIMAL(10,2),
    stock_quantity INT,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
    );`,

  `CREATE TABLE ProductProperties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT
    );`,

  `CREATE TABLE ProductPropertiesJoinTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    property_id INT,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES ProductProperties(property_id) ON DELETE CASCADE
  );`,

  // Table: OrderDetails
  `CREATE TABLE OrderDetails (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10,2),
    size_id INT,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (size_id) REFERENCES ProductSizes(size_id) ON DELETE SET NULL
  );`,

  // Table: Services
  `CREATE TABLE Services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    time INT, -- Duration in minutes
    price DECIMAL(10,2),
    category_id INT,
    before_image_url VARCHAR(255),
    after_image_url VARCHAR(255),
    booking_link VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES serviceCategories(category_id) ON DELETE SET NULL
  );`,

  // Table: Events
  `CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    schedule DATETIME,
    image_url VARCHAR(255),
    booking_link VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  // Table: Courses
  `CREATE TABLE Courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    schedule DATETIME,
    image_url VARCHAR(255),
    booking_link VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,

  // Table: ProductReviews
  `CREATE TABLE ProductReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
  );`,

  // Table: PageReviews
  `CREATE TABLE PageReviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
];

// SQL Statements for Inserting Dummy Data
const insertDataQueries = [
  // Insert into Users
  `INSERT INTO Users (role, first_name, last_name, email, password, phone)
  VALUES
  ('admin', 'Emily', 'Blossom', 'emily.blossom@beautywellness.com', 'hashed_password1', "123-456-7890"),
  ('customer', 'Sophia', 'Grace', 'sophia.grace@example.com', 'hashed_password2', "123-456-7890"),
  ('admin', 'Lucas', 'A', 'lucas@1.se', '$2y$10$vHgbdRbeb60v40U282Zh1ef.TLY7PzfT4hTSD3e1tFQuMyKik15ES', "123-456-7890"),
  ('customer', 'Liam', 'Johnson', 'liam.johnson@example.com', 'hashed_password3', "123-456-7890");`,

  // Insert into Categories
  `INSERT INTO Categories (category_name, parent_category_id) VALUES
  ('Skincare', NULL),
  ('Haircare', NULL),
  ('Makeup', NULL),
  ('Facials', 1),
  ('Massages', NULL),
  ('Manicures & Pedicures', NULL);`,

  // Insert into serviceCategories
  `INSERT INTO serviceCategories (category_name) VALUES
  ('Facial Treatments' ),
  ('Massage Therapies'),
  ('Nail Services'),
  ('Hair Services');`,

  `INSERT INTO Brands (brand_name) VALUES
  ('Circadia' ),
  ('Herbs2Peel');`,

  // Insert into Products
  `INSERT INTO Products (product_name, description, category_id, brand_id, featured, usage_products, ingredients)
  VALUES
  ('Hydrating Facial Cream', 'Deeply moisturizes and revitalizes skin.', 1, 1, TRUE, 'Apply a small amount to the face and neck twice daily after cleansing.', 'Aqua, Glycerin, Hyaluronic Acid, Vitamin E, Shea Butter'),
  ('Organic Shampoo', 'Gentle cleansing with natural ingredients.', 2,1, TRUE, 'Massage into wet hair, lather, and rinse thoroughly. Use daily or as needed.', 'Water, Aloe Vera, Coconut Oil, Jojoba Oil, Lavender Essential Oil'),
  ('Matte Liquid Lipstick', 'Long-lasting matte finish in various shades.', 3, 2, FALSE, 'Apply directly to lips starting at the center and moving outwards. Allow to dry for a matte finish.', 'Isododecane, Dimethicone, Red 7 Lake, Candelilla Wax, Vitamin E'),
  ('Revitalizing Hair Mask', 'Nourishes and strengthens hair.', 2,2, FALSE, 'Apply generously to damp hair, leave for 10-15 minutes, then rinse thoroughly. Use weekly for best results.', 'Water, Argan Oil, Avocado Oil, Keratin, Coconut Extract');`,

  `INSERT INTO ProductSizes (product_id, size, price, stock_quantity) VALUES
  (1, '50 ml', 29.99, 150),
  (1, '100 ml', 34.99, 100),
  (2, '250 ml', 15.99, 200),
  (3, '5 ml', 19.99, 100),
  (4, '30 ml', 24.99, 75);`,

  `INSERT INTO ProductProperties (name) VALUES
  ('Skin Type'),
  ('Texture'),
  ('Scent');`,

  // Insert into Orders
  `INSERT INTO Orders (user_id, order_status, total_amount, address_line1, address_line2, postal_code, country, city)
  VALUES
  (2, 'Confirmed', 65.97, '123 Main St', 'Apt 101', '12345', 'USA', 'Springfield'),
  (3, 'Pending', 19.99, '456 Main St', 'Apt 101', '12345', 'USA', 'Springfield');`,

  // Insert into OrderDetails
  `INSERT INTO OrderDetails (order_id, product_id, quantity, size_id, unit_price)
  VALUES
  (1, 1, 2, 1, 29.99),
  (1, 2, 1, 3, 15.99),
  (2, 3, 1, 4, 19.99);`,

  // Insert into Services
  `INSERT INTO Services (name, description, time, price, category_id, booking_link)
  VALUES
  ('Classic Facial', 'A comprehensive facial treatment for all skin types.', 60, 75.00, 1, 'http://beautywellness.com/book/classic-facial'),
  ('Deep Tissue Massage', 'Intense massage targeting deep muscle layers.', 90, 120.00, 2, 'http://beautywellness.com/book/deep-tissue-massage'),
  ('Gel Manicure', 'Professional manicure with long-lasting gel polish.', 45, 40.00, 3, 'http://beautywellness.com/book/gel-manicure'),
  ('Hair Coloring', 'Expert hair coloring services with premium products.', 120, 80.00, 4, 'http://beautywellness.com/book/hair-coloring');`,

  // Insert into Events
  `INSERT INTO Events (name, description, price, schedule, image_url, booking_link)
  VALUES
  ('Summer Glow Workshop', 'Learn skincare routines for radiant summer skin.', 49.99, '2024-12-05 09:00:00', 'http://example.com/images/event_summer_glow.jpg', 'http://beautywellness.com/book/event/summer-glow'),
  ('Wellness Retreat Weekend', 'A weekend of relaxation and rejuvenation.', 299.99,'2025-01-15 10:00:00', 'http://example.com/images/event_retreat.jpg', 'http://beautywellness.com/book/event/wellness-retreat');`,

  // Insert into Courses
  `INSERT INTO Courses (name, description, price, schedule, image_url, booking_link)
  VALUES
  ('Advanced Facial Techniques', 'Enhance your skills in facial treatments.', 199.99, '2024-12-05 09:00:00', 'http://example.com/images/course_facial_techniques.jpg', 'http://beautywellness.com/book/course/advanced-facial'),
  ('Massage Therapy Certification', 'Become a certified massage therapist.', 499.99, '2025-01-15 10:00:00', 'http://example.com/images/course_massage_certification.jpg', 'http://beautywellness.com/book/course/massage-certification');`,

  // Insert into ProductReviews
  `INSERT INTO ProductReviews (user_id, product_id, rating, review_text)
  VALUES
  (2, 1, 5, 'This hydrating cream has transformed my skin! Highly recommend.'),
  (3, 2, 4, 'Great shampoo with a pleasant scent. Leaves my hair soft.');`,

  // Insert into PageReviews
  `INSERT INTO PageReviews (rating, review_text)
  VALUES
  (5, 'Amazing services and friendly staff! My skin has never felt better.'),
  (4, 'Great place to relax and rejuvenate, though a bit pricey.');`,
];

// Main Function to Create Database, Tables, and Insert Data
async function createDatabase() {
  let connection;

  try {
    // 1. Connect to MySQL server (without specifying a database)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true, // To allow executing multiple SQL statements at once
    });

    console.log("Connected to MySQL server.");

    // 2. Drop the existing database if it exists
    await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\`;`);
    console.log(`Dropped database if it existed: ${databaseName}`);

    // 3. Create the new database
    await connection.query(
      `CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`Created new database: ${databaseName}`);

    // 4. Connect to the newly created database
    await connection.changeUser({ database: databaseName });
    console.log(`Switched to database: ${databaseName}`);

    // 5. Create Tables
    for (const query of tableCreationQueries) {
      await connection.query(query);
      console.log(`Executed table creation query.`);
    }
    console.log("All tables created successfully.");

    // 6. Insert Dummy Data
    for (const query of insertDataQueries) {
      await connection.query(query);
      console.log(`Inserted data into tables.`);
    }
    console.log("Dummy data inserted successfully.");

    console.log("Database setup completed successfully.");
  } catch (error) {
    console.error("Error during database setup:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("MySQL connection closed.");
    }
  }
}

// Execute the main function
createDatabase();
