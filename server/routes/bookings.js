const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, bookingController.createBooking);
router.post('/verify-payment', authenticate, bookingController.verifyPayment);
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;