import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { roomService } from '../services/api';
import RoomCard from '../components/RoomCard';
import { formatCurrency, toInputDateFormat } from '../utils/formatters';
import {
  Filter,
  SlidersHorizontal,
  Calendar,
  Users,
  Search,
  RotateCcw,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';

const RoomsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Search parameters from URL if any
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';
  const initialCheckIn = queryParams.get('checkIn') || toInputDateFormat(new Date());
  const initialCheckOut = queryParams.get('checkOut') || toInputDateFormat(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  const initialAdults = queryParams.get('adults') || '2';
  const initialChildren = queryParams.get('children') || '0';

  // State
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailabilitySearch, setIsAvailabilitySearch] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(16000);
  const [guestCapacity, setGuestCapacity] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('POPULAR'); // 'POPULAR', 'PRICE_LOW_HIGH', 'PRICE_HIGH_LOW'

  // Availability Date criteria
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const allAmenitiesList = [
    'High-speed Wi-Fi',
    'Air Conditioning',
    'Complimentary Breakfast',
    'Private Balcony',
    'Deep Soaking Bathtub',
    'Private Jacuzzi',
    'Club Lounge Access',
    'Stocked Mini-Bar',
    '24/7 Room Service',
    'Children Play Amenities'
  ];

  // Fetch rooms and room types
  const fetchAllRooms = async () => {
    try {
      setLoading(true);
      setIsAvailabilitySearch(false);
      const [roomsRes, typesRes] = await Promise.all([
        roomService.getRooms(),
        roomService.getRoomTypes()
      ]);

      if (roomsRes.data?.success) setRooms(roomsRes.data.rooms);
      if (typesRes.data?.success) setRoomTypes(typesRes.data.roomTypes);
    } catch (err) {
      console.error('Error loading rooms:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run backend availability check
  const handleAvailabilityCheck = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setIsAvailabilitySearch(true);

      const res = await roomService.checkAvailability({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: Number(adults),
        children: Number(children)
      });

      if (res.data?.success) {
        setRooms(res.data.availableRooms);
      }
    } catch (err) {
      console.error('Availability check failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If URL had search dates, check availability directly
    if (queryParams.get('checkIn') && queryParams.get('checkOut')) {
      handleAvailabilityCheck();
    } else {
      fetchAllRooms();
    }
  }, [location.search]);

  // Toggle amenity
  const handleToggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setMaxPrice(16000);
    setGuestCapacity('ALL');
    setSelectedAmenities([]);
    setSortBy('POPULAR');
    fetchAllRooms();
  };

  // Filter and sort rooms in memory
  const filteredRooms = rooms
    .filter((room) => {
      const type = room.roomType || room;

      // Category filter
      if (selectedCategory && type.name !== selectedCategory) {
        return false;
      }

      // Price filter
      const price = room.pricing ? room.pricing.pricePerNight : type.basePrice;
      if (price > maxPrice) {
        return false;
      }

      // Guest capacity
      if (guestCapacity !== 'ALL' && type.maxCapacity < Number(guestCapacity)) {
        return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const roomAmenities = type.amenities || [];
        const hasAllSelected = selectedAmenities.every((a) => roomAmenities.includes(a));
        if (!hasAllSelected) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const priceA = a.pricing ? a.pricing.pricePerNight : a.roomType?.basePrice || 0;
      const priceB = b.pricing ? b.pricing.pricePerNight : b.roomType?.basePrice || 0;

      if (sortBy === 'PRICE_LOW_HIGH') return priceA - priceB;
      if (sortBy === 'PRICE_HIGH_LOW') return priceB - priceA;
      // Popular (default)
      return (b.roomType?.maxCapacity || 0) - (a.roomType?.maxCapacity || 0);
    });

  return (
    <div className="bg-ivory min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-widest text-gold-dark font-semibold mb-2">
            The Grand Heritage Stays
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-3">
            Rooms & Palatial Suites
          </h1>
          <p className="text-warmgrey text-sm sm:text-base leading-relaxed">
            Choose from five bespoke room categories, each designed with bespoke marble craftsmanship, royal bedding, and modern luxury amenities.
          </p>
        </div>

        {/* Date Availability Search Strip */}
        <div className="bg-white rounded-2xl border border-beige-border p-5 shadow-soft mb-10">
          <form onSubmit={handleAvailabilityCheck} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-gold" />
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                min={toInputDateFormat(new Date())}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-gold" />
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                <Users size={14} className="text-gold" />
                Adults
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
              >
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4 Adults</option>
                <option value="5">5 Adults</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
                <Users size={14} className="text-gold" />
                Children
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="w-full px-3 py-2 bg-ivory border border-beige-border rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-gold"
              >
                <option value="0">0 Children</option>
                <option value="1">1 Child</option>
                <option value="2">2 Children</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full h-[38px] bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Search size={14} />
                <span>Check Availability</span>
              </button>
            </div>
          </form>

          {isAvailabilitySearch && (
            <div className="mt-4 pt-3 border-t border-beige-border flex items-center justify-between text-xs text-warmgrey">
              <span>
                Showing available rooms for stay: <strong className="text-charcoal">{checkIn}</strong> to <strong className="text-charcoal">{checkOut}</strong> ({adults} Adults, {children} Children)
              </span>
              <button
                onClick={fetchAllRooms}
                className="text-gold-dark font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Show All Rooms
              </button>
            </div>
          )}
        </div>

        {/* Content Layout: Sidebar Filters + Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR FILTERS (Clean white card) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-beige-border p-6 shadow-soft space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-beige-border">
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-gold" />
                  Filter Rooms
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-warmgrey hover:text-rose-600 transition"
                  title="Reset filters"
                >
                  Reset
                </button>
              </div>

              {/* Room Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
                  Category
                </label>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === ''
                        ? 'bg-beige-light font-bold text-charcoal'
                        : 'text-warmgrey hover:bg-ivory'
                    }`}
                  >
                    All Categories
                  </button>
                  {roomTypes.map((rt) => (
                    <button
                      key={rt._id}
                      onClick={() => setSelectedCategory(rt.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition flex justify-between items-center ${
                        selectedCategory === rt.name
                          ? 'bg-beige-light font-bold text-charcoal'
                          : 'text-warmgrey hover:bg-ivory'
                      }`}
                    >
                      <span>{rt.name}</span>
                      <span className="text-[10px] text-warmgrey">{formatCurrency(rt.basePrice)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Max Price / Night
                  </label>
                  <span className="text-xs font-semibold text-gold-dark">
                    {formatCurrency(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="16000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-warmgrey mt-1">
                  <span>₹2,000</span>
                  <span>₹16,000</span>
                </div>
              </div>

              {/* Guest Capacity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2.5">
                  Guest Capacity
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['ALL', '2', '3', '4'].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setGuestCapacity(cap)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                        guestCapacity === cap
                          ? 'bg-gold text-white border-gold shadow-sm'
                          : 'bg-ivory text-charcoal border-beige-border hover:bg-beige-light'
                      }`}
                    >
                      {cap === 'ALL' ? 'Any' : `${cap}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2.5">
                  Amenities
                </label>
                <div className="space-y-2 text-xs">
                  {allAmenitiesList.slice(0, 6).map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer text-charcoal hover:text-gold-dark transition"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="rounded border-beige-border text-gold focus:ring-gold accent-gold w-3.5 h-3.5"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* MAIN ROOMS GRID */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting & Result Count Bar */}
            <div className="bg-white rounded-2xl border border-beige-border px-6 py-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-warmgrey">
                Showing <strong className="text-charcoal font-semibold">{filteredRooms.length}</strong> luxurious accommodations
              </p>

              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-warmgrey font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-ivory border border-beige-border rounded-lg text-charcoal font-medium focus:outline-none focus:border-gold"
                >
                  <option value="POPULAR">Most Popular</option>
                  <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                  <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-beige-border">
                <Loader2 size={36} className="animate-spin text-gold mx-auto mb-3" />
                <p className="font-serif text-lg text-charcoal">Checking Room Availability...</p>
                <p className="text-xs text-warmgrey mt-1">Applying date overlap algorithms to ensure zero double-booking.</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-beige-border p-8">
                <div className="w-14 h-14 bg-ivory rounded-full flex items-center justify-center mx-auto mb-4 border border-beige-border text-gold">
                  <Filter size={24} />
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
                  No Rooms Matched Your Criteria
                </h3>
                <p className="text-warmgrey text-xs sm:text-sm max-w-md mx-auto mb-6">
                  Try adjusting your price range, guest count, or selecting different check-in and check-out dates.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold tracking-wider transition shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    searchParams={{ checkIn, checkOut, adults, children }}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default RoomsPage;

