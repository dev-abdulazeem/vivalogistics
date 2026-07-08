const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const vehicleController = require('../controllers/vehicleController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

// Dashboard
router.get('/dashboard', authenticate, authorize('ADMIN'), adminController.getDashboardStats);

// Vehicles
router.post('/vehicles', authenticate, authorize('ADMIN'), upload.array('images', 10), vehicleController.createVehicle);
router.post('/vehicles/bulk', authenticate, authorize('ADMIN'), vehicleController.createVehiclesBulk);
router.patch('/vehicles/:id', authenticate, authorize('ADMIN'), upload.array('images', 10), vehicleController.updateVehicle);
router.delete('/vehicles/:id', authenticate, authorize('ADMIN'), vehicleController.deleteVehicle);

// Bookings
router.get('/bookings', authenticate, authorize('ADMIN'), adminController.getAllBookings);
router.patch('/bookings/:id/status', authenticate, authorize('ADMIN'), adminController.updateBookingStatus);
router.patch('/bookings/:id/verify-return', authenticate, authorize('ADMIN'), adminController.verifyBookingReturn);
router.patch('/bookings/:id/auto-complete', authenticate, authorize('ADMIN'), adminController.adminAutoCompleteBooking);
router.delete('/bookings/:id', authenticate, authorize('ADMIN'), adminController.deleteBooking);

// Users
router.get('/users', authenticate, authorize('ADMIN'), adminController.getAllUsers);
router.patch('/users/:id', authenticate, authorize('ADMIN'), adminController.updateUserStatus);

// Reports
router.get('/revenue', authenticate, authorize('ADMIN'), adminController.getRevenueReport);
router.get('/fleet', authenticate, authorize('ADMIN'), adminController.getFleetUtilization);

module.exports = router;