import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-beige-border text-charcoal pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-charcoal">
                  The Grand Heritage
                </span>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-warmgrey">
                  Hotel & Luxury Suites
                </span>
              </div>
            </div>
            <p className="text-sm text-warmgrey leading-relaxed">
              Experience the pinnacle of royal Indian hospitality, timeless architecture, and world-class luxury crafted for unforgettable memories.
            </p>
            <div className="text-xs text-warmgrey pt-2">
              <span className="inline-block px-3 py-1 bg-ivory border border-beige-border rounded-full font-medium text-gold-dark">
                ★ 5-Star Heritage Luxury Rating
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-charcoal mb-4 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-warmgrey">
              <li>
                <Link to="/" className="hover:text-gold transition">Luxury Home</Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-gold transition">Our Rooms & Suites</Link>
              </li>
              <li>
                <a href="/#facilities" className="hover:text-gold transition">Exclusive Amenities</a>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition">Heritage Legacy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition">Contact Concierge</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-gold transition">Manage Reservations</Link>
              </li>
            </ul>
          </div>

          {/* Room Categories */}
          <div>
            <h4 className="font-serif text-base font-semibold text-charcoal mb-4 uppercase tracking-wider">
              Suites & Rooms
            </h4>
            <ul className="space-y-2.5 text-sm text-warmgrey">
              <li>
                <Link to="/rooms?category=Standard+Room" className="hover:text-gold transition">Standard Room (₹2,499/nt)</Link>
              </li>
              <li>
                <Link to="/rooms?category=Deluxe+Room" className="hover:text-gold transition">Deluxe Room (₹4,499/nt)</Link>
              </li>
              <li>
                <Link to="/rooms?category=Premium+Room" className="hover:text-gold transition">Premium Garden Room (₹6,999/nt)</Link>
              </li>
              <li>
                <Link to="/rooms?category=Executive+Suite" className="hover:text-gold transition">Executive Royal Suite (₹11,999/nt)</Link>
              </li>
              <li>
                <Link to="/rooms?category=Family+Suite" className="hover:text-gold transition">Palace Family Suite (₹14,999/nt)</Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold text-charcoal mb-4 uppercase tracking-wider">
              Concierge Desk
            </h4>
            <ul className="space-y-3 text-sm text-warmgrey">
              <li className="flex items-start gap-2.5">
                <MapPin size={17} className="text-gold shrink-0 mt-0.5" />
                <span>108 Heritage Boulevard, Palace Enclave, New Delhi 110001, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={17} className="text-gold shrink-0" />
                <span>+91 11 4890 5500 / +91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={17} className="text-gold shrink-0" />
                <span>reservations@grandheritage.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={17} className="text-gold shrink-0" />
                <span>Check-in: 2:00 PM | Check-out: 11:00 AM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-beige-border flex flex-col sm:flex-row items-center justify-between text-xs text-warmgrey gap-4">
          <p>© {new Date().getFullYear()} The Grand Heritage Hotel. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={13} className="text-rose-500 fill-rose-500" /> by <span className="font-semibold text-charcoal">Team-6</span> • University Full-Stack Capstone Project
          </p>
          <div className="flex space-x-6 text-warmgrey">
            <span className="hover:text-charcoal cursor-pointer">Cancellation Policy</span>
            <span className="hover:text-charcoal cursor-pointer">Privacy Guidelines</span>
            <span className="hover:text-charcoal cursor-pointer">Terms of Stay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

