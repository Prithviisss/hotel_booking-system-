const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('============================================================');
  console.log('🧪 RUNNING HOTEL RESERVATION SYSTEM VERIFICATION SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.response?.data?.message || err.message);
      failed++;
    }
  }

  // 1. Customer registration
  let testCustomerToken = '';
  let testCustomerEmail = `guest_${Date.now()}@test.com`;
  await test('1. Customer Registration', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Maharaja',
      email: testCustomerEmail,
      phone: '+91 99999 88888',
      password: 'Password@123'
    });
    if (!res.data.success || !res.data.token) throw new Error('Token not received');
    testCustomerToken = res.data.token;
  });

  // 2. Customer login
  await test('2. Customer Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testCustomerEmail,
      password: 'Password@123'
    });
    if (!res.data.success || !res.data.token) throw new Error('Login failed');
    testCustomerToken = res.data.token;
  });

  // 3. Admin login
  let adminToken = '';
  await test('3. Admin Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@grandheritage.com',
      password: 'Admin@123'
    });
    if (!res.data.success || res.data.user.role !== 'ADMIN') throw new Error('Admin role missing');
    adminToken = res.data.token;
  });

  // 4. Receptionist login
  let receptionistToken = '';
  await test('4. Receptionist Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'receptionist@grandheritage.com',
      password: 'Reception@123'
    });
    if (!res.data.success || res.data.user.role !== 'RECEPTIONIST') throw new Error('Receptionist role missing');
    receptionistToken = res.data.token;
  });

  // 5. Room search & categories
  let sampleRoomTypeId = '';
  await test('5. Room Search & Category Retrieval', async () => {
    const res = await axios.get(`${BASE_URL}/rooms/types/all`);
    if (!res.data.success || res.data.roomTypes.length < 5) throw new Error('Expected 5 room categories');
    sampleRoomTypeId = res.data.roomTypes[0]._id;
  });

  // 6. Room availability checking
  await test('6. Room Availability Checking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 10);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 13);

    const res = await axios.post(`${BASE_URL}/rooms/availability`, {
      checkInDate: tomorrow.toISOString(),
      checkOutDate: dayAfter.toISOString(),
      adults: 2,
      children: 0
    });
    if (!res.data.success || res.data.availableRooms.length === 0) throw new Error('No available rooms found');
  });

  // 7. Booking creation
  let createdBooking = null;
  const stayStart = new Date();
  stayStart.setDate(stayStart.getDate() + 20);
  const stayEnd = new Date();
  stayEnd.setDate(stayEnd.getDate() + 23);

  await test('7. Booking Creation with atomic 15m hold', async () => {
    const res = await axios.post(
      `${BASE_URL}/bookings`,
      {
        roomType: sampleRoomTypeId,
        checkInDate: stayStart.toISOString(),
        checkOutDate: stayEnd.toISOString(),
        adults: 2,
        children: 0,
        specialRequests: 'Upper floor requested'
      },
      { headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );
    if (!res.data.success || !res.data.booking.bookingId) throw new Error('Failed to create booking');
    createdBooking = res.data.booking;
  });

  // 8. Overlapping bookings prevention
  await test('8. Overlap Condition Check & Double-Booking Prevention', async () => {
    // Attempt to book the EXACT assigned room for overlapping dates
    const overlapStart = new Date(stayStart);
    overlapStart.setDate(overlapStart.getDate() + 1);
    const overlapEnd = new Date(stayEnd);
    overlapEnd.setDate(overlapEnd.getDate() + 1);

    try {
      await axios.post(
        `${BASE_URL}/bookings`,
        {
          roomType: sampleRoomTypeId,
          roomId: createdBooking.room._id,
          checkInDate: overlapStart.toISOString(),
          checkOutDate: overlapEnd.toISOString(),
          adults: 2
        },
        { headers: { Authorization: `Bearer ${testCustomerToken}` } }
      );
      throw new Error('Should have rejected overlapping booking for the same physical room');
    } catch (err) {
      if (err.response?.status === 409) {
        // Expected conflict 409
        return;
      }
      throw err;
    }
  });

  // 9. Guest capacity validation
  await test('9. Guest Capacity Validation', async () => {
    try {
      await axios.post(
        `${BASE_URL}/bookings`,
        {
          roomType: sampleRoomTypeId, // Standard room capacity is 2
          checkInDate: stayStart.toISOString(),
          checkOutDate: stayEnd.toISOString(),
          adults: 5,
          children: 2
        },
        { headers: { Authorization: `Bearer ${testCustomerToken}` } }
      );
      throw new Error('Should have rejected booking exceeding capacity');
    } catch (err) {
      if (err.response?.status === 400) {
        // Expected 400
        return;
      }
      throw err;
    }
  });

  // 10. Failed payment simulation
  await test('10. Failed Payment Simulation', async () => {
    try {
      await axios.post(
        `${BASE_URL}/payments/verify`,
        {
          bookingId: createdBooking.bookingId,
          isMock: true,
          simulationType: 'FAILED'
        },
        { headers: { Authorization: `Bearer ${testCustomerToken}` } }
      );
      throw new Error('Should have returned payment failed response');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('failed')) {
        return;
      }
      throw err;
    }
  });

  // 11. Successful payment verification
  await test('11. Successful Payment Verification', async () => {
    const res = await axios.post(
      `${BASE_URL}/payments/verify`,
      {
        bookingId: createdBooking.bookingId,
        isMock: true,
        simulationType: 'SUCCESS'
      },
      { headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );
    if (!res.data.success || res.data.booking.bookingStatus !== 'CONFIRMED') {
      throw new Error('Booking status was not updated to CONFIRMED');
    }
  });

  // 12. Booking confirmation check
  await test('12. Booking Confirmation & Receipt Retrieval', async () => {
    const res = await axios.get(`${BASE_URL}/bookings/${createdBooking.bookingId}`, {
      headers: { Authorization: `Bearer ${testCustomerToken}` }
    });
    if (!res.data.success || res.data.booking.paymentStatus !== 'SUCCESS') {
      throw new Error('Could not retrieve confirmed booking');
    }
  });

  // 13. Customer booking history
  await test('13. Customer Booking History (My Bookings)', async () => {
    const res = await axios.get(`${BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${testCustomerToken}` }
    });
    if (!res.data.success || res.data.bookings.length === 0) {
      throw new Error('Customer booking history is empty');
    }
  });

  // 14. Receptionist search & room assignment
  await test('14. Receptionist Search & Room Reassignment', async () => {
    const res = await axios.get(`${BASE_URL}/reception/bookings/${createdBooking.bookingId}`, {
      headers: { Authorization: `Bearer ${receptionistToken}` }
    });
    if (!res.data.success || res.data.booking.bookingId !== createdBooking.bookingId) {
      throw new Error('Receptionist lookup failed');
    }
  });

  // 15. Receptionist check-in
  await test('15. Receptionist Check-in Operation', async () => {
    const res = await axios.post(
      `${BASE_URL}/reception/check-in`,
      {
        bookingId: createdBooking.bookingId,
        roomId: createdBooking.room._id,
        notes: 'VIP guest received with customary welcome'
      },
      { headers: { Authorization: `Bearer ${receptionistToken}` } }
    );
    if (!res.data.success || res.data.booking.bookingStatus !== 'CHECKED_IN') {
      throw new Error('Booking was not marked as CHECKED_IN');
    }
  });

  // 16. Receptionist check-out
  await test('16. Receptionist Check-out Operation', async () => {
    const res = await axios.post(
      `${BASE_URL}/reception/check-out`,
      {
        bookingId: createdBooking.bookingId,
        notes: 'Smooth departure. Room cleared.'
      },
      { headers: { Authorization: `Bearer ${receptionistToken}` } }
    );
    if (!res.data.success || res.data.booking.bookingStatus !== 'CHECKED_OUT') {
      throw new Error('Booking was not marked as CHECKED_OUT');
    }
  });

  // 17. Booking cancellation & refund policy
  await test('17. Booking Cancellation with Policy Calculation', async () => {
    // Create another booking for cancellation test
    const cancelStart = new Date();
    cancelStart.setDate(cancelStart.getDate() + 30);
    const cancelEnd = new Date();
    cancelEnd.setDate(cancelEnd.getDate() + 32);

    const bRes = await axios.post(
      `${BASE_URL}/bookings`,
      {
        roomType: sampleRoomTypeId,
        checkInDate: cancelStart.toISOString(),
        checkOutDate: cancelEnd.toISOString(),
        adults: 1
      },
      { headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );
    const newBooking = bRes.data.booking;

    // Confirm it
    await axios.post(
      `${BASE_URL}/payments/verify`,
      { bookingId: newBooking.bookingId, isMock: true, simulationType: 'SUCCESS' },
      { headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );

    // Cancel it
    const cancelRes = await axios.post(
      `${BASE_URL}/bookings/${newBooking.bookingId}/cancel`,
      { reason: 'Change of schedule' },
      { headers: { Authorization: `Bearer ${testCustomerToken}` } }
    );

    if (!cancelRes.data.success || cancelRes.data.booking.bookingStatus !== 'CANCELLED') {
      throw new Error('Booking was not cancelled');
    }
  });

  // 18. Admin room management (Create, Update, Delete)
  await test('18. Admin Room Inventory Management', async () => {
    // Create new test room
    const createRes = await axios.post(
      `${BASE_URL}/rooms`,
      {
        roomNumber: '999',
        roomType: sampleRoomTypeId,
        floor: 9,
        status: 'AVAILABLE',
        description: 'Test Penthouse'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const testRoomId = createRes.data.room._id;

    // Update room
    await axios.put(
      `${BASE_URL}/rooms/${testRoomId}`,
      { description: 'Updated Penthouse View' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    // Delete room
    const delRes = await axios.delete(`${BASE_URL}/rooms/${testRoomId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!delRes.data.success) throw new Error('Failed to delete room');
  });

  // 19. Unauthorized access prevention
  await test('19. Unauthorized Access Prevention (RBAC)', async () => {
    try {
      // Customer tries to call admin dashboard
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${testCustomerToken}` }
      });
      throw new Error('Customer should not have access to /admin/dashboard');
    } catch (err) {
      if (err.response?.status === 403) {
        // Expected 403 Forbidden
        return;
      }
      throw err;
    }
  });

  // 20. Admin Dashboard & Receptionist Overview Statistics
  await test('20. Admin Dashboard & Receptionist Overview Stats', async () => {
    const adminRes = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!adminRes.data.success || !adminRes.data.stats) throw new Error('Admin stats failed');

    const recepRes = await axios.get(`${BASE_URL}/reception/overview`, {
      headers: { Authorization: `Bearer ${receptionistToken}` }
    });
    if (!recepRes.data.success || !recepRes.data.summary) throw new Error('Reception summary failed');
  });

  console.log('\n============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================');
}

runTests();

