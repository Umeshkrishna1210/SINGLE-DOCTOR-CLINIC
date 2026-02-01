-- ===================================
-- MEDISYNC DATABASE SCHEMA (FIXED FOR ALL MySQL VERSIONS)
-- ===================================
-- SHOW databases;
-- DROP DATABASE IF EXISTS mediSyncDB;

-- CREATE DATABASE IF NOT EXISTS mediSyncDB 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- USE mediSyncDB;

-- ===================================
-- 1. USERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor') NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 2. APPOINTMENTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 3. BLOCKED DAYS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS blocked_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    block_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_day (doctor_id, block_date),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_block_date (block_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 4. BLOCKED TIME SLOTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS blocked_time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    slot_datetime DATETIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_datetime (doctor_id, slot_datetime),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_slot_datetime (slot_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 5. MEDICAL RECORDS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NULL,
    problem TEXT,
    previous_medications TEXT,
    medical_history TEXT,
    diagnosis TEXT,
    prescriptions JSON,
    lab_reports JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 6. DOCTOR SCHEDULE SETTINGS TABLE (FIXED - No JSON_ARRAY)
-- ===================================
CREATE TABLE IF NOT EXISTS doctor_schedule_settings (
    doctor_id INT PRIMARY KEY,
    start_time TIME DEFAULT '11:00:00',
    end_time TIME DEFAULT '19:00:00',
    working_days VARCHAR(255) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    appointment_duration INT DEFAULT 30,
    break_start_time TIME DEFAULT '13:00:00',
    break_end_time TIME DEFAULT '14:00:00',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- CLEAR EXISTING DATA
-- ===================================
-- TRUNCATE TABLE appointments;
-- TRUNCATE TABLE blocked_days;
-- TRUNCATE TABLE blocked_time_slots;
-- TRUNCATE TABLE medical_records;
-- DELETE FROM doctor_schedule_settings;
-- DELETE FROM users;

-- ===================================
-- SEED DATA
-- ===================================

-- Insert the single doctor
-- Password: bcrypt hash of "doctor123"
-- INSERT INTO users (id, name, email, password, role) 
-- VALUES (1, 'Dr. Smith', 'doctor@clinic.com', '$2b$10$1234567890abcdefghijklmnopqrstuv', 'doctor');

-- Insert doctor schedule settings (using VARCHAR instead of JSON)
-- INSERT INTO doctor_schedule_settings (doctor_id, working_days) 
-- VALUES (1, 'Mon,Tue,Wed,Thu,Fri');