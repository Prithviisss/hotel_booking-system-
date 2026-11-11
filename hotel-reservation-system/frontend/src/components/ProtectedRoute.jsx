import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center p-8 bg-white border border-beige-border rounded-2xl shadow-soft">
          <div className="w-12 h-12 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif text-lg text-charcoal">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-beige-border shadow-luxury text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Access Restricted</h2>
          <p className="text-warmgrey text-sm mb-6 leading-relaxed">
            Your current account role (<span className="font-semibold text-charcoal">{user?.role}</span>) does not have authorization to view this management module.
          </p>
          <div className="space-y-3">
            {user?.role === 'ADMIN' && (
              <a href="/admin" className="block w-full py-2.5 px-4 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition shadow-sm">
                Go to Admin Dashboard
              </a>
            )}
            {user?.role === 'RECEPTIONIST' && (
              <a href="/reception" className="block w-full py-2.5 px-4 bg-gold text-white font-medium rounded-lg hover:bg-gold-dark transition shadow-sm">
                Go to Receptionist Desk
              </a>
            )}
            <a href="/" className="block w-full py-2.5 px-4 bg-beige-light text-charcoal font-medium rounded-lg hover:bg-beige transition">
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

