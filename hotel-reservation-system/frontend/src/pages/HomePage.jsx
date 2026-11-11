import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';
import RoomCard from '../components/RoomCard';
import { toInputDateFormat } from '../utils/formatters';
import {
  Calendar,
  Users,
  Search,
  Sparkles,
  Award,
  ShieldCheck,
  UtensilsCrossed,
  Waves,
  HeartHandshake,
  Car,
  Wifi,
  Clock,
  Star,
  Quote,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  // Search form state
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 2);

  const [checkInDate, setCheckInDate] = useState(toInputDateFormat(today));
  const [checkOutDate, setCheckOutDate] = useState(toInputDateFormat(tomorrow));
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [preferredType, setPreferredType] = useState('');

  // Data state
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [typesRes, roomsRes] = await Promise.all([
          roomService.getRoomTypes(),
          roomService.getRooms()
        ]);

        if (typesRes.data?.success) {
          setRoomTypes(typesRes.data.roomTypes);
        }

        if (roomsRes.data?.success) {
          // Take first 3 rooms as featured
          setFeaturedRooms(roomsRes.data.rooms.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load home page data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults,
      children,
      roomType: preferredType
    }).toString();

    navigate(`/rooms?${query}`);
  };

  const facilities = [
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-gold" />,
      title: 'Fine Heritage Dining',
      desc: 'Authentic royal cuisines prepared by master chefs in an exquisite palatial courtyard ambience.'
    },
    {
      icon: <Waves className="w-6 h-6 text-gold" />,
      title: 'Heated Infinity Pool',
      desc: 'Temperature-controlled rooftop pool overlooking panoramic garden city vistas.'
    },
    {
      icon: <Award className="w-6 h-6 text-gold" />,
      title: 'Royal Ayurvedic Spa',
      desc: 'Rejuvenate your senses with time-honored herbal therapies and customized wellness rituals.'
    },
    {
      icon: <Car className="w-6 h-6 text-gold" />,
      title: 'Chauffeur Airport Transfer',
      desc: 'Luxury fleet pickup and drop service ensuring seamless travel convenience.'
    },
    {
      icon: <Wifi className="w-6 h-6 text-gold" />,
      title: 'High-Speed Wi-Fi',
      desc: 'Seamless ultra-fast connectivity across all suites, banquet gardens, and lounges.'
    },
    {
      icon: <Clock className="w-6 h-6 text-gold" />,
      title: '24/7 Butler Service',
      desc: 'Attentive, discreet, and personalized butler care dedicated to fulfilling every wish.'
    }
  ];

  const testimonials = [
    {
      name: 'Aditya Birla Group Executive',
      comment: 'An unparalleled luxury experience. The Deluxe Room had breathtaking views, and the staff treated us with royal warmth.',
      rating: 5,
      date: 'Stayed October 2026'
    },
    {
      name: 'Dr. Meenakshi Sundaram',
      comment: 'The booking process was seamless, and the physical room allocation during check-in was prompt. The culinary spread was simply divine.',
      rating: 5,
      date: 'Stayed September 2026'
    },
    {
      name: 'Capt. Rajesh & Sunita Oberoi',
      comment: 'We spent our anniversary in the Executive Suite. The private jacuzzi, complimentary champagne, and butler service made it unforgettable.',
      rating: 5,
      date: 'Stayed August 2026'
    }
  ];

  return (
    <div className="bg-ivory text-charcoal">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Luxury Background Image with soft warm overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`
          }}
        >
          {/* Subtle light/warm gradient overlay to keep LIGHT THEME ONLY */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-ivory" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-beige-border text-gold-dark text-xs font-semibold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles size={14} className="text-gold" />
            <span>Welcome to The Grand Heritage</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal max-w-4xl mx-auto leading-tight sm:leading-tight mb-4">
            Discover Comfort. <br className="hidden sm:inline" />
            <span className="text-gold-dark">Experience Luxury.</span>
          </h1>

          <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Find the perfect room for your next unforgettable stay. Impeccable royal hospitality, lavish suites, and timeless elegance await you.
          </p>

          {/* BOOKING SEARCH FORM (Floating White Card) */}
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-beige-border p-6 sm:p-8 shadow-luxury text-left">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Check-in */}
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-gold" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  min={toInputDateFormat(new Date())}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-gold" />
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users size={14} className="text-gold" />
                  Guests
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                  >
                    <option value="1">1 Adult</option>
                    <option value="2">2 Adults</option>
                    <option value="3">3 Adults</option>
                    <option value="4">4 Adults</option>
                  </select>
                  <select
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                  >
                    <option value="0">0 Kids</option>
                    <option value="1">1 Kid</option>
                    <option value="2">2 Kids</option>
                  </select>
                </div>
              </div>

              {/* Room Category */}
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                  Room Category
                </label>
                <select
                  value={preferredType}
                  onChange={(e) => setPreferredType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
                >
                  <option value="">All Categories</option>
                  {roomTypes.map((rt) => (
                    <option key={rt._id} value={rt._id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full h-[45px] bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl transition shadow-md hover:shadow-luxury flex items-center justify-center gap-2 text-sm"
                >
                  <Search size={16} />
                  <span>Search Rooms</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. POPULAR ROOM CATEGORIES SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-dark font-semibold mb-2">
            Curated Living Spaces
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-4">
            Palatial Categories & Suites
          </h2>
          <p className="text-warmgrey text-sm sm:text-base leading-relaxed">
            Each suite has been individually crafted with opulent decor, contemporary comforts, and majestic heritage architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomTypes.map((type) => (
            <div
              key={type._id}
              className="bg-white rounded-2xl border border-beige-border overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col group cursor-pointer"
              onClick={() => navigate(`/rooms?category=${encodeURIComponent(type.name)}`)}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={type.images[0]}
                  alt={type.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-gold-dark border border-beige-border shadow-sm">
                  From ₹{type.basePrice.toLocaleString('en-IN')} / night
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-2 group-hover:text-gold-dark transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-sm text-warmgrey line-clamp-2 mb-4 leading-relaxed">
                    {type.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-beige-border flex items-center justify-between text-xs font-semibold text-gold-dark">
                  <span>Capacity: Up to {type.maxCapacity} Guests</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Suites <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED ROOMS SECTION */}
      {featuredRooms.length > 0 && (
        <section className="py-20 bg-white border-y border-beige-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold-dark font-semibold mb-2">
                  Handpicked Stays
                </p>
                <h2 className="font-serif text-3xl font-bold text-charcoal">
                  Featured Accommodations
                </h2>
              </div>
              <button
                onClick={() => navigate('/rooms')}
                className="mt-4 sm:mt-0 text-sm font-semibold text-gold-dark hover:text-charcoal flex items-center gap-1.5 transition"
              >
                View All Rooms & Suites <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  searchParams={{ checkIn: checkInDate, checkOut: checkOutDate, adults, children }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HOTEL FACILITIES & AMENITIES */}
      <section id="facilities" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-dark font-semibold mb-2">
            The Heritage Experience
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-4">
            World-Class Amenities & Privileges
          </h2>
          <p className="text-warmgrey text-sm sm:text-base leading-relaxed">
            From regal banquets to holistic rejuvenation, immerse yourself in our signature bespoke offerings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-beige-border shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-ivory border border-beige-border flex items-center justify-center mb-5">
                {fac.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal mb-2">
                {fac.title}
              </h3>
              <p className="text-sm text-warmgrey leading-relaxed">
                {fac.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-20 bg-beige-light/40 border-y border-beige-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-gold-dark font-semibold">
                Why Discerning Guests Choose Us
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
                A Legacy of Royal Indian Hospitality Since 1924
              </h2>
              <p className="text-warmgrey text-sm leading-relaxed">
                Step into a world where time stands still. The Grand Heritage combines century-old Indo-Saracenic grandeur with ultra-modern smart conveniences and personalized concierge attention.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-charcoal">Guaranteed Best Rate & Zero Booking Fees</h4>
                    <p className="text-xs text-warmgrey">Direct reservation benefits include complimentary high-tea and early check-in subject to availability.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <HeartHandshake size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-charcoal">Flexible Cancellation Guarantee</h4>
                    <p className="text-xs text-warmgrey">Transparent cancellation policy with 100% refund up to 48 hours before check-in date.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-charcoal">Award-Winning Heritage Architecture</h4>
                    <p className="text-xs text-warmgrey">Recognized as India's leading luxury heritage stay by National Hospitality Guild.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Collage */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
                alt="Hotel Architecture"
                className="rounded-3xl shadow-luxury border-4 border-white object-cover aspect-[4/3] w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl border border-beige-border shadow-elevated max-w-xs hidden sm:block">
                <p className="font-serif text-2xl font-bold text-gold-dark">99.4%</p>
                <p className="text-xs text-warmgrey font-medium mt-1">
                  Guest Satisfaction Rate based on over 12,000 verified reservations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GUEST TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-dark font-semibold mb-2">
            Guest Testimonials
          </p>
          <h2 className="font-serif text-3xl font-bold text-charcoal">
            Words From Our Honored Guests
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-beige-border shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <Quote size={28} className="text-beige mb-3" />
                <p className="text-sm text-charcoal/90 italic leading-relaxed mb-6">
                  "{t.comment}"
                </p>
              </div>
              <div className="pt-4 border-t border-beige-border flex justify-between items-center text-xs">
                <span className="font-semibold text-charcoal">{t.name}</span>
                <span className="text-warmgrey">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="py-20 bg-ivory border-t border-beige-border text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-4">
            Ready For An Unforgettable Stay?
          </h2>
          <p className="text-warmgrey text-sm sm:text-base max-w-xl mx-auto mb-8">
            Reserve your suite directly with The Grand Heritage for complimentary privileges and seamless check-in.
          </p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-8 py-3.5 bg-gold hover:bg-gold-dark text-white font-semibold rounded-full shadow-md hover:shadow-luxury transition tracking-wide text-sm"
          >
            Explore Available Rooms & Suites
          </button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

