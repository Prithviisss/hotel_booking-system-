import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Crown,
  Menu,
  X,
  User,
  LogOut,
  CalendarCheck,
  ShieldCheck,
  ClipboardList,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isReceptionist } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms & Suites', path: '/rooms' },
    { name: 'Facilities', path: '/#facilities' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-beige-border shadow-soft transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform duration-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal group-hover:text-gold-dark transition-colors">
                The Grand Heritage
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-warmgrey -mt-1 font-medium">
                Hotel & Luxury Suites
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md relative ${
                  isActive(link.path)
                    ? 'text-gold-dark font-semibold'
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Role specific quick action */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal bg-beige-light border border-beige-border rounded-full hover:bg-beige transition shadow-sm"
                  >
                    <ShieldCheck size={15} className="text-gold" />
                    Admin Portal
                  </Link>
                )}

                {isReceptionist && (
                  <Link
                    to="/reception"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal bg-beige-light border border-beige-border rounded-full hover:bg-beige transition shadow-sm"
                  >
                    <ClipboardList size={15} className="text-gold" />
                    Front Desk
                  </Link>
                )}

                {/* Customer Dashboard Link */}
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:text-gold border border-beige-border rounded-full hover:border-gold/50 transition bg-white"
                >
                  <CalendarCheck size={15} className="text-gold" />
                  My Bookings
                </Link>

                {/* Profile pill & Logout */}
                <div className="flex items-center pl-2 border-l border-beige-border gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory rounded-full border border-beige-border text-xs text-charcoal">
                    <User size={14} className="text-gold" />
                    <span className="max-w-[120px] truncate font-medium">{user?.name?.split(' ')[0]}</span>
                    <span className="text-[10px] bg-gold/15 text-gold-dark px-1.5 py-0.5 rounded font-bold">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-warmgrey hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-charcoal hover:text-gold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide text-white bg-gold hover:bg-gold-dark rounded-full shadow-sm hover:shadow-luxury transition-all duration-200"
                >
                  <Sparkles size={16} />
                  Book A Room
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal hover:text-gold rounded-lg transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-beige-border px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-beige-light text-gold-dark font-semibold'
                    : 'text-charcoal hover:bg-ivory'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-beige-border flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 bg-ivory rounded-lg border border-beige-border">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gold" />
                    <span className="font-medium text-sm text-charcoal">{user?.name}</span>
                  </div>
                  <span className="text-[10px] bg-gold/15 text-gold-dark px-2 py-0.5 rounded font-bold">
                    {user?.role}
                  </span>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal bg-beige-light rounded-lg"
                  >
                    <ShieldCheck size={16} className="text-gold" />
                    Admin Dashboard
                  </Link>
                )}

                {isReceptionist && (
                  <Link
                    to="/reception"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal bg-beige-light rounded-lg"
                  >
                    <ClipboardList size={16} className="text-gold" />
                    Receptionist Desk
                  </Link>
                )}

                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal bg-white border border-beige-border rounded-lg"
                >
                  <CalendarCheck size={16} className="text-gold" />
                  My Bookings
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-medium text-charcoal bg-beige-light hover:bg-beige rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold text-white bg-gold hover:bg-gold-dark rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

