-- Create the main FreeA! database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS freea_ai_db;
USE freea_ai_db;

-- Table for managing user accounts and credentials (triggered by the Python user parser)
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Quick check query to view registered users
-- SELECT * FROM user_accounts;
