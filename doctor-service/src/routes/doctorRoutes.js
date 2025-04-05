const express = require('express');
const router = express.Router();
const { createDoctor, loginDoctor, getDoctor, deleteDoctor } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');

// Public routes
router.post('/register', createDoctor);
router.post('/login', loginDoctor);

// Protected routes (require JWT)
router.get('/:doctorId', authMiddleware, apiKeyMiddleware, getDoctor);
router.delete('/:doctorId', authMiddleware, deleteDoctor);

module.exports = router;