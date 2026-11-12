import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Bed, Check, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const RoomCard = ({ room, searchParams }) => {
  const navigate = useNavigate();

  // Support both room object or roomType summary object
  const roomType = room.roomType || room;
  const price = room.pricing ? room.pricing.pricePerNight : roomType.basePrice;
  const image = (room.images && room.images[0]) || (roomType.images && roomType.images[0]) || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
  const roomId = room._id;
  const roomTypeId = roomType._id || room.roomType;

  const handleBookNow = () => {
    navigate(`/book/${roomTypeId}`, {
      state: {
        roomId: room.roomNumber ? roomId : undefined,
        roomType,
        searchParams
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-beige-border overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col group">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ivory">
        <img
          src={image}
          alt={roomType.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/${roomType.name || 'room'}/800/500`;
          }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-md text-charcoal rounded-full border border-beige-border shadow-sm">
            {roomType.name}
          </span>
          {room.roomNumber && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-gold text-white rounded-full shadow-sm">
              Room #{room.roomNumber}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1.5 text-sm font-bold bg-white/95 backdrop-blur-md text-charcoal rounded-xl shadow-md border border-beige-border">
            {formatCurrency(price)}
            <span className="text-[11px] font-normal text-warmgrey"> / night</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-warmgrey mb-2">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-gold" />
              Up to {roomType.maxCapacity} Guests
            </span>
            <span className="flex items-center gap-1.5">
              <Bed size={14} className="text-gold" />
              {roomType.bedType || 'King Bed'}
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-charcoal mb-2 group-hover:text-gold-dark transition-colors">
            {roomType.name}
          </h3>

          <p className="text-sm text-warmgrey line-clamp-2 mb-4 leading-relaxed">
            {room.description || roomType.description}
          </p>

          {/* Key Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {(roomType.amenities || []).slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-ivory text-charcoal rounded-md border border-beige-border"
              >
                <Check size={11} className="text-gold" />
                {amenity}
              </span>
            ))}
            {(roomType.amenities || []).length > 3 && (
              <span className="text-[11px] px-2 py-1 text-warmgrey">
                +{roomType.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-beige-border">
          <Link
            to={`/rooms/${roomTypeId}`}
            className="py-2.5 px-3 text-center text-xs font-semibold text-charcoal bg-ivory hover:bg-beige-light border border-beige-border rounded-xl transition flex items-center justify-center gap-1"
          >
            Details
          </Link>
          <button
            onClick={handleBookNow}
            className="py-2.5 px-3 text-center text-xs font-semibold text-white bg-gold hover:bg-gold-dark rounded-xl transition shadow-sm flex items-center justify-center gap-1"
          >
            <span>Book Now</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;

