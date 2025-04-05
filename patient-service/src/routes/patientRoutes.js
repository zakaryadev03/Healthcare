const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatient,
  deletePatient
} = require('../controllers/patientController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');

router.post('/', createPatient);
router.get('/:patientId', apiKeyMiddleware, getPatient);
router.delete('/:patientId', deletePatient);

module.exports = router;