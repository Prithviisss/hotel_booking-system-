import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Lock, Mail, User, Phone, AlertCircle, Loader2, Shield } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'RECEPTIONIST') navigate('/reception');
      else navigate('/my-bookings');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-beige-border shadow-luxury">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-3 border border-gold/30">
            <Crown size={26} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
            The Grand Heritage Hotel
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal mt-1">
            Create Guest Account
          </h2>
          <p className="text-xs text-warmgrey mt-1">
            Enjoy seamless reservations, complimentary upgrades, and instant bookings.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
              <User size={13} className="text-gold" />
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Maharani Gayatri Devi"
              required
              className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
              <Mail size={13} className="text-gold" />
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
              <Phone size={13} className="text-gold" />
              Contact Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-gold" />
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 chars"
                required
                className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-gold" />
                Confirm <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm pass"
                required
                className="w-full px-3.5 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Optional Role Selector for demo/academic evaluation */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1 flex items-center gap-1.5">
              <Shield size={13} className="text-gold" />
              Account Role (Development Demo)
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-ivory border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-gold"
            >
              <option value="CUSTOMER">Customer (Standard Guest)</option>
              <option value="RECEPTIONIST">Receptionist (Front Desk Operations)</option>
              <option value="ADMIN">Admin (Full System Manager)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition shadow-md hover:shadow-luxury flex items-center justify-center gap-2 pt-3"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-warmgrey pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold-dark hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;

