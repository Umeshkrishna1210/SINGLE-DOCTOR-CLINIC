const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: errors.array() 
        });
    }
    next();
};

// Validation rules for different routes

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['patient', 'doctor']).withMessage('Role must be either patient or doctor'),
    validate
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

const appointmentValidation = [
    body('appointment_date')
        .notEmpty().withMessage('Appointment date is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            const appointmentDate = new Date(value);
            const now = new Date();
            if (appointmentDate <= now) {
                throw new Error('Appointment date must be in the future');
            }
            return true;
        }),
    validate
];

const medicalRecordValidation = [
    body('problem')
        .trim()
        .notEmpty().withMessage('Problem description is required')
        .isLength({ max: 1000 }).withMessage('Problem description too long'),
    body('previousMedications')
        .trim()
        .notEmpty().withMessage('Previous medications field is required')
        .isLength({ max: 1000 }).withMessage('Previous medications description too long'),
    body('medicalHistory')
        .trim()
        .notEmpty().withMessage('Medical history is required')
        .isLength({ max: 2000 }).withMessage('Medical history too long'),
    validate
];

const prescriptionValidation = [
    body('patientId')
        .notEmpty().withMessage('Patient ID is required')
        .isInt({ min: 1 }).withMessage('Invalid patient ID'),
    body('diagnosis')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Diagnosis too long'),
    body('medicationList')
        .isArray({ min: 1 }).withMessage('At least one medication is required')
        .custom((medications) => {
            for (const med of medications) {
                if (!med.name || typeof med.name !== 'string' || !med.name.trim()) {
                    throw new Error('Each medication must have a name');
                }
                if (!med.timings || typeof med.timings !== 'string' || !med.timings.trim()) {
                    throw new Error('Each medication must have timings');
                }
            }
            return true;
        }),
    validate
];

const userIdValidation = [
    param('userId')
        .isInt({ min: 1 }).withMessage('Invalid user ID'),
    validate
];

const profileUpdateValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('newPassword')
        .optional()
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('currentPassword')
        .if(body('newPassword').exists())
        .notEmpty().withMessage('Current password is required when changing password'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    appointmentValidation,
    medicalRecordValidation,
    prescriptionValidation,
    userIdValidation,
    profileUpdateValidation
};
