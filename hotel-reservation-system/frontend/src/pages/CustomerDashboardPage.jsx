import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import CancellationModal from '../components/CancellationModal';
import ReceiptView from '../components/ReceiptView';
import {
  formatCurrency,
  formatDate,
  getStatusBadge
} from '../utils/formatters';
import {
  User,
  Calendar,
  CreditCard,
  Printer,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Bed,
  CheckCircle2,
  Loader2,
  CalendarCheck
} from 'lucide-react';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'UPCOMING', 'PAST', 'CANCELLED'

  // Modal states
  const [selectedForCancel, setSelectedForCancel] = useState(null);
  const [selectedForReceipt, setSelectedForReceipt] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      if (res.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter bookings by tab
  const filteredBookings = bookings.filter((b) => {
    const checkIn = new Date(b.checkInDate);
    if (activeTab === 'UPCOMING') {
      return (
        (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN' || b.bookingStatus === 'PENDING_PAYMENT') &&
        checkIn >= today
      );
    }
    if (activeTab === 'PAST') {
      return b.bookingStatus === 'CHECKED_OUT' || (checkIn < today && b.bookingStatus !== 'CANCELLED');
    }
    if (activeTab === 'CANCELLED') {
      return b.bookingStatus === 'CANCELLED';
    }
    return true; // ALL
  });

  const handleCancelledSuccess = (updatedBooking, refundDetails) => {
    setSelectedForCancel(null);
    setAlertMsg(`Booking ${updatedBooking.bookingId} was successfully cancelled. Refund of ${formatCurrency(refundDetails.refundAmount)} processed.`);
    fetchBookings();
  };

  // If receipt modal is active, display the ReceiptView
  if (selectedForReceipt) {
    return (
      <div className="bg-ivory min-h-screen py-10 px-4">
        <ReceiptView
          booking={selectedForReceipt}
          onBack={() => setSelectedForReceipt(null)}
        />
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Summary Card */}
        <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/15 text-gold flex items-center justify-center border border-gold/30 font-serif text-2xl font-bold">
              {user?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
                Heritage Member Profile
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                {user?.name}
              </h1>
              <p className="text-xs text-warmgrey mt-0.5">
                {user?.email} • {user?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-ivory px-4 py-2.5 rounded-2xl border border-beige-border text-center flex-1 sm:flex-initial">
              <span className="text-[10px] uppercase tracking-wider text-warmgrey block">Total Stays</span>
              <span className="font-serif text-xl font-bold text-charcoal">{bookings.length}</span>
            </div>
            <Link
              to="/rooms"
              className="px-5 py-3 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              Book New Stay
            </Link>
          </div>
        </div>

        {alertMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{alertMsg}</span>
            </div>
            <button onClick={() => setAlertMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Tabs & Navigation */}
        <div className="flex items-center gap-2 mb-8 border-b border-beige-border pb-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Bookings', count: bookings.length },
            {
              id: 'UPCOMING',
              label: 'Upcoming Stays',
              count: bookings.filter((b) => (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING_PAYMENT') && new Date(b.checkInDate) >= today).length
            },
            {
              id: 'PAST',
              label: 'Previous Stays',
              count: bookings.filter((b) => b.bookingStatus === 'CHECKED_OUT' || (new Date(b.checkInDate) < today && b.bookingStatus !== 'CANCELLED')).length
            },
            {
              id: 'CANCELLED',
              label: 'Cancelled',
              count: bookings.filter((b) => b.bookingStatus === 'CANCELLED').length
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gold text-white shadow-sm'
                  : 'bg-white text-charcoal border border-beige-border hover:bg-beige-light'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-ivory'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-beige-border">
            <Loader2 size={36} className="animate-spin text-gold mx-auto mb-3" />
            <p className="font-serif text-lg text-charcoal">Loading your reservations...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-beige-border p-8">
            <div className="w-14 h-14 bg-ivory rounded-full flex items-center justify-center mx-auto mb-4 border border-beige-border text-gold">
              <CalendarCheck size={26} />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
              No Reservations Found in this Category
            </h3>
            <p className="text-warmgrey text-xs sm:text-sm max-w-sm mx-auto mb-6">
              You currently do not have any {activeTab.toLowerCase()} bookings recorded.
            </p>
            <Link
              to="/rooms"
              className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition"
            >
              Explore Luxury Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((b) => {
              const statusBadge = getStatusBadge(b.bookingStatus);
              const isEligibleForCancel = (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING_PAYMENT') && new Date(b.checkInDate) >= today;

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-3xl border border-beige-border p-6 sm:p-8 shadow-soft hover:shadow-luxury transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-beige-border gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-ivory border border-beige-border flex items-center justify-center text-gold shrink-0">
                        <Bed size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-charcoal">
                            {b.bookingId}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <p className="text-xs text-warmgrey">
                          Booked on {formatDate(b.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 text-right">
                      <span className="text-xs text-warmgrey">Total Amount:</span>
                      <span className="font-serif text-2xl font-bold text-gold-dark">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-beige-border text-xs">
                    <div>
                      <span className="text-warmgrey uppercase tracking-wider block font-semibold mb-1">Accommodation</span>
                      <p className="font-bold text-sm text-charcoal">{b.roomType?.name || 'Luxury Suite'}</p>
                      {b.room?.roomNumber && (
                        <p className="text-gold-dark font-medium mt-0.5">Assigned Room #{b.room.roomNumber}</p>
                      )}
                    </div>

                    <div>
                      <span className="text-warmgrey uppercase tracking-wider block font-semibold mb-1">Check-in</span>
                      <p className="font-bold text-sm text-charcoal">{formatDate(b.checkInDate)}</p>
                      <p className="text-warmgrey mt-0.5">2:00 PM Onwards</p>
                    </div>

                    <div>
                      <span className="text-warmgrey uppercase tracking-wider block font-semibold mb-1">Check-out</span>
                      <p className="font-bold text-sm text-charcoal">{formatDate(b.checkOutDate)}</p>
                      <p className="text-warmgrey mt-0.5">By 11:00 AM</p>
                    </div>

                    <div>
                      <span className="text-warmgrey uppercase tracking-wider block font-semibold mb-1">Occupancy & Duration</span>
                      <p className="font-bold text-sm text-charcoal">{b.nights} Night{b.nights > 1 ? 's' : ''}</p>
                      <p className="text-warmgrey mt-0.5">{b.adults} Adults{b.children ? `, ${b.children} Kids` : ''}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-warmgrey flex items-center gap-2">
                      <CreditCard size={14} className="text-gold" />
                      <span>Payment Status: <strong className="text-charcoal uppercase">{b.paymentStatus}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedForReceipt(b)}
                        className="px-4 py-2 bg-ivory hover:bg-beige-light border border-beige-border text-charcoal rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
                      >
                        <Printer size={14} className="text-gold" />
                        <span>View / Print Receipt</span>
                      </button>

                      {isEligibleForCancel && (
                        <button
                          onClick={() => setSelectedForCancel(b)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
                        >
                          <XCircle size={14} />
                          <span>Cancel Stay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Cancellation Modal */}
      {selectedForCancel && (
        <CancellationModal
          booking={selectedForCancel}
          onCancelled={handleCancelledSuccess}
          onClose={() => setSelectedForCancel(null)}
        />
      )}
    </div>
  );
};

export default CustomerDashboardPage;

