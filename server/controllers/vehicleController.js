const { z } = require('zod');
const prisma = require('../config/database');
const { uploadToCloudinary, deleteImage } = require('../utils/cloudinary');

// Helper to parse features from various formats
const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [features];
    } catch {
      // It's a comma-separated string
      return features.split(',').map(f => f.trim()).filter(Boolean);
    }
  }
  return [];
};

const vehicleSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['CAR', 'BUS', 'VAN', 'SUV', 'TRUCK']),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
  seats: z.coerce.number().int().min(1),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']),
  pricePerDay: z.coerce.number().positive(),
  location: z.string().min(1),
  description: z.string().optional().nullable(),
  features: z.any().optional(), // We'll parse manually
  isAvailable: z.coerce.boolean().optional(),
});

// CREATE SINGLE VEHICLE (Admin)
const createVehicle = async (req, res) => {
  try {
    // Parse features before validation
    const rawData = { ...req.body };
    rawData.features = parseFeatures(rawData.features);
    rawData.year = parseInt(rawData.year);
    rawData.seats = parseInt(rawData.seats);
    rawData.pricePerDay = parseFloat(rawData.pricePerDay);

    const data = vehicleSchema.parse(rawData);
    
    // Upload images to Cloudinary from memory buffer
    const images = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        images.push(url);
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: { 
        name: data.name,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year,
        seats: data.seats,
        transmission: data.transmission,
        fuelType: data.fuelType,
        pricePerDay: data.pricePerDay,
        location: data.location,
        description: data.description,
        images,
        features: data.features || [],
      },
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Create vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to create vehicle.' });
  }
};

// BULK CREATE VEHICLES (Admin) - JSON array
const createVehiclesBulk = async (req, res) => {
  try {
    const vehicles = z.array(vehicleSchema).parse(req.body.vehicles);
    
    const created = await prisma.$transaction(
      vehicles.map(v => prisma.vehicle.create({
        data: { ...v, images: [], features: v.features || [] }
      }))
    );

    res.status(201).json({ 
      success: true, 
      message: `${created.length} vehicles created.`,
      data: created 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Bulk creation failed.' });
  }
};

// GET ALL VEHICLES (Public - with filters)
const getVehicles = async (req, res) => {
  try {
    const { 
      type, 
      location, 
      minPrice, 
      maxPrice, 
      transmission, 
      fuelType,
      seats,
      search,
      page = 1, 
      limit = 10 
    } = req.query;

    const where = { isActive: true };
    
    if (type) where.type = type;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (transmission) where.transmission = transmission;
    if (fuelType) where.fuelType = fuelType;
    if (seats) where.seats = { gte: parseInt(seats) };
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    // Calculate average rating
    const vehiclesWithRating = vehicles.map(v => {
      const avgRating = v.reviews.length 
        ? v.reviews.reduce((a, b) => a + b.rating, 0) / v.reviews.length 
        : 0;
      const { reviews, ...rest } = v;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: v._count.reviews };
    });

    res.json({
      success: true,
      data: vehiclesWithRating,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles.' });
  }
};

// GET SINGLE VEHICLE
const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { fullName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { bookings: true } },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const avgRating = vehicle.reviews.length
      ? vehicle.reviews.reduce((a, b) => a + b.rating, 0) / vehicle.reviews.length
      : 0;

    res.json({ 
      success: true, 
      data: { ...vehicle, avgRating: Math.round(avgRating * 10) / 10 } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle.' });
  }
};

// UPDATE VEHICLE (Admin)
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse features before validation
    const rawData = { ...req.body };
    if (rawData.features) {
      rawData.features = parseFeatures(rawData.features);
    }
    if (rawData.year) rawData.year = parseInt(rawData.year);
    if (rawData.seats) rawData.seats = parseInt(rawData.seats);
    if (rawData.pricePerDay) rawData.pricePerDay = parseFloat(rawData.pricePerDay);

    const data = vehicleSchema.partial().parse(rawData);
    
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Vehicle not found.' });

    // Handle image updates
    let images = existing.images;
    if (req.files?.length > 0) {
      // Delete old images from Cloudinary
      for (const img of existing.images) {
        await deleteImage(img);
      }
      // Upload new images from memory buffer
      images = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        images.push(url);
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.seats !== undefined) updateData.seats = data.seats;
    if (data.transmission !== undefined) updateData.transmission = data.transmission;
    if (data.fuelType !== undefined) updateData.fuelType = data.fuelType;
    if (data.pricePerDay !== undefined) updateData.pricePerDay = data.pricePerDay;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.features !== undefined) updateData.features = data.features;
    updateData.images = images;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Update vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to update vehicle.' });
  }
};

// DELETE VEHICLE (Admin - soft delete)
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.update({
      where: { id },
      data: { isActive: false, isAvailable: false },
    });
    res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete vehicle.' });
  }
};

// CHECK VEHICLE AVAILABILITY
const checkAvailability = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;
    
    const overlapping = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
        ],
      },
    });

    res.json({ 
      success: true, 
      available: !overlapping,
      message: overlapping ? 'Vehicle not available for selected dates.' : 'Vehicle is available.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Availability check failed.' });
  }
};

module.exports = {
  createVehicle,
  createVehiclesBulk,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  checkAvailability,
};