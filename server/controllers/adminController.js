const prisma = require('../config/database');
const { differenceInDays, startOfDay } = require('date-fns');

// DASHBOARD STATS — FIXED: Revenue includes payments + extra charges
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      paymentRevenue,
      monthlyPaymentRevenue,
      extraChargesTotal,
      monthlyExtraCharges,
      pendingBookings,
      activeBookings,
      needsAttention,
      recentBookings,
      bookingsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.booking.count(),
      
      // Base payment revenue (SUCCESS only)
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      
      // Monthly payment revenue
      prisma.payment.aggregate({
        where: { status: 'SUCCESS', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      
      // All extra charges ever
      prisma.booking.aggregate({
        _sum: { extraCharges: true },
      }),
      
      // Monthly extra charges
      prisma.booking.aggregate({
        where: { updatedAt: { gte: startOfMonth }, extraCharges: { gt: 0 } },
        _sum: { extraCharges: true },
      }),
      
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      
      // Bookings needing admin attention
      prisma.booking.count({ 
        where: { status: { in: ['CLIENT_MARKED_COMPLETE', 'PENDING_VERIFICATION'] } } 
      }),
      
      // Recent bookings with full details
      prisma.booking.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { select: { fullName: true, email: true } }, 
          vehicle: { select: { name: true, images: true } },
          payment: { select: { status: true } },
        },
      }),
      
      // Count by status for chart data
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    // Calculate total revenue: payments + extra charges
    const totalRevenue = Number(paymentRevenue._sum.amount || 0) + Number(extraChargesTotal._sum.extraCharges || 0);
    const monthlyRevenue = Number(monthlyPaymentRevenue._sum.amount || 0) + Number(monthlyExtraCharges._sum.extraCharges || 0);

    // Format status counts
    const statusCounts = {};
    bookingsByStatus.forEach(item => {
      statusCounts[item.status] = item._count.status;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVehicles,
          totalBookings,
          totalRevenue,
          monthlyRevenue,
          pendingBookings,
          activeBookings,
          needsAttention,
        },
        recentBookings,
        statusCounts,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};

// GET ALL BOOKINGS
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status && status !== 'all' ? { status } : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          vehicle: { select: { name: true, type: true, images: true } },
          payment: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      },
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

// UPDATE BOOKING STATUS
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, vehicle: true },
    });

    if (status === 'COMPLETED') {
      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { isAvailable: true },
      });
    }

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'ADMIN_ALERT',
        title: `Booking ${status}`,
        message: `Your booking for ${booking.vehicle.name} is now ${status.toLowerCase()}.`,
      },
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
};

