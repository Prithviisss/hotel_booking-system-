import React, { useState, useEffect } from 'react';
import { receptionService, roomService } from '../services/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/formatters';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  LogOut,
  LogIn,
  Bed,
  Calendar,
  AlertTriangle,
  Loader2,
  RefreshCw,
  User,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';

const ReceptionistDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('SEARCH'); // 'SEARCH', 'TODAY_CHECKINS', 'TODAY_CHECKOUTS', 'OCCUPIED', 'ROOM_MATRIX'
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedRoomToAssign, setSelectedRoomToAssign] = useState('');

  // Notifications
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await receptionService.getOverview();
      if (res.data?.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reception overview:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  // Search reservation
  const handleSearchReservation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchResult(null);
      const res = await receptionService.searchReservation(searchQuery.trim());
      if (res.data?.success) {
        setSearchResult(res.data);
        if (res.data.availableRoomsForAssignment?.length) {
          setSelectedRoomToAssign(res.data.availableRoomsForAssignment[0]._id);
        }
      }
    } catch (err) {
      showToast('error', err.message || 'No booking found matching query');
    } finally {
      setSearchLoading(false);
    }
  };

  // Check-In Action
  const handleCheckIn = async (bookingId, roomId) => {
    try {
      setSearchLoading(true);
      const res = await receptionService.checkInGuest({
        bookingId,
        roomId: roomId || undefined
      });
      showToast('success', res.data.message || 'Guest checked in successfully!');
      fetchOverview();
      // Refresh current search result if viewing
      if (searchResult?.booking?.bookingId === bookingId) {
        handleSearchReservation();
      }
    } catch (err) {
      showToast('error', err.message || 'Check-in failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Check-Out Action
  const handleCheckOut = async (bookingId) => {
    try {
      setSearchLoading(true);
      const res = await receptionService.checkOutGuest({ bookingId });
      showToast('success', res.data.message || 'Guest checked out successfully! Room freed.');
      fetchOverview();
      if (searchResult?.booking?.bookingId === bookingId) {
        handleSearchReservation();
      }
    } catch (err) {
      showToast('error', err.message || 'Check-out failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Assign Physical Room
  const handleAssignRoom = async (bookingId) => {
    if (!selectedRoomToAssign) return;
    try {
      setSearchLoading(true);
      const res = await receptionService.assignRoom({
        bookingId,
        roomId: selectedRoomToAssign
      });
      showToast('success', res.data.message);
      handleSearchReservation();
      fetchOverview();
    } catch (err) {
      showToast('error', err.message || 'Room assignment failed');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="bg-ivory min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
              Guest Services & Front Desk
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Receptionist Operations Console
            </h1>
            <p className="text-xs text-warmgrey mt-1">
              Check-in arrivals, verify reservations, assign luxury rooms, and process guest check-outs.
            </p>
          </div>

          <button
            onClick={() => {
              fetchOverview();
              showToast('success', 'Front desk status updated.');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-ivory hover:bg-beige-light border border-beige-border text-charcoal rounded-xl text-xs font-semibold uppercase tracking-wider transition"
          >
            <RefreshCw size={14} className="text-gold" />
            <span>Refresh Board</span>
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
              {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="font-bold">✕</button>
          </div>
        )}

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
            <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Arrivals Today</span>
            <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
              {overviewData?.summary?.todaysCheckInsCount || 0}
            </span>
            <span className="text-[10px] text-warmgrey">Scheduled check-ins</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
            <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Departures Today</span>
            <span className="font-serif text-2xl font-bold text-charcoal mt-1 block">
              {overviewData?.summary?.todaysCheckOutsCount || 0}
            </span>
            <span className="text-[10px] text-warmgrey">Scheduled check-outs</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
            <span className="text-[10px] uppercase tracking-wider text-amber-700 block">Occupied Rooms</span>
            <span className="font-serif text-2xl font-bold text-amber-700 mt-1 block">
              {overviewData?.summary?.currentlyOccupiedCount || 0}
            </span>
            <span className="text-[10px] text-amber-600">In-house guests</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-beige-border shadow-soft">
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 block">Total Capacity</span>
            <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">
              {overviewData?.summary?.totalRoomsCount || 0}
            </span>
            <span className="text-[10px] text-emerald-600">Total physical units</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-beige-border">
          {[
            { id: 'SEARCH', label: 'Reservation Lookup & Actions', icon: <Search size={15} /> },
            { id: 'TODAY_CHECKINS', label: `Today's Check-ins (${overviewData?.todaysCheckIns?.length || 0})`, icon: <LogIn size={15} /> },
            { id: 'TODAY_CHECKOUTS', label: `Today's Check-outs (${overviewData?.todaysCheckOuts?.length || 0})`, icon: <LogOut size={15} /> },
            { id: 'OCCUPIED', label: `In-House Guests (${overviewData?.occupiedBookings?.length || 0})`, icon: <User size={15} /> },
            { id: 'ROOM_MATRIX', label: 'Live Room Matrix', icon: <Bed size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gold text-white shadow-sm'
                  : 'bg-white text-charcoal border border-beige-border hover:bg-beige-light'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: RESERVATION LOOKUP & INSTANT CHECK-IN/OUT */}
        {activeTab === 'SEARCH' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-4">
                Verify Reservation & Guest Identity
              </h3>

              <form onSubmit={handleSearchReservation} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-3 text-warmgrey" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Booking ID (e.g. BK-108291) or guest name / email / phone..."
                    className="w-full pl-10 pr-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-xs sm:text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
                >
                  {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>Lookup</span>
                </button>
              </form>
            </div>

            {/* Search Result Card */}
            {searchResult?.booking && (
              <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-luxury space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-beige-border gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-2xl font-bold text-charcoal">
                        {searchResult.booking.bookingId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(searchResult.booking.bookingStatus).bg}`}>
                        {getStatusBadge(searchResult.booking.bookingStatus).label}
                      </span>
                    </div>
                    <p className="text-xs text-warmgrey mt-0.5">
                      Reserved by: <strong className="text-charcoal">{searchResult.booking.guestName}</strong> ({searchResult.booking.guestEmail})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-warmgrey block">Payment Status</span>
                    <span className="font-bold text-emerald-700 text-sm flex items-center gap-1 justify-end">
                      <ShieldCheck size={16} />
                      {searchResult.booking.paymentStatus} ({formatCurrency(searchResult.booking.totalAmount)})
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 text-xs">
                  <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                    <span className="text-warmgrey block mb-1">Booked Suite</span>
                    <span className="font-bold text-sm text-charcoal">{searchResult.booking.roomType?.name}</span>
                    <span className="text-[11px] text-warmgrey block">{searchResult.booking.roomType?.bedType}</span>
                  </div>

                  <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                    <span className="text-warmgrey block mb-1">Stay Schedule</span>
                    <span className="font-bold text-sm text-charcoal">
                      {formatDate(searchResult.booking.checkInDate)} - {formatDate(searchResult.booking.checkOutDate)}
                    </span>
                    <span className="text-[11px] text-warmgrey block">{searchResult.booking.nights} Nights Stay</span>
                  </div>

                  <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                    <span className="text-warmgrey block mb-1">Occupancy</span>
                    <span className="font-bold text-sm text-charcoal">
                      {searchResult.booking.adults} Adults{searchResult.booking.children ? `, ${searchResult.booking.children} Kids` : ''}
                    </span>
                    <span className="text-[11px] text-warmgrey block">Max Cap: {searchResult.booking.roomType?.maxCapacity}</span>
                  </div>

                  <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                    <span className="text-warmgrey block mb-1">Assigned Room Unit</span>
                    <span className="font-bold text-sm text-gold-dark">
                      {searchResult.booking.room?.roomNumber ? `Room #${searchResult.booking.room.roomNumber}` : 'Not Yet Assigned'}
                    </span>
                    <span className="text-[11px] text-warmgrey block">
                      {searchResult.booking.room?.floor ? `Floor ${searchResult.booking.room.floor}` : 'Pending Check-in'}
                    </span>
                  </div>
                </div>

                {/* Physical Room Allocation Action */}
                {searchResult.booking.bookingStatus !== 'CHECKED_OUT' && (
                  <div className="p-4 bg-beige-light/40 rounded-2xl border border-beige-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs">
                      <span className="font-bold text-charcoal block">Reassign or Allocate Physical Room:</span>
                      <span className="text-warmgrey">Select from vacant physical rooms in the {searchResult.booking.roomType?.name} category</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={selectedRoomToAssign}
                        onChange={(e) => setSelectedRoomToAssign(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-beige-border rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-gold"
                      >
                        {(searchResult.availableRoomsForAssignment || []).map((rm) => (
                          <option key={rm._id} value={rm._id}>
                            Room #{rm.roomNumber} (Floor {rm.floor}) - {rm.status}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignRoom(searchResult.booking.bookingId)}
                        disabled={searchLoading}
                        className="px-4 py-1.5 bg-charcoal hover:bg-charcoal-dark text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition shadow-sm"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Receptionist Actions */}
                <div className="pt-4 border-t border-beige-border flex flex-wrap items-center justify-end gap-3">
                  {searchResult.booking.bookingStatus === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCheckIn(searchResult.booking.bookingId, searchResult.booking.room?._id)}
                      disabled={searchLoading}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                    >
                      <LogIn size={16} />
                      <span>Process Guest Check-in</span>
                    </button>
                  )}

                  {searchResult.booking.bookingStatus === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleCheckOut(searchResult.booking.bookingId)}
                      disabled={searchLoading}
                      className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Process Guest Check-out</span>
                    </button>
                  )}

                  {searchResult.booking.bookingStatus === 'CHECKED_OUT' && (
                    <span className="text-xs font-semibold text-warmgrey italic">
                      This reservation has concluded and is checked out.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TODAY'S CHECK-INS */}
        {activeTab === 'TODAY_CHECKINS' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="pb-4 border-b border-beige-border">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                Scheduled Check-ins for Today
              </h3>
              <p className="text-xs text-warmgrey">Guests expected to arrive at front desk.</p>
            </div>

            {overviewData?.todaysCheckIns?.length === 0 ? (
              <p className="text-xs text-warmgrey py-6 text-center">No arrivals scheduled for today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Ref</th>
                      <th className="pb-3 font-semibold">Guest</th>
                      <th className="pb-3 font-semibold">Suite</th>
                      <th className="pb-3 font-semibold">Room Assigned</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-border/50 text-charcoal">
                    {overviewData?.todaysCheckIns?.map((b) => (
                      <tr key={b._id} className="hover:bg-ivory/50 transition">
                        <td className="py-3 font-mono font-bold">{b.bookingId}</td>
                        <td className="py-3 font-semibold">{b.guestName}</td>
                        <td className="py-3">{b.roomType?.name}</td>
                        <td className="py-3 font-semibold text-gold-dark">
                          {b.room?.roomNumber ? `Room #${b.room.roomNumber}` : 'Pending Allocation'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(b.bookingStatus).bg}`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleCheckIn(b.bookingId, b.room?._id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Check-in
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TODAY'S CHECK-OUTS */}
        {activeTab === 'TODAY_CHECKOUTS' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="pb-4 border-b border-beige-border">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                Scheduled Departures for Today
              </h3>
              <p className="text-xs text-warmgrey">In-house guests checking out by 11:00 AM.</p>
            </div>

            {overviewData?.todaysCheckOuts?.length === 0 ? (
              <p className="text-xs text-warmgrey py-6 text-center">No departures scheduled for today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Ref</th>
                      <th className="pb-3 font-semibold">Guest</th>
                      <th className="pb-3 font-semibold">Room</th>
                      <th className="pb-3 font-semibold">Check-out Time</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-border/50 text-charcoal">
                    {overviewData?.todaysCheckOuts?.map((b) => (
                      <tr key={b._id} className="hover:bg-ivory/50 transition">
                        <td className="py-3 font-mono font-bold">{b.bookingId}</td>
                        <td className="py-3 font-semibold">{b.guestName}</td>
                        <td className="py-3 font-bold text-gold-dark">Room #{b.room?.roomNumber}</td>
                        <td className="py-3 text-warmgrey">11:00 AM</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleCheckOut(b.bookingId)}
                            className="px-3 py-1 bg-gold hover:bg-gold-dark text-white rounded-lg text-xs font-semibold"
                          >
                            Check-out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CURRENTLY OCCUPIED ROOMS */}
        {activeTab === 'OCCUPIED' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="pb-4 border-b border-beige-border">
              <h3 className="font-serif text-xl font-bold text-charcoal">
                In-House Guests & Occupied Suites
              </h3>
              <p className="text-xs text-warmgrey">Currently active stays registered at the hotel.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Room #</th>
                    <th className="pb-3 font-semibold">Guest</th>
                    <th className="pb-3 font-semibold">Suite Type</th>
                    <th className="pb-3 font-semibold">Stay Interval</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-border/50 text-charcoal">
                  {(overviewData?.occupiedBookings || []).map((b) => (
                    <tr key={b._id} className="hover:bg-ivory/50 transition">
                      <td className="py-3 font-bold text-sm text-gold-dark">Room #{b.room?.roomNumber}</td>
                      <td className="py-3">
                        <span className="font-semibold block">{b.guestName}</span>
                        <span className="text-[10px] text-warmgrey">{b.guestPhone}</span>
                      </td>
                      <td className="py-3">{b.roomType?.name}</td>
                      <td className="py-3 text-warmgrey">
                        {formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleCheckOut(b.bookingId)}
                          className="px-3 py-1 bg-gold hover:bg-gold-dark text-white rounded-lg text-xs font-semibold"
                        >
                          Check-out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE ROOM STATUS MATRIX */}
        {activeTab === 'ROOM_MATRIX' && (
          <div className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-beige-border">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  Live Hotel Room Matrix
                </h3>
                <p className="text-xs text-warmgrey">Floor-by-floor real-time room occupancy and housekeeping state.</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Maintenance</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(overviewData?.allRooms || []).map((r) => {
                const isOccupied = r.status === 'OCCUPIED';
                const isMaintenance = r.status === 'MAINTENANCE';
                return (
                  <div
                    key={r._id}
                    className={`p-4 rounded-2xl border text-center transition shadow-sm ${
                      isOccupied
                        ? 'bg-amber-50/50 border-amber-200'
                        : isMaintenance
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-emerald-50/40 border-emerald-200'
                    }`}
                  >
                    <span className="text-[10px] text-warmgrey block">Floor {r.floor}</span>
                    <span className="font-serif text-xl font-bold text-charcoal block my-0.5">
                      #{r.roomNumber}
                    </span>
                    <span className="text-[11px] font-medium text-charcoal block truncate">
                      {r.roomType?.name}
                    </span>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isOccupied
                          ? 'bg-amber-200 text-amber-900'
                          : isMaintenance
                          ? 'bg-rose-200 text-rose-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReceptionistDashboardPage;

