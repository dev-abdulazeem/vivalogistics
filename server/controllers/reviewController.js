const { z } = require('zod');
const prisma = require('../config/database');

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

const createReview = async (req, res) => {
  try {
    const data = reviewSchema.parse(req.body);
    const userId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: data.bookingId, userId, status: 'COMPLETED' },
    });

    if (!booking) {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings.' });
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking.' });
    }

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        userId,
        vehicleId: booking.vehicleId,
        rating: data.rating,
        comment: data.comment,
      },
      include: { user: { select: { fullName: true, avatar: true } } },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to create review.' });
  }
};

const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { vehicleId },
      include: { user: { select: { fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

module.exports = { createReview, getVehicleReviews };