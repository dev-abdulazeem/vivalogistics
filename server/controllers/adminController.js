const prisma = require('../config/database');

// DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      totalRevenue,
      monthlyRevenue,
      pendingBookings,
      activeBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { select: { fullName: true, email: true } }, 
          vehicle: { select: { name: true } } 
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVehicles,
          totalBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
          monthlyRevenue: monthlyRevenue._sum.amount || 0,
          pendingBookings,
          activeBookings,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};

// GET ALL BOOKINGS (Admin)
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};

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
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

// UPDATE BOOKING STATUS (Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, vehicle: true },
    });

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
    res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
};

// DELETE BOOKING (Admin) — FIXED: removed notification delete
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Use transaction to delete everything safely
    await prisma.$transaction(async (tx) => {
      // Delete payment first
      await tx.payment.deleteMany({ where: { bookingId: id } });
      
      // Delete review
      await tx.review.deleteMany({ where: { bookingId: id } });
      
      // Finally delete booking
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
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// UPDATE USER STATUS (Ban/Unban)
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

    const payments = await prisma.payment.findMany({
      where,
      include: { booking: { include: { vehicle: true } } },
      orderBy: { paidAt: 'desc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    res.json({
      success: true,
      data: { payments, totalRevenue, count: payments.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch revenue report.' });
  }
};

// FLEET UTILIZATION
const getFleetUtilization = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { bookings: { where: { status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] } } } } },
        bookings: { where: { status: { in: ['CONFIRMED', 'ACTIVE'] } }, select: { startDate: true, endDate: true } },
      },
    });

    const utilization = vehicles.map(v => ({
      ...v,
      totalBookings: v._count.bookings,
      isCurrentlyRented: v.bookings.some(b => new Date(b.startDate) <= new Date() && new Date(b.endDate) >= new Date()),
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
  deleteBooking,
  getAllUsers,
  updateUserStatus,
  getRevenueReport,
  getFleetUtilization,
};