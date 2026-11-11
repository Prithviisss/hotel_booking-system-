import React, { useState, useEffect } from 'react';
import {
  adminService,
  roomService,
  bookingService
} from '../services/api';
import {
  formatCurrency,
  formatDate,
  getStatusBadge
} from '../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  LayoutDashboard,
  Bed,
  Layers,
  CalendarCheck,
  Users,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeSection, setActiveSection] = useState('OVERVIEW'); // 'OVERVIEW', 'ROOMS', 'CATEGORIES', 'BOOKINGS', 'CUSTOMERS', 'REVENUE'
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  // Sub-data states
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  // Filters for bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    roomType: '',
    floor: '1',
    status: 'AVAILABLE',
    description: ''
  });

  const [notification, setNotification] = useState({ type: '', message: '' });

  // Load Overview Data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.data?.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Rooms
  const loadRooms = async () => {
    try {
      const [roomsRes, typesRes] = await Promise.all([
        roomService.getRooms(),
        roomService.getRoomTypes()
      ]);
      if (roomsRes.data?.success) setRooms(roomsRes.data.rooms);
      if (typesRes.data?.success) setRoomTypes(typesRes.data.roomTypes);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Bookings
  const loadBookings = async () => {
    try {
      const res = await bookingService.getAllBookings({
        search: bookingSearch,
        status: bookingStatusFilter
      });
      if (res.data?.success) setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Customers
  const loadCustomers = async () => {
    try {
      const res = await adminService.getCustomers();
      if (res.data?.success) setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Revenue
  const loadRevenue = async () => {
    try {
      const res = await adminService.getRevenue();
      if (res.data?.success) setRevenueData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadRooms();
  }, []);

  useEffect(() => {
    if (activeSection === 'BOOKINGS') loadBookings();
    if (activeSection === 'CUSTOMERS') loadCustomers();
    if (activeSection === 'REVENUE') loadRevenue();
  }, [activeSection, bookingStatusFilter, bookingSearch]);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  // Handle Room Form Submit (Add or Edit)
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, roomFormData);
        showToast('success', `Room ${roomFormData.roomNumber} updated successfully.`);
      } else {
        await roomService.createRoom(roomFormData);
        showToast('success', `Room ${roomFormData.roomNumber} created successfully.`);
      }
      setShowRoomModal(false);
      setEditingRoom(null);
      loadRooms();
      loadDashboardData();
    } catch (err) {
      showToast('error', err.message || 'Operation failed.');
    }
  };

  // Handle Room Delete
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}? This cannot be undone.`)) {
      return;
    }
    try {
      await roomService.deleteRoom(roomId);
      showToast('success', `Room ${roomNumber} deleted successfully.`);
      loadRooms();
      loadDashboardData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete room.');
    }
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      roomType: roomTypes[0]?._id || '',
      floor: '1',
      status: 'AVAILABLE',
      description: ''
    });
    setShowRoomModal(true);
  };

  const openEditRoom = (r) => {
    setEditingRoom(r);
    setRoomFormData({
      roomNumber: r.roomNumber,
      roomType: r.roomType?._id || r.roomType,
      floor: r.floor,
      status: r.status,
      description: r.description || ''
    });
    setShowRoomModal(true);
  };

  return (
    <div className="bg-ivory min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
              Executive Hotel Control Center
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Administrative Command Dashboard
            </h1>
            <p className="text-xs text-warmgrey mt-1">
              Real-time monitoring of room inventories, occupancy metrics, customer profiles, and gross revenues.
            </p>
          </div>

          <button
            onClick={() => {
              loadDashboardData();
              loadRooms();
              showToast('success', 'Refreshed live dashboard metrics.');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-ivory hover:bg-beige-light border border-beige-border text-charcoal rounded-xl text-xs font-semibold uppercase tracking-wider transition"
          >
            <RefreshCw size={14} className="text-gold" />
            <span>Refresh Data</span>
          </button>
        </div>

        {notification.message && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="font-bold">✕</button>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-beige-border">
          {[
            { id: 'OVERVIEW', label: 'Overview & Analytics', icon: <LayoutDashboard size={15} /> },
            { id: 'ROOMS', label: 'Room Inventory', icon: <Bed size={15} /> },
            { id: 'CATEGORIES', label: 'Categories & Suites', icon: <Layers size={15} /> },
            { id: 'BOOKINGS', label: 'All Reservations', icon: <CalendarCheck size={15} /> },
            { id: 'CUSTOMERS', label: 'Guest Accounts', icon: <Users size={15} /> },
            { id: 'REVENUE', label: 'Financial Records', icon: <CreditCard size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shrink-0 ${
                activeSection === tab.id
                  ? 'bg-gold text-white shadow-sm'
                  : 'bg-white text-charcoal border border-beige-border hover:bg-beige-light'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeSection === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
                <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Total Inventory</span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {statsData?.stats?.totalRooms || 0}
                </span>
                <span className="text-[10px] text-warmgrey mt-1 block">Configured physical rooms</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 block">Available Now</span>
                <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">
                  {statsData?.stats?.availableRooms || 0}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 block">Ready for guest stay</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
                <span className="text-[10px] uppercase tracking-wider text-amber-700 block">Occupied Rooms</span>
                <span className="font-serif text-2xl font-bold text-amber-700 mt-1 block">
                  {statsData?.stats?.occupiedRooms || 0}
                </span>
                <span className="text-[10px] text-amber-600 mt-1 block">Guests checked in</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
                <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Total Bookings</span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {statsData?.stats?.totalReservations || 0}
                </span>
                <span className="text-[10px] text-warmgrey mt-1 block">Lifetime reservations</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
                <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Registered Guests</span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {statsData?.stats?.totalCustomers || 0}
                </span>
                <span className="text-[10px] text-warmgrey mt-1 block">Customer profiles</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gold/30 shadow-soft bg-gold/5">
                <span className="text-[10px] uppercase tracking-wider text-gold-dark font-bold block">Gross Revenue</span>
                <span className="font-serif text-2xl font-bold text-gold-dark mt-1 block">
                  {formatCurrency(statsData?.stats?.totalRevenue || 0)}
                </span>
                <span className="text-[10px] text-gold-dark mt-1 block">Verified payments</span>
              </div>
            </div>

            {/* Recharts Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend Area Chart */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige-border shadow-soft">
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold text-charcoal">
                    Monthly Revenue Trend (INR)
                  </h3>
                  <p className="text-xs text-warmgrey">Financial growth over recent billing periods</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={statsData?.monthlyRevenue || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C5A46D" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#C5A46D" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
                      <XAxis dataKey="month" stroke="#777777" fontSize={11} />
                      <YAxis stroke="#777777" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Revenue']}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE5DC', borderRadius: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C5A46D"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#goldGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Occupancy by Room Category Bar Chart */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige-border shadow-soft">
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold text-charcoal">
                    Suite Occupancy & Total Rooms
                  </h3>
                  <p className="text-xs text-warmgrey">Physical room allocation by category</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statsData?.categoryStats || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
                      <XAxis dataKey="name" stroke="#777777" fontSize={10} tickFormatter={(n) => n.split(' ')[0]} />
                      <YAxis stroke="#777777" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE5DC', borderRadius: '12px' }}
                      />
                      <Bar dataKey="totalRooms" fill="#EDE5D8" name="Total Rooms" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="occupiedRooms" fill="#C5A46D" name="Occupied Rooms" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">
                    Recent Reservations
                  </h3>
                  <p className="text-xs text-warmgrey">Latest transactions received across platforms</p>
                </div>
                <button
                  onClick={() => setActiveSection('BOOKINGS')}
                  className="text-xs font-semibold text-gold-dark hover:underline"
                >
                  View All Bookings →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Booking Ref</th>
                      <th className="pb-3 font-semibold">Guest</th>
                      <th className="pb-3 font-semibold">Suite Category</th>
                      <th className="pb-3 font-semibold">Check-in / Out</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-border/50 text-charcoal">
                    {(statsData?.recentBookings || []).map((b) => {
                      const badge = getStatusBadge(b.bookingStatus);
                      return (
                        <tr key={b._id} className="hover:bg-ivory/50 transition">
                          <td className="py-3 font-mono font-bold text-charcoal">{b.bookingId}</td>
                          <td className="py-3">
                            <span className="font-semibold block">{b.guestName}</span>
                            <span className="text-[10px] text-warmgrey">{b.guestPhone}</span>
                          </td>
                          <td className="py-3">{b.roomType?.name}</td>
                          <td className="py-3">
                            <span>{formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}</span>
                          </td>
                          <td className="py-3 font-bold text-gold-dark">{formatCurrency(b.totalAmount)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROOM INVENTORY MANAGEMENT */}
        {activeSection === 'ROOMS' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-beige-border">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  Hotel Room Inventory ({rooms.length} Rooms)
                </h3>
                <p className="text-xs text-warmgrey">Manage physical units, floor numbers, and operational statuses.</p>
              </div>

              <button
                onClick={openAddRoom}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
              >
                <Plus size={16} />
                <span>Add Physical Room</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Room #</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Floor</th>
                    <th className="pb-3 font-semibold">Base Price</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-border/50 text-charcoal">
                  {rooms.map((r) => {
                    const statusBadge = getStatusBadge(r.status);
                    return (
                      <tr key={r._id} className="hover:bg-ivory/50 transition">
                        <td className="py-3.5 font-bold text-sm text-charcoal">Room {r.roomNumber}</td>
                        <td className="py-3.5 font-medium">{r.roomType?.name || 'Standard'}</td>
                        <td className="py-3.5 text-warmgrey">Floor {r.floor}</td>
                        <td className="py-3.5 font-bold text-gold-dark">
                          {formatCurrency(r.roomType?.basePrice || 0)} / nt
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditRoom(r)}
                            className="p-1.5 text-warmgrey hover:text-gold-dark hover:bg-beige-light rounded-lg transition"
                            title="Edit room"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                            className="p-1.5 text-warmgrey hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete room"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES & SUITES */}
        {activeSection === 'CATEGORIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((rt) => (
              <div key={rt._id} className="bg-white rounded-3xl border border-beige-border p-6 shadow-soft space-y-4">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-ivory">
                  <img src={rt.images?.[0]} alt={rt.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-lg font-bold text-charcoal">{rt.name}</h4>
                    <span className="font-serif text-lg font-bold text-gold-dark">{formatCurrency(rt.basePrice)}</span>
                  </div>
                  <p className="text-xs text-warmgrey mt-0.5">{rt.bedType} • Max {rt.maxCapacity} Guests</p>
                </div>
                <p className="text-xs text-warmgrey line-clamp-2 leading-relaxed">{rt.description}</p>
                <div className="pt-3 border-t border-beige-border text-[11px] text-warmgrey space-y-1">
                  <span className="font-semibold text-charcoal block">Key Amenities:</span>
                  <div className="flex flex-wrap gap-1">
                    {(rt.amenities || []).slice(0, 4).map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-ivory rounded border border-beige-border">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ALL RESERVATIONS */}
        {activeSection === 'BOOKINGS' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-beige-border">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  Master Booking Registry ({bookings.length} Bookings)
                </h3>
                <p className="text-xs text-warmgrey">Search, filter, and audit guest reservations across the system.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-2.5 text-warmgrey" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search by ID or guest..."
                    className="pl-8 pr-3 py-1.5 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold w-full sm:w-48"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Ref</th>
                    <th className="pb-3 font-semibold">Guest</th>
                    <th className="pb-3 font-semibold">Suite / Category</th>
                    <th className="pb-3 font-semibold">Stay Schedule</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Booking Status</th>
                    <th className="pb-3 font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-border/50 text-charcoal">
                  {bookings.map((b) => {
                    const statusBadge = getStatusBadge(b.bookingStatus);
                    const payBadge = getStatusBadge(b.paymentStatus);
                    return (
                      <tr key={b._id} className="hover:bg-ivory/50 transition">
                        <td className="py-3 font-mono font-bold text-charcoal">{b.bookingId}</td>
                        <td className="py-3">
                          <span className="font-semibold block">{b.guestName}</span>
                          <span className="text-[10px] text-warmgrey">{b.guestEmail}</span>
                        </td>
                        <td className="py-3">
                          <span>{b.roomType?.name}</span>
                          {b.room?.roomNumber && (
                            <span className="block text-[10px] text-gold-dark font-medium">Rm #{b.room.roomNumber}</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span>{formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}</span>
                          <span className="block text-[10px] text-warmgrey">{b.nights} nights • {b.adults}A {b.children ? `${b.children}C` : ''}</span>
                        </td>
                        <td className="py-3 font-bold text-gold-dark">{formatCurrency(b.totalAmount)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${payBadge.bg}`}>
                            {payBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: GUEST ACCOUNTS */}
        {activeSection === 'CUSTOMERS' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="pb-6 border-b border-beige-border">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                Registered Guest Directory ({customers.length} Accounts)
              </h3>
              <p className="text-xs text-warmgrey">Lifetime customer booking history and cumulative spend.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Guest Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Member Since</th>
                    <th className="pb-3 font-semibold">Total Stays</th>
                    <th className="pb-3 font-semibold">Cumulative Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-border/50 text-charcoal">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-ivory/50 transition">
                      <td className="py-3 font-bold text-charcoal">{c.name}</td>
                      <td className="py-3 text-warmgrey">{c.email}</td>
                      <td className="py-3 text-warmgrey">{c.phone}</td>
                      <td className="py-3 text-warmgrey">{formatDate(c.createdAt)}</td>
                      <td className="py-3 font-semibold text-charcoal">{c.totalBookings} stay{c.totalBookings > 1 ? 's' : ''}</td>
                      <td className="py-3 font-bold text-gold-dark">{formatCurrency(c.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: FINANCIAL RECORDS */}
        {activeSection === 'REVENUE' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-beige-border">
              <div className="p-4 bg-ivory rounded-2xl border border-beige-border">
                <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Gross Receipts</span>
                <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
                  {formatCurrency(revenueData?.summary?.grossRevenue || 0)}
                </span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-[10px] uppercase tracking-wider text-rose-700 block">Refunds & Cancellations</span>
                <span className="font-serif text-2xl font-bold text-rose-700 mt-1 block">
                  {formatCurrency(revenueData?.summary?.refundedRevenue || 0)}
                </span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] uppercase tracking-wider text-emerald-800 block">Net Recognized Revenue</span>
                <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block">
                  {formatCurrency(revenueData?.summary?.netRevenue || 0)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Payment Ref</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Gateway / Method</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-border/50 text-charcoal">
                  {(revenueData?.payments || []).map((p) => {
                    const badge = getStatusBadge(p.paymentStatus);
                    return (
                      <tr key={p._id} className="hover:bg-ivory/50 transition">
                        <td className="py-3 font-mono font-bold text-charcoal">{p.transactionReference || p._id}</td>
                        <td className="py-3">{p.user?.name || 'Guest'}</td>
                        <td className="py-3 text-warmgrey">{p.paymentMethod}</td>
                        <td className="py-3 font-bold text-gold-dark">{formatCurrency(p.amount)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 text-warmgrey">{formatDate(p.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ADD / EDIT ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-dark/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-beige-border shadow-elevated max-w-md w-full overflow-hidden text-charcoal">
            <div className="bg-ivory border-b border-beige-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room Unit'}
              </h3>
              <button onClick={() => setShowRoomModal(false)} className="text-warmgrey hover:text-charcoal p-1">✕</button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Room Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomFormData.roomNumber}
                  onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                  placeholder="e.g. 306"
                  required
                  className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Room Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={roomFormData.roomType}
                  onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt._id} value={rt._id}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">Floor #</label>
                  <input
                    type="number"
                    min="1"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">Operational Status</label>
                  <select
                    value={roomFormData.status}
                    onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">Description / Location Notes</label>
                <textarea
                  rows={2}
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  placeholder="e.g. Garden facing suite with sunset view"
                  className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="py-2.5 px-4 bg-beige-light hover:bg-beige text-charcoal font-medium rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;

