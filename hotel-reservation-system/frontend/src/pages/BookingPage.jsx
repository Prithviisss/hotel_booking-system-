import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService, bookingService } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { formatCurrency, formatDate, toInputDateFormat } from '../utils/formatters';
import {
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Lock,
  Loader2,
  Check,
  Clock
} from 'lucide-react';

const BookingPage = () => {
  const { roomTypeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Navigation state passed from card or details page
  const passedState = location.state || {};
  const passedRoomType = passedState.roomType;
  const passedRoomId = passedState.roomId;
  const passedSearch = passedState.searchParams || {};

  const [roomType, setRoomType] = useState(passedRoomType || null);
  const [loadingRoom, setLoadingRoom] = useState(!passedRoomType);

  // Form Fields
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 2);

  const [checkInDate, setCheckInDate] = useState(passedSearch.checkIn || toInputDateFormat(today));
  const [checkOutDate, setCheckOutDate] = useState(passedSearch.checkOut || toInputDateFormat(tomorrow));
  const [adults, setAdults] = useState(passedSearch.adults || '2');
  const [children, setChildren] = useState(passedSearch.children || '0');
  const [specialRequests, setSpecialRequests] = useState('');

  // Guest Contact details
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');

  // Booking & Payment submission states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingBooking, setPendingBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name || '');
      if (!guestEmail) setGuestEmail(user.email || '');
      if (!guestPhone) setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Load room category if not passed via location state
  useEffect(() => {
    if (!roomType && roomTypeId) {
      const fetchType = async () => {
        try {
          setLoadingRoom(true);
          const res = await roomService.getRoomTypes();
          if (res.data?.success) {
            const found = res.data.roomTypes.find((t) => t._id === roomTypeId);
            if (found) setRoomType(found);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingRoom(false);
        }
      };
      fetchType();
    }
  }, [roomTypeId, roomType]);

  // Pricing calculations
  const nights = Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)));
  const basePrice = roomType ? roomType.basePrice : 0;
  const subtotal = basePrice * nights;
  const taxRate = basePrice > 7500 ? 0.18 : 0.12;
  const taxes = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxes;

  // Handle Form Submit: Create pending reservation and launch payment modal
  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg('Please complete all guest details.');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      setErrorMsg('Check-out date must be strictly after check-in date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingService.createBooking({
        roomType: roomType._id,
        roomId: passedRoomId,
        checkInDate,
        checkOutDate,
        adults: Number(adults),
        children: Number(children),
        specialRequests,
        guestName,
        guestEmail,
        guestPhone
      });

      if (res.data?.success) {
        setPendingBooking(res.data.booking);
        setShowPaymentModal(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to place reservation hold. Please try different dates.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (confirmedBooking) => {
    setShowPaymentModal(false);
    navigate(`/confirmation/${confirmedBooking.bookingId}`, {
      state: { booking: confirmedBooking }
    });
  };

  const handlePaymentFailure = (failMsg) => {
    setErrorMsg(`Payment was not processed: ${failMsg || 'Transaction cancelled'}`);
  };

  if (loadingRoom) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-charcoal">Preparing reservation form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-gold-dark font-semibold mb-2">
            Secure Reservation Desk
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Confirm Your Royal Stay
          </h1>
          <p className="text-warmgrey text-xs sm:text-sm mt-2">
            Complete your guest details and review your pricing summary before payment.
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-semibold block">Booking Notification</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          
          {/* Left 2 Cols: Guest Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleInitiateBooking} className="space-y-6">
              
              {/* Card 1: Guest Information */}
              <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-beige-border">
                  <h3 className="font-serif text-xl font-bold text-charcoal">
                    1. Primary Guest Details
                  </h3>
                  {!isAuthenticated && (
                    <span className="text-xs text-gold-dark font-semibold">
                      Account required to finalize booking
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Maharani Gayatri Devi"
                      required
                      className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                      Contact Phone (India / Mobile) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Dates & Guest Count */}
              <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft space-y-6">
                <h3 className="font-serif text-xl font-bold text-charcoal pb-4 border-b border-beige-border">
                  2. Stay Dates & Occupancy
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-gold" />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={toInputDateFormat(new Date())}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-gold" />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                      <Users size={13} className="text-gold" />
                      Adult Guests
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                      <Users size={13} className="text-gold" />
                      Children (Below 12 yrs)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
                    >
                      <option value="0">0 Children</option>
                      <option value="1">1 Child</option>
                      <option value="2">2 Children</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                      Special Requests & Preferences (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Airport pickup timing, non-smoking floor, anniversary decor..."
                      className="w-full px-4 py-2 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-gold hover:bg-gold-dark text-white font-semibold rounded-2xl text-sm uppercase tracking-widest transition shadow-md hover:shadow-luxury flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Locking Room Availability...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>Proceed to Payment ({formatCurrency(totalAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Suite & Pricing Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-beige-border p-6 shadow-luxury sticky top-24 space-y-6">
              
              <h3 className="font-serif text-lg font-bold text-charcoal pb-4 border-b border-beige-border">
                Reservation Summary
              </h3>

              {/* Room Card Thumbnail */}
              {roomType && (
                <div className="space-y-3 pb-4 border-b border-beige-border">
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-ivory">
                    <img
                      src={roomType.images?.[0]}
                      alt={roomType.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gold-dark font-semibold">
                      Selected Category
                    </span>
                    <h4 className="font-serif text-lg font-bold text-charcoal">
                      {roomType.name}
                    </h4>
                    <p className="text-xs text-warmgrey">
                      {roomType.bedType} • Up to {roomType.maxCapacity} Guests
                    </p>
                  </div>
                </div>
              )}

              {/* Schedule Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-warmgrey">Check-in:</span>
                  <span className="font-medium text-charcoal">{formatDate(checkInDate)} (2:00 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgrey">Check-out:</span>
                  <span className="font-medium text-charcoal">{formatDate(checkOutDate)} (11:00 AM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgrey">Total Duration:</span>
                  <span className="font-medium text-charcoal">{nights} Night{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgrey">Guests:</span>
                  <span className="font-medium text-charcoal">{adults} Adults{Number(children) > 0 ? `, ${children} Children` : ''}</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-4 bg-ivory rounded-2xl border border-beige-border space-y-2.5 text-xs">
                <div className="flex justify-between text-warmgrey">
                  <span>Room Rate ({formatCurrency(basePrice)} × {nights}n)</span>
                  <span className="font-semibold text-charcoal">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-warmgrey">
                  <span>Goods & Services Tax (GST {taxRate * 100}%)</span>
                  <span className="font-semibold text-charcoal">{formatCurrency(taxes)}</span>
                </div>
                <div className="pt-2 border-t border-beige-border flex justify-between items-baseline font-serif text-base font-bold text-charcoal">
                  <span>Total Payable</span>
                  <span className="text-xl text-gold-dark">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-2 text-[11px] text-warmgrey">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Free cancellation up to 48 hours prior to check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gold shrink-0" />
                  <span>15-Minute temporary reservation lock guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-gold shrink-0" />
                  <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && pendingBooking && (
        <PaymentModal
          booking={pendingBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default BookingPage;

