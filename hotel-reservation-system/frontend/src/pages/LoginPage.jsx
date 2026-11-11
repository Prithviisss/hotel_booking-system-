import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Lock, Mail, AlertCircle, Loader2, Sparkles, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await login(email, password);

      // Redirect according to role
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedUser.role === 'RECEPTIONIST') {
        navigate('/reception');
      } else {
        navigate(from === '/login' ? '/my-bookings' : from);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-beige-border shadow-luxury">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-3 border border-gold/30">
            <Crown size={26} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
            The Grand Heritage Hotel
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal mt-1">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-warmgrey mt-1">
            Access your reservations, suites, and hospitality management consoles.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-gold" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.sharma@example.com"
              required
              className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5 flex items-center gap-1.5">
              <Lock size={13} className="text-gold" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition shadow-md hover:shadow-luxury flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Section (For Evaluation & University Demo) */}
        <div className="pt-4 border-t border-beige-border">
          <p className="text-[11px] text-warmgrey uppercase font-bold text-center tracking-wider mb-2.5 flex items-center justify-center gap-1">
            <UserCheck size={13} className="text-gold" />
            Quick Demo Login Credentials
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@grandheritage.com', 'Admin@123')}
              className="px-2 py-1.5 bg-ivory hover:bg-beige-light border border-beige-border rounded-lg text-[10px] font-semibold text-charcoal transition"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('receptionist@grandheritage.com', 'Reception@123')}
              className="px-2 py-1.5 bg-ivory hover:bg-beige-light border border-beige-border rounded-lg text-[10px] font-semibold text-charcoal transition"
            >
              Demo Receptionist
            </button>
            <button
              type="button"
              onClick={() => fillDemo('rahul.sharma@example.com', 'Customer@123')}
              className="px-2 py-1.5 bg-ivory hover:bg-beige-light border border-beige-border rounded-lg text-[10px] font-semibold text-charcoal transition"
            >
              Demo Customer
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center text-xs text-warmgrey pt-2">
          Don't have a Grand Heritage account?{' '}
          <Link to="/register" className="font-semibold text-gold-dark hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