// VERIFY BOOKING RETURN
const verifyBookingReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'CLIENT_MARKED_COMPLETE' && booking.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot verify. Current status: ${booking.status}` 
      });
    }

    if (verified) {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          adminVerifiedAt: new Date(),
          verifiedByAdmin: true,
          adminNotes: notes || null,
        },
        include: { vehicle: true, user: true },
      });

      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { isAvailable: true },
      });

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Completed',
          message: `Your ${booking.vehicle.name} rental has been verified and completed. Thank you!`,
        },
      });

      res.json({
        success: true,
        message: 'Booking verified and completed successfully.',
        data: updatedBooking,
      });
    } else {
      const today = startOfDay(new Date());
      const expectedEnd = startOfDay(new Date(booking.endDate));
      const daysOverdue = Math.max(0, differenceInDays(today, expectedEnd));
      
      const extraCharges = daysOverdue > 0 
        ? booking.overdueDailyRate * daysOverdue 
        : 0;

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'PENDING_VERIFICATION',
          adminVerifiedAt: new Date(),
          verifiedByAdmin: false,
          adminNotes: notes || 'Vehicle not returned as claimed.',
          extraCharges,
          extraChargeDays: daysOverdue,
        },
        include: { vehicle: true, user: true },
      });

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'EXTRA_CHARGES_APPLIED',
          title: 'Extra Charges Applied',
          message: `Your ${booking.vehicle.name} was not verified as returned. Extra charges: ₦${extraCharges} for ${daysOverdue} day(s) overdue.`,
        },
      });

      res.json({
        success: true,
        message: 'Booking flagged. Extra charges applied.',
        data: updatedBooking,
      });
    }
  } catch (error) {
    console.error('Verify return error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify booking return.' });
  }
};

// AUTO-COMPLETE BOOKING
const adminAutoCompleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'CLIENT_MARKED_COMPLETE' && booking.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot auto-complete. Current status: ${booking.status}` 
      });
    }

    const today = startOfDay(new Date());
    const expectedEnd = startOfDay(new Date(booking.endDate));
    const daysOverdue = Math.max(0, differenceInDays(today, expectedEnd));
    
    const extraCharges = daysOverdue > 0 
      ? booking.overdueDailyRate * daysOverdue 
      : 0;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'AUTO_COMPLETED',
        autoCompletedAt: new Date(),
        adminVerifiedAt: new Date(),
        verifiedByAdmin: true,
        extraCharges,
        extraChargeDays: daysOverdue,
        adminNotes: `Auto-completed by admin. ${daysOverdue > 0 ? `Overdue by ${daysOverdue} day(s).` : 'No overdue.'}`,
      },
      include: { vehicle: true, user: true },
    });

    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { isAvailable: true },
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_OVERDUE',
        title: 'Booking Auto-Completed',
        message: `Your ${booking.vehicle.name} booking was auto-completed. ${daysOverdue > 0 ? `Extra charges: ₦${extraCharges} for ${daysOverdue} day(s).` : ''}`,
      },
    });

    res.json({
      success: true,
      message: 'Booking auto-completed.',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Auto-complete error:', error);
    res.status(500).json({ success: false, message: 'Failed to auto-complete booking.' });
  }
};

// DELETE BOOKING
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { bookingId: id } });
      await tx.review.deleteMany({ where: { bookingId: id } });
      await tx.booking.delete({ where: { id } });
    });

    res.json({ success: true, message: 'Booking deleted permanently.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete booking.' });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, fullName: true, phone: true,
          role: true, emailVerified: true, isActive: true, createdAt: true,
          _count: { select: { bookings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// UPDATE USER STATUS
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive, role },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// REVENUE REPORT
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      status: 'SUCCESS',
      paidAt: {
        gte: startDate ? new Date(startDate) : new Date(0),
        lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    const [payments, extraChargesAgg] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { booking: { include: { vehicle: true } } },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.booking.aggregate({
        where: {
          extraCharges: { gt: 0 },
          updatedAt: {
            gte: startDate ? new Date(startDate) : new Date(0),
            lte: endDate ? new Date(endDate) : new Date(),
          },
        },
        _sum: { extraCharges: true },
      }),
    ]);

    const paymentRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const extraRevenue = Number(extraChargesAgg._sum.extraCharges || 0);
    const totalRevenue = paymentRevenue + extraRevenue;

    res.json({
      success: true,
      data: { 
        payments, 
        totalRevenue,
        paymentRevenue,
        extraRevenue,
        count: payments.length,
      },
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue report.' });
  }
};

// FLEET UTILIZATION
const getFleetUtilization = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      include: {
        _count: { 
          select: { 
            bookings: { 
              where: { 
                status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'AUTO_COMPLETED'] } 
              } 
            } 
          } 
        },
        bookings: { 
          where: { 
            status: { in: ['CONFIRMED', 'ACTIVE'] } 
          }, 
          select: { startDate: true, endDate: true } 
        },
      },
    });

    const utilization = vehicles.map(v => ({
      ...v,
      totalBookings: v._count.bookings,
      isCurrentlyRented: v.bookings.some(
        b => new Date(b.startDate) <= new Date() && new Date(b.endDate) >= new Date()
      ),
    }));

    res.json({ success: true, data: utilization });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fleet data.' });
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  verifyBookingReturn,
  adminAutoCompleteBooking,
  deleteBooking,
  getAllUsers,
  updateUserStatus,
  getRevenueReport,
  getFleetUtilization,
};