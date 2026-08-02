CREATE DATABASE IF NOT EXISTS online_bookstore_db;

USE online_bookstore_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0,
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM(
        'Processing',
        'Confirmed',
        'Shipped',
        'Delivered',
        'Cancelled'
    ) DEFAULT 'Processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);

INSERT INTO books
(
    title,
    author,
    category,
    description,
    price,
    rating,
    stock,
    image_url
)
VALUES
(
    'The Silent Library',
    'Maya Rivers',
    'Fiction',
    'A mysterious library and a hidden story.',
    18.99,
    4.8,
    12,
    NULL
),
(
    'Modern Web Development',
    'Daniel Brooks',
    'Technology',
    'A practical guide to HTML, CSS, JavaScript and React.',
    29.99,
    4.9,
    9,
    NULL
),
(
    'Small Habits, Big Results',
    'Nora Wells',
    'Self Development',
    'Simple daily habits for better personal growth.',
    16.50,
    4.7,
    18,
    NULL
),
(
    'Database Fundamentals',
    'Lina Carter',
    'Technology',
    'Learn SQL, database design and normalization.',
    32.25,
    4.8,
    7,
    NULL
),
(
    'The Midnight Atlas',
    'Sofia Lane',
    'Fantasy',
    'A magical atlas reveals hidden cities after midnight.',
    21.00,
    4.6,
    11,
    NULL
),
(
    'Business from Zero',
    'Owen Grant',
    'Business',
    'A beginner guide to starting and growing a business.',
    24.50,
    4.5,
    15,
    NULL
);