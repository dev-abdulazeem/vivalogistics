const { differenceInDays, startOfDay, subDays } = require('date-fns');
const prisma = require('../config/database');

const GRACE_PERIOD_HOURS = 48;

const runAutoComplete = async () => {
  try {
    const now = new Date();
    const gracePeriodAgo = subDays(now, GRACE_PERIOD_HOURS / 24);

    // Find bookings client marked complete but admin hasn't verified in 48h
    const bookingsToAutoComplete = await prisma.booking.findMany({
      where: {
        status: 'CLIENT_MARKED_COMPLETE',
        clientMarkedCompleteAt: { lte: gracePeriodAgo },
        adminVerifiedAt: null,
      },
      include: { vehicle: true, user: true },
    });

    console.log(`[AutoComplete] Found ${bookingsToAutoComplete.length} bookings to auto-complete.`);

    for (const booking of bookingsToAutoComplete) {
      const today = startOfDay(now);
      const expectedEnd = startOfDay(new Date(booking.endDate));
      const daysOverdue = Math.max(0, differenceInDays(today, expectedEnd));
      
      const extraCharges = daysOverdue > 0 
        ? booking.overdueDailyRate * daysOverdue 
        : 0;

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'AUTO_COMPLETED',
          autoCompletedAt: now,
          adminVerifiedAt: now,
          verifiedByAdmin: true,
          extraCharges,
          extraChargeDays: daysOverdue,
          adminNotes: `Auto-completed after ${GRACE_PERIOD_HOURS}h grace period. ${daysOverdue > 0 ? `Overdue by ${daysOverdue} day(s).` : 'Returned on time.'}`,
        },
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
          message: `Your ${booking.vehicle.name} booking was auto-completed after ${GRACE_PERIOD_HOURS} hours. ${daysOverdue > 0 ? `Extra charges: ₦${extraCharges} for ${daysOverdue} day(s) overdue.` : ''}`,
        },
      });

      console.log(`[AutoComplete] Booking ${booking.id} auto-completed. Extra: ₦${extraCharges}, Days: ${daysOverdue}`);
    }

    // Update extra charges for PENDING_VERIFICATION bookings daily
    const pendingVerificationBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING_VERIFICATION',
        verifiedByAdmin: false,
      },
      include: { vehicle: true, user: true },
    });

    console.log(`[AutoComplete] Found ${pendingVerificationBookings.length} bookings with pending extra charges.`);

    for (const booking of pendingVerificationBookings) {
      const today = startOfDay(now);
      const expectedEnd = startOfDay(new Date(booking.endDate));
      const daysOverdue = Math.max(0, differenceInDays(today, expectedEnd));
      
      const extraCharges = daysOverdue > 0 
        ? booking.overdueDailyRate * daysOverdue 
        : 0;

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          extraCharges,
          extraChargeDays: daysOverdue,
          adminNotes: `Updated daily. Overdue by ${daysOverdue} day(s). Extra charges: ₦${extraCharges}.`,
        },
      });

      console.log(`[AutoComplete] Booking ${booking.id} extra charges updated. ₦${extraCharges}, Days: ${daysOverdue}`);
    }

    return {
      autoCompleted: bookingsToAutoComplete.length,
      updatedCharges: pendingVerificationBookings.length,
    };
  } catch (error) {
    console.error('[AutoComplete] Error:', error);
    throw error;
  }
};

module.exports = { runAutoComplete };