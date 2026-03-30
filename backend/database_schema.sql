-- Create database
CREATE DATABASE IF NOT EXISTS smart_job_tracker;
USE smart_job_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'hr', 'admin') NOT NULL DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT,
    rounds VARCHAR(255),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company (company_name),
    INDEX idx_role (job_role),
    INDEX idx_created_by (created_by)
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    resume_path VARCHAR(500),
    cover_letter TEXT,
    ats_score TEXT,
    status ENUM('applied', 'accepted', 'rejected') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_job_id (job_id),
    INDEX idx_status (status),
    INDEX idx_ats_score (ats_score(50))
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reported_by INT NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reported_by (reported_by),
    INDEX idx_status (status)
);
