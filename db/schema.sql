-- Create Database
CREATE DATABASE IF NOT EXISTS freea_ai_db;
USE freea_ai_db;

-- Table for storing chat history and AI outputs
CREATE TABLE IF NOT EXISTS chat_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    neural_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking virtual chip telemetry and hardware simulation stats
CREATE TABLE IF NOT EXISTS chip_telemetry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chip_name VARCHAR(100),
    tokens_processed INT,
    execution_time_ms INT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
