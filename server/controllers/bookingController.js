const { z } = require('zod');
const { differenceInDays } = require('date-fns');
const prisma = require('../config/database');
const { initializePayment, verifyPayment: verifyPaystackPayment } = require('../utils/paystack');
const { sendEmail, getBookingConfirmationEmail } = require('../utils/email');

const bookingSchema = z.object({
  vehicleId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  pickupLocation: z.string().min(1),
  dropoffLocation: z.string().optional(),
  driverRequired: z.boolean().optional(),
  specialRequests: z.string().optional(),
});

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const data = bookingSchema.parse(req.body);
    const userId = req.user.id;

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'End date must be after start date.' });
    }

    if (start < new Date()) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId, isAvailable: true, isActive: true },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found or unavailable.' });
    }

    // Check availability
    const overlapping = await prisma.booking.findFirst({
      where: {
        vehicleId: data.vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      return res.status(400).json({ success: false, message: 'Vehicle already booked for these dates.' });
    }

    const totalDays = differenceInDays(end, start) + 1;
    const totalPrice = vehicle.pricePerDay * totalDays;

    const booking = await prisma.booking.create({
      data: {
        userId,
        vehicleId: data.vehicleId,
        startDate: start,
        endDate: end,
        totalDays,
        totalPrice,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation || data.pickupLocation,
        driverRequired: data.driverRequired || false,
        specialRequests: data.specialRequests,
        status: 'PENDING',
      },
      include: { vehicle: true, user: true },
    });

    // Initialize Paystack payment
    const payment = await initializePayment({
      email: booking.user.email,
      amount: Number(totalPrice),
      metadata: { bookingId: booking.id, userId },
      callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalPrice,
        paystackReference: payment.reference,
      },
    });

    // Update booking with payment reference
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentReference: payment.reference },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created. Complete payment to confirm.',
      data: {
        booking,
        paymentUrl: payment.authorization_url,
        reference: payment.reference,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Booking creation failed.' });
  }
};

// VERIFY PAYMENT (Webhook + Manual)
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    // Call Paystack utility (renamed to avoid conflict)
    const paymentData = await verifyPaystackPayment(reference);
    
    if (paymentData.status !== 'success') {
      await prisma.payment.updateMany({
        where: { paystackReference: reference },
        data: { status: 'FAILED' },
      });
      return res.status(400).json({ success: false, message: 'Payment failed.' });
    }

    const payment = await prisma.payment.update({
      where: { paystackReference: reference },
      data: { status: 'SUCCESS', paidAt: new Date() },
      include: { booking: { include: { user: true, vehicle: true } } },
    });

    // Confirm booking
    const booking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
      include: { user: true, vehicle: true },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: `Your booking for ${booking.vehicle.name} has been confirmed.`,
      },
    });

    // Send confirmation email using template
    const emailTemplate = getBookingConfirmationEmail(booking.user.fullName, booking);
    await sendEmail({ to: booking.user.email, ...emailTemplate });

    res.json({ success: true, message: 'Payment verified. Booking confirmed.', data: booking });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

// GET USER BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { vehicle: true, payment: true, review: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

// GET SINGLE BOOKING
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, userId: req.user.id },
      include: { vehicle: true, payment: true, review: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id, userId: req.user.id },
      include: { payment: true, user: true, vehicle: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Cannot cancel active booking.' });
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    if (booking.payment?.status === 'SUCCESS') {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'REFUNDED' },
      });
    }

    // Notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `Your booking for ${booking.vehicle.name} has been cancelled.`,
      },
    });

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
};

module.exports = {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBooking,
  cancelBooking,
};