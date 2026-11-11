require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const RoomType = require('../src/models/RoomType');
const Room = require('../src/models/Room');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');
const CheckIn = require('../src/models/CheckIn');
const Cancellation = require('../src/models/Cancellation');
const { connectDB } = require('../src/config/db');

// High-resolution luxury hotel photography URLs (Unsplash royalty-free)
const roomImages = {
  standard: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
  ],
  deluxe: [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
  ],
  premium: [
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'
  ],
  executive: [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
  ],
  family: [
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
  ]
};

const seedDatabase = async () => {
  try {
    console.log('--- Commencing Database Seeding for The Grand Heritage Hotel ---');

    // Clean existing records
    await User.deleteMany({});
    await RoomType.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await CheckIn.deleteMany({});
    await Cancellation.deleteMany({});

    console.log('🧹 Existing collections cleaned.');

    // 1. Create Staff & Users
    const adminUser = await User.create({
      name: 'Vikramaditya Oberoi (General Manager)',
      email: 'admin@grandheritage.com',
      phone: '+91 98765 43210',
      password: 'Admin@123',
      role: 'ADMIN'
    });

    const receptionistUser = await User.create({
      name: 'Sunita Sharma (Front Desk Executive)',
      email: 'receptionist@grandheritage.com',
      phone: '+91 98765 43211',
      password: 'Reception@123',
      role: 'RECEPTIONIST'
    });

    // 10 Realistic Customers
    const customerData = [
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98111 22334' },
      { name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 98222 33445' },
      { name: 'Amit Verma', email: 'amit.verma@example.com', phone: '+91 98333 44556' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+91 98444 55667' },
      { name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 98555 66778' },
      { name: 'Ananya Deshmukh', email: 'ananya.deshmukh@example.com', phone: '+91 98666 77889' },
      { name: 'Rohit Kapoor', email: 'rohit.kapoor@example.com', phone: '+91 98777 88990' },
      { name: 'Pooja Mehta', email: 'pooja.mehta@example.com', phone: '+91 98888 99001' },
      { name: 'Karan Malhotra', email: 'karan.malhotra@example.com', phone: '+91 98999 00112' },
      { name: 'Deepika Nair', email: 'deepika.nair@example.com', phone: '+91 99000 11223' }
    ];

    const customers = [];
    for (const c of customerData) {
      const u = await User.create({
        name: c.name,
        email: c.email,
        phone: c.phone,
        password: 'Customer@123',
        role: 'CUSTOMER'
      });
      customers.push(u);
    }
    console.log(`✅ Created Admin, Receptionist, and ${customers.length} Customers.`);

    // 2. Create 5 Room Categories (RoomTypes)
    const roomTypesData = [
      {
        name: 'Standard Room',
        description: 'Impeccably appointed room with warm wooden accents, ergonomic workstation, plush queen bedding, high-speed Wi-Fi, and soundproof windows.',
        basePrice: 2499,
        maxCapacity: 2,
        bedType: '1 Queen Bed',
        size: '320 sq.ft',
        amenities: ['High-speed Wi-Fi', 'LED Smart TV', 'Air Conditioning', 'Tea/Coffee Maker', 'In-room Safe', 'Ensuite Bathroom'],
        images: roomImages.standard
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious retreat featuring an imperial king-size bed, marble-clad bathroom with rainfall shower, private seating area, and sweeping city skyline views.',
        basePrice: 4499,
        maxCapacity: 3,
        bedType: '1 King Bed',
        size: '420 sq.ft',
        amenities: ['High-speed Wi-Fi', '55" 4K Smart TV', 'Centralized Climate Control', 'Stocked Mini-Bar', 'Rainfall Shower', '24/7 Room Service', 'Bathrobe & Slippers'],
        images: roomImages.deluxe
      },
      {
        name: 'Premium Room',
        description: 'Elevated luxury with panoramic vistas, private garden balcony, deep soaking bathtub, complimentary artisan breakfast, and express laundry privileges.',
        basePrice: 6999,
        maxCapacity: 3,
        bedType: '1 King Bed + Daybed',
        size: '520 sq.ft',
        amenities: ['Complimentary Breakfast', 'Private Balcony', 'Deep Soaking Bathtub', 'Nespresso Coffee Machine', 'High-speed Wi-Fi', 'Cocktail Hour Access', 'Luxury Toiletries'],
        images: roomImages.premium
      },
      {
        name: 'Executive Suite',
        description: 'Palatial one-bedroom suite featuring a separate designer living room, private dining area, marble master bath with jacuzzi, and exclusive Club Lounge access.',
        basePrice: 11999,
        maxCapacity: 4,
        bedType: '1 Master King Bed',
        size: '800 sq.ft',
        amenities: ['Club Lounge Access', 'Private Jacuzzi', 'Dedicated Butler Service', 'Separate Living Room', 'Airport Chauffeur Transfer', 'Evening Canapés', 'Premium Sound System'],
        images: roomImages.executive
      },
      {
        name: 'Family Suite',
        description: 'Expansive family residence with two lavish bedrooms, two en-suite bathrooms, interconnected living hall, children activity nook, and personalized concierge support.',
        basePrice: 14999,
        maxCapacity: 5,
        bedType: '2 King Beds + Rollaway',
        size: '1050 sq.ft',
        amenities: ['2 Master Bedrooms', '2 En-suite Bathrooms', 'Children Play Amenities', 'Kitchenette & Microwave', 'Dedicated Concierge', 'Complimentary Breakfast & Dinner', 'Smart Home Automation'],
        images: roomImages.family
      }
    ];

    const createdRoomTypes = {};
    for (const rt of roomTypesData) {
      const created = await RoomType.create(rt);
      createdRoomTypes[rt.name] = created;
    }
    console.log('✅ Created 5 Room Categories.');

    // 3. Create 25 Individual Physical Rooms (5 per category)
    const roomConfigs = [
      // Standard Rooms (Floor 1: 101 - 105)
      { roomNumber: '101', type: 'Standard Room', floor: 1, status: 'AVAILABLE' },
      { roomNumber: '102', type: 'Standard Room', floor: 1, status: 'AVAILABLE' },
      { roomNumber: '103', type: 'Standard Room', floor: 1, status: 'OCCUPIED' },
      { roomNumber: '104', type: 'Standard Room', floor: 1, status: 'AVAILABLE' },
      { roomNumber: '105', type: 'Standard Room', floor: 1, status: 'MAINTENANCE' },

      // Deluxe Rooms (Floor 2: 201 - 205)
      { roomNumber: '201', type: 'Deluxe Room', floor: 2, status: 'OCCUPIED' },
      { roomNumber: '202', type: 'Deluxe Room', floor: 2, status: 'AVAILABLE' },
      { roomNumber: '203', type: 'Deluxe Room', floor: 2, status: 'AVAILABLE' },
      { roomNumber: '204', type: 'Deluxe Room', floor: 2, status: 'AVAILABLE' },
      { roomNumber: '205', type: 'Deluxe Room', floor: 2, status: 'AVAILABLE' },

      // Premium Rooms (Floor 3: 301 - 305)
      { roomNumber: '301', type: 'Premium Room', floor: 3, status: 'AVAILABLE' },
      { roomNumber: '302', type: 'Premium Room', floor: 3, status: 'OCCUPIED' },
      { roomNumber: '303', type: 'Premium Room', floor: 3, status: 'AVAILABLE' },
      { roomNumber: '304', type: 'Premium Room', floor: 3, status: 'AVAILABLE' },
      { roomNumber: '305', type: 'Premium Room', floor: 3, status: 'AVAILABLE' },

      // Executive Suites (Floor 4: 401 - 405)
      { roomNumber: '401', type: 'Executive Suite', floor: 4, status: 'AVAILABLE' },
      { roomNumber: '402', type: 'Executive Suite', floor: 4, status: 'AVAILABLE' },
      { roomNumber: '403', type: 'Executive Suite', floor: 4, status: 'AVAILABLE' },
      { roomNumber: '404', type: 'Executive Suite', floor: 4, status: 'AVAILABLE' },
      { roomNumber: '405', type: 'Executive Suite', floor: 4, status: 'OCCUPIED' },

      // Family Suites (Floor 5: 501 - 505)
      { roomNumber: '501', type: 'Family Suite', floor: 5, status: 'AVAILABLE' },
      { roomNumber: '502', type: 'Family Suite', floor: 5, status: 'AVAILABLE' },
      { roomNumber: '503', type: 'Family Suite', floor: 5, status: 'AVAILABLE' },
      { roomNumber: '504', type: 'Family Suite', floor: 5, status: 'AVAILABLE' },
      { roomNumber: '505', type: 'Family Suite', floor: 5, status: 'AVAILABLE' }
    ];

    const createdRooms = {};
    for (const rc of roomConfigs) {
      const roomTypeObj = createdRoomTypes[rc.type];
      const room = await Room.create({
        roomNumber: rc.roomNumber,
        roomType: roomTypeObj._id,
        floor: rc.floor,
        status: rc.status,
        images: roomTypeObj.images,
        description: `${rc.type} located on Floor ${rc.floor} offering serene courtyard or skyline views.`
      });
      createdRooms[rc.roomNumber] = room;
    }
    console.log(`✅ Created ${Object.keys(createdRooms).length} Individual Physical Rooms.`);

    // 4. Create Sample Realistic Bookings
    const today = new Date();

    // Booking 1: CHECKED_IN (Room 103 - Rahul Sharma)
    const checkIn1 = new Date(today);
    checkIn1.setDate(today.getDate() - 1);
    const checkOut1 = new Date(today);
    checkOut1.setDate(today.getDate() + 2);

    const b1 = await Booking.create({
      bookingId: 'BK-108291',
      user: customers[0]._id,
      room: createdRooms['103']._id,
      roomType: createdRoomTypes['Standard Room']._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      adults: 2,
      children: 0,
      nights: 3,
      subtotal: 7497,
      taxes: 900,
      totalAmount: 8397,
      bookingStatus: 'CHECKED_IN',
      paymentStatus: 'SUCCESS',
      specialRequests: 'High floor preferred, extra towels requested',
      guestName: customers[0].name,
      guestEmail: customers[0].email,
      guestPhone: customers[0].phone
    });

    await Payment.create({
      booking: b1._id,
      user: customers[0]._id,
      razorpayOrderId: 'order_test_9012',
      razorpayPaymentId: 'pay_test_9012',
      amount: 8397,
      currency: 'INR',
      paymentMethod: 'Razorpay Test Card (Visa)',
      paymentStatus: 'SUCCESS',
      transactionReference: 'TXN-RZP-901284',
      isMockPayment: false
    });

    await CheckIn.create({
      booking: b1._id,
      receptionist: receptionistUser._id,
      actualCheckIn: checkIn1,
      assignedRoom: createdRooms['103']._id,
      roomNumber: '103',
      notes: 'Guest welcomed with jasmine garland. ID verified.'
    });

    // Booking 2: CHECKED_IN (Room 201 - Priya Patel)
    const checkIn2 = new Date(today);
    checkIn2.setDate(today.getDate() - 2);
    const checkOut2 = new Date(today);
    checkOut2.setDate(today.getDate() + 1);

    const b2 = await Booking.create({
      bookingId: 'BK-204918',
      user: customers[1]._id,
      room: createdRooms['201']._id,
      roomType: createdRoomTypes['Deluxe Room']._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      adults: 2,
      children: 1,
      nights: 3,
      subtotal: 13497,
      taxes: 1620,
      totalAmount: 15117,
      bookingStatus: 'CHECKED_IN',
      paymentStatus: 'SUCCESS',
      specialRequests: 'Quiet room away from elevators',
      guestName: customers[1].name,
      guestEmail: customers[1].email,
      guestPhone: customers[1].phone
    });

    await Payment.create({
      booking: b2._id,
      user: customers[1]._id,
      razorpayOrderId: 'order_test_2049',
      razorpayPaymentId: 'pay_test_2049',
      amount: 15117,
      currency: 'INR',
      paymentMethod: 'UPI (Google Pay)',
      paymentStatus: 'SUCCESS',
      transactionReference: 'TXN-UPI-204918',
      isMockPayment: true
    });

    await CheckIn.create({
      booking: b2._id,
      receptionist: receptionistUser._id,
      actualCheckIn: checkIn2,
      assignedRoom: createdRooms['201']._id,
      roomNumber: '201',
      notes: 'Baby cot provided in room.'
    });

    // Booking 3: CONFIRMED Upcoming (Room 301 - Amit Verma)
    const checkIn3 = new Date(today);
    checkIn3.setDate(today.getDate() + 3);
    const checkOut3 = new Date(today);
    checkOut3.setDate(today.getDate() + 6);

    const b3 = await Booking.create({
      bookingId: 'BK-391024',
      user: customers[2]._id,
      room: createdRooms['301']._id,
      roomType: createdRoomTypes['Premium Room']._id,
      checkInDate: checkIn3,
      checkOutDate: checkOut3,
      adults: 2,
      children: 0,
      nights: 3,
      subtotal: 20997,
      taxes: 2520,
      totalAmount: 23517,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      specialRequests: 'Honeymoon stay, flower petals decoration if possible',
      guestName: customers[2].name,
      guestEmail: customers[2].email,
      guestPhone: customers[2].phone
    });

    await Payment.create({
      booking: b3._id,
      user: customers[2]._id,
      razorpayOrderId: 'order_test_3910',
      razorpayPaymentId: 'pay_test_3910',
      amount: 23517,
      currency: 'INR',
      paymentMethod: 'Razorpay NetBanking (HDFC)',
      paymentStatus: 'SUCCESS',
      transactionReference: 'TXN-RZP-391024',
      isMockPayment: false
    });

    // Booking 4: CONFIRMED Upcoming (Executive Suite 401 - Sneha Reddy)
    const checkIn4 = new Date(today);
    checkIn4.setDate(today.getDate() + 1);
    const checkOut4 = new Date(today);
    checkOut4.setDate(today.getDate() + 4);

    const b4 = await Booking.create({
      bookingId: 'BK-492015',
      user: customers[3]._id,
      room: createdRooms['401']._id,
      roomType: createdRoomTypes['Executive Suite']._id,
      checkInDate: checkIn4,
      checkOutDate: checkOut4,
      adults: 3,
      children: 0,
      nights: 3,
      subtotal: 35997,
      taxes: 6479,
      totalAmount: 42476,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      specialRequests: 'Airport pickup required at 2 PM',
      guestName: customers[3].name,
      guestEmail: customers[3].email,
      guestPhone: customers[3].phone
    });

    await Payment.create({
      booking: b4._id,
      user: customers[3]._id,
      razorpayOrderId: 'order_test_4920',
      razorpayPaymentId: 'pay_test_4920',
      amount: 42476,
      currency: 'INR',
      paymentMethod: 'Credit Card (Amex)',
      paymentStatus: 'SUCCESS',
      transactionReference: 'TXN-RZP-492015',
      isMockPayment: false
    });

    // Booking 5: Past Completed (CHECKED_OUT - Vikram Singh)
    const checkIn5 = new Date(today);
    checkIn5.setDate(today.getDate() - 10);
    const checkOut5 = new Date(today);
    checkOut5.setDate(today.getDate() - 7);

    const b5 = await Booking.create({
      bookingId: 'BK-582910',
      user: customers[4]._id,
      room: createdRooms['101']._id,
      roomType: createdRoomTypes['Standard Room']._id,
      checkInDate: checkIn5,
      checkOutDate: checkOut5,
      adults: 2,
      children: 0,
      nights: 3,
      subtotal: 7497,
      taxes: 900,
      totalAmount: 8397,
      bookingStatus: 'CHECKED_OUT',
      paymentStatus: 'SUCCESS',
      specialRequests: 'Late check-out request',
      guestName: customers[4].name,
      guestEmail: customers[4].email,
      guestPhone: customers[4].phone
    });

    await Payment.create({
      booking: b5._id,
      user: customers[4]._id,
      razorpayOrderId: 'order_test_5829',
      razorpayPaymentId: 'pay_test_5829',
      amount: 8397,
      currency: 'INR',
      paymentMethod: 'Razorpay UPI',
      paymentStatus: 'SUCCESS',
      transactionReference: 'TXN-RZP-582910',
      isMockPayment: true
    });

    await CheckIn.create({
      booking: b5._id,
      receptionist: receptionistUser._id,
      actualCheckIn: checkIn5,
      actualCheckOut: checkOut5,
      assignedRoom: createdRooms['101']._id,
      roomNumber: '101',
      notes: 'Guest checked out smoothly. Mini-bar checked.'
    });

    // Booking 6: CANCELLED with Policy calculation (Ananya Deshmukh)
    const checkIn6 = new Date(today);
    checkIn6.setDate(today.getDate() + 5);
    const checkOut6 = new Date(today);
    checkOut6.setDate(today.getDate() + 7);

    const b6 = await Booking.create({
      bookingId: 'BK-691038',
      user: customers[5]._id,
      room: createdRooms['202']._id,
      roomType: createdRoomTypes['Deluxe Room']._id,
      checkInDate: checkIn6,
      checkOutDate: checkOut6,
      adults: 2,
      children: 0,
      nights: 2,
      subtotal: 8998,
      taxes: 1080,
      totalAmount: 10078,
      bookingStatus: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      specialRequests: 'Early check-in',
      guestName: customers[5].name,
      guestEmail: customers[5].email,
      guestPhone: customers[5].phone
    });

    await Payment.create({
      booking: b6._id,
      user: customers[5]._id,
      razorpayOrderId: 'order_test_6910',
      razorpayPaymentId: 'pay_test_6910',
      amount: 10078,
      currency: 'INR',
      paymentMethod: 'Razorpay Test Card',
      paymentStatus: 'REFUNDED',
      transactionReference: 'TXN-RZP-691038',
      isMockPayment: true
    });

    await Cancellation.create({
      booking: b6._id,
      user: customers[5]._id,
      cancellationReason: 'Business meeting rescheduled by company.',
      cancellationDate: new Date(),
      cancellationCharges: 0,
      refundAmount: 10078,
      refundStatus: 'PROCESSED'
    });

    console.log('✅ Created historical, active, confirmed, and cancelled sample reservations.');
    console.log('🎉 Database seeding completed successfully for The Grand Heritage Hotel!');
    return true;
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    throw err;
  }
};

// If run directly from CLI
if (require.main === module) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;

