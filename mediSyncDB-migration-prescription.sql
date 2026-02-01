-- ===================================
-- MEDISYNC MIGRATION: Prescription & Completed Status
-- ===================================
-- Run this ONLY if you have an EXISTING mediSyncDB with data you want to KEEP.
-- It adds doctor_id, diagnosis to medical_records and 'completed' to appointments.
--
-- If you get "Duplicate column name" error, that column already exists - skip that statement.
-- ===================================

USE mediSyncDB;

-- 1. Add doctor_id to medical_records (for doctor prescriptions)
ALTER TABLE medical_records ADD COLUMN doctor_id INT NULL;
ALTER TABLE medical_records ADD CONSTRAINT fk_medical_records_doctor 
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Add diagnosis column to medical_records
ALTER TABLE medical_records ADD COLUMN diagnosis TEXT NULL;

-- 3. Add 'completed' to appointments status enum
ALTER TABLE appointments MODIFY COLUMN status 
  ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending';
