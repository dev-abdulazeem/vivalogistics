const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicle);
router.get('/:id/availability', vehicleController.checkAvailability);

module.exports = router;