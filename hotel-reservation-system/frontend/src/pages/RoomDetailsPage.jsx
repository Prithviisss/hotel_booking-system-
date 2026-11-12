import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';
import { formatCurrency, toInputDateFormat } from '../utils/formatters';
import {
  Users,
  Bed,
  Maximize2,
  Check,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronRight
} from 'lucide-react';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking widget dates
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 2);

  const [checkIn, setCheckIn] = useState(toInputDateFormat(today));
  const [checkOut, setCheckOut] = useState(toInputDateFormat(tomorrow));
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        // Try fetching as room first, if not found or if id corresponds to roomType, fetch types
        let res;
        try {
          res = await roomService.getRoomById(id);
          if (res.data?.success && res.data?.room) {
            setRoomData(res.data.room);
            setActiveImage(res.data.room.images[0] || res.data.room.roomType?.images[0]);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Fallback to room types
        }

        // Fetch room types list and match
        const typesRes = await roomService.getRoomTypes();
        if (typesRes.data?.success) {
          const matched = typesRes.data.roomTypes.find((t) => t._id === id);
          if (matched) {
            setRoomData({
              roomType: matched,
              images: matched.images,
              description: matched.description
            });
            setActiveImage(matched.images[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load room details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-gold mx-auto mb-3" />
          <p className="font-serif text-lg text-charcoal">Loading suite details...</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-beige-border rounded-2xl text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Room Not Found</h2>
        <p className="text-warmgrey text-sm mb-6">The suite you are looking for is either unavailable or has been archived.</p>
        <button
          onClick={() => navigate('/rooms')}
          className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
        >
          View All Rooms
        </button>
      </div>
    );
  }

  const roomType = roomData.roomType || roomData;
  const images = (roomData.images && roomData.images.length ? roomData.images : roomType.images) || [];
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
  const subtotal = roomType.basePrice * nights;
  const taxRate = roomType.basePrice > 7500 ? 0.18 : 0.12;
  const taxes = Math.round(subtotal * taxRate);
  const total = subtotal + taxes;

  const handleProceedBooking = () => {
    navigate(`/book/${roomType._id}`, {
      state: {
        roomId: roomData.roomNumber ? roomData._id : undefined,
        roomType,
        searchParams: { checkIn, checkOut, adults, children }
      }
    });
  };

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-warmgrey mb-6">
          <span className="hover:text-charcoal cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={12} />
          <span className="hover:text-charcoal cursor-pointer" onClick={() => navigate('/rooms')}>Rooms & Suites</span>
          <ChevronRight size={12} />
          <span className="text-charcoal font-semibold">{roomType.name}</span>
        </nav>

        {/* Gallery Section */}
        <div className="space-y-4 mb-10">
          <div className="aspect-[16/9] lg:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-luxury border border-beige-border bg-white">
            <img
              src={activeImage || images[0]}
              alt={roomType.name}
              className="w-full h-full object-cover transition-all duration-500"
              referrerPolicy="no-referrer-when-downgrade"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${roomType.name}/1200/600`; }}
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    activeImage === img ? 'border-gold scale-95 shadow-md' : 'border-beige-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`view-${idx}`} className="w-full h-full object-cover"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${idx}/300/200`; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content & Booking Sticky Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left 2 Cols: Suite Specs & Amenities */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-beige-border">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
                    Heritage Luxury Collection
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">
                    {roomType.name}
                  </h1>
                </div>

                <div className="text-right">
                  <span className="text-xs text-warmgrey block">Starting Rate</span>
                  <span className="font-serif text-3xl font-bold text-gold-dark">
                    {formatCurrency(roomType.basePrice)}
                  </span>
                  <span className="text-xs text-warmgrey"> / night</span>
                </div>
              </div>

              {/* Highlights pills */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-6 border-b border-beige-border text-center">
                <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                  <Users size={20} className="text-gold mx-auto mb-1" />
                  <span className="text-xs font-semibold text-charcoal block">Up to {roomType.maxCapacity}</span>
                  <span className="text-[10px] text-warmgrey">Guests</span>
                </div>

                <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                  <Bed size={20} className="text-gold mx-auto mb-1" />
                  <span className="text-xs font-semibold text-charcoal block">{roomType.bedType || 'King Bed'}</span>
                  <span className="text-[10px] text-warmgrey">Bedding</span>
                </div>

                <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                  <Maximize2 size={20} className="text-gold mx-auto mb-1" />
                  <span className="text-xs font-semibold text-charcoal block">{roomType.size || '420 sq.ft'}</span>
                  <span className="text-[10px] text-warmgrey">Floor Space</span>
                </div>

                <div className="p-3 bg-ivory rounded-xl border border-beige-border">
                  <Clock size={20} className="text-gold mx-auto mb-1" />
                  <span className="text-xs font-semibold text-charcoal block">2:00 PM</span>
                  <span className="text-[10px] text-warmgrey">Check-in</span>
                </div>
              </div>

              {/* Description */}
              <div className="py-6 border-b border-beige-border">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-3">
                  About This Accommodation
                </h3>
                <p className="text-warmgrey text-sm sm:text-base leading-relaxed">
                  {roomData.description || roomType.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="pt-6">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-4">
                  Complimentary Amenities & Privileges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {(roomType.amenities || []).map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-charcoal">
                      <div className="w-5 h-5 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                        <Check size={13} />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Check-in Policies Card */}
            <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft space-y-4">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
                Hospitality Policies & Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-warmgrey leading-relaxed">
                <div>
                  <span className="font-semibold text-charcoal block mb-1">Standard Timings</span>
                  • Check-in: 2:00 PM onwards<br />
                  • Check-out: 11:00 AM<br />
                  • Express early check-in subject to room vacancy.
                </div>
                <div>
                  <span className="font-semibold text-charcoal block mb-1">Cancellation Terms</span>
                  • Full refund if cancelled 48+ hours prior.<br />
                  • 30% retention fee applied between 24-48 hours.<br />
                  • Non-refundable within 24 hours of arrival.
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Instant Booking Form Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-beige-border p-6 shadow-luxury sticky top-24 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold-dark font-semibold">
                  Reserve This Suite
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-2xl font-bold text-charcoal">
                    {formatCurrency(roomType.basePrice)}
                  </span>
                  <span className="text-xs text-warmgrey">per night + taxes</span>
                </div>
              </div>

              {/* Date pickers */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gold" />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={toInputDateFormat(new Date())}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gold" />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                      Adults
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="w-full px-2.5 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                      Children
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="w-full px-2.5 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
                    >
                      <option value="0">0 Kids</option>
                      <option value="1">1 Kid</option>
                      <option value="2">2 Kids</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="p-4 bg-ivory rounded-2xl border border-beige-border space-y-2 text-xs">
                <div className="flex justify-between text-warmgrey">
                  <span>{formatCurrency(roomType.basePrice)} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-medium text-charcoal">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-warmgrey">
                  <span>Estimated Taxes (GST {taxRate * 100}%)</span>
                  <span className="font-medium text-charcoal">{formatCurrency(taxes)}</span>
                </div>
                <div className="pt-2 border-t border-beige-border flex justify-between items-baseline font-serif text-sm font-bold text-charcoal">
                  <span>Estimated Total</span>
                  <span className="text-base text-gold-dark">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedBooking}
                className="w-full py-3.5 px-4 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition shadow-md hover:shadow-luxury flex items-center justify-center gap-2"
              >
                <span>Book This Suite Now</span>
                <ArrowRight size={15} />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-warmgrey">
                <ShieldCheck size={14} className="text-gold" />
                <span>Instant Confirmation • Best Rate Guaranteed</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RoomDetailsPage;

