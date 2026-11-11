import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { bookingService } from '../services/api';
import ReceiptView from '../components/ReceiptView';
import { CheckCircle2, CalendarCheck, Home, Loader2, ArrowRight } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [payment, setPayment] = useState(location.state?.payment || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Trigger celebratory luxury confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A46D', '#EDE5D8', '#4CAF50']
      });
    } catch (e) {
      // Ignore if canvas-confetti is not loaded
    }

    if (!booking && bookingId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const res = await bookingService.getBookingById(bookingId);
          if (res.data?.success) {
            setBooking(res.data.booking);
            setPayment(res.data.payment);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [bookingId, booking]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-charcoal">Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-beige-border rounded-2xl text-center">
        <h2 className="font-serif text-xl font-bold text-charcoal mb-2">Booking Not Found</h2>
        <p className="text-warmgrey text-xs mb-6">Unable to retrieve reservation details for {bookingId}.</p>
        <Link to="/" className="px-5 py-2.5 bg-gold text-white rounded-xl text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Banner */}
        <div className="no-print bg-white rounded-3xl border border-beige-border p-8 shadow-soft text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Payment Verified & Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1 mb-2">
            Your Royal Stay is Reserved!
          </h1>
          <p className="text-warmgrey text-sm max-w-xl mx-auto leading-relaxed">
            Thank you, <strong className="text-charcoal font-semibold">{booking.guestName}</strong>. A confirmation voucher has been recorded in your account. Your reservation reference is:
          </p>

          <div className="inline-block mt-4 px-6 py-2.5 bg-ivory rounded-2xl border border-beige-border font-serif text-2xl font-bold text-gold-dark tracking-wide shadow-sm">
            {booking.bookingId}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              to="/my-bookings"
              className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
            >
              <CalendarCheck size={15} />
              <span>View in My Bookings</span>
            </Link>

            <Link
              to="/"
              className="px-6 py-2.5 bg-beige-light hover:bg-beige text-charcoal rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2"
            >
              <Home size={15} />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>

        {/* Embedded Official Printable Receipt View */}
        <ReceiptView booking={booking} payment={payment} />

      </div>
    </div>
  );
};

export default BookingConfirmationPage;

