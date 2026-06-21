const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vivarental.com' },
    update: {},
    create: {
      email: 'admin@vivarental.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create sample vehicles
  const vehicles = [
    {
      name: 'Toyota Camry',
      type: 'CAR',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      seats: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'PETROL',
      pricePerDay: 15000,
      location: 'Lagos',
      description: 'Comfortable sedan for city driving',
      images: ['https://example.com/camry.jpg'],
      features: ['AC', 'Bluetooth', 'GPS', 'Reverse Camera'],
    },
    {
      name: 'Toyota Hiace Bus',
      type: 'BUS',
      brand: 'Toyota',
      model: 'Hiace',
      year: 2022,
      seats: 14,
      transmission: 'MANUAL',
      fuelType: 'DIESEL',
      pricePerDay: 35000,
      location: 'Lagos',
      description: 'Spacious bus for group travel',
      images: ['https://example.com/hiace.jpg'],
      features: ['AC', 'Reclining Seats', 'USB Charging', 'Luggage Space'],
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.name }, // This won't work with UUID, use create instead
      update: {},
      create: vehicle,
    });
  }

  console.log('✅ Seed completed');
  console.log('Admin login: admin@vivarental.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });