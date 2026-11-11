import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const CancellationModal = ({ booking, onCancelled, onClose }) => {
  const [reason, setReason] = useState('Change of travel schedule');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [refundPreview, setRefundPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setPreviewLoading(true);
        const res = await bookingService.cancelPreview(booking._id || booking.bookingId);
        setRefundPreview(res.data.refundDetails);
      } catch (err) {
        console.error('Failed to load cancel preview:', err.message);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [booking]);

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify a cancellation reason');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await bookingService.cancelBooking(booking._id || booking.bookingId, { reason });
      onCancelled(res.data.booking, res.data.refundDetails);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel reservation');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-dark/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-beige-border shadow-elevated max-w-lg w-full overflow-hidden text-charcoal">
        
        {/* Header */}
        <div className="bg-ivory border-b border-beige-border px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Cancel Reservation
              </h3>
              <p className="text-xs text-warmgrey">
                Booking ID: <span className="font-semibold text-charcoal">{booking.bookingId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-warmgrey hover:text-charcoal p-1.5 rounded-lg hover:bg-beige-light transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirmCancel} className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Refund breakdown card */}
          {previewLoading ? (
            <div className="p-6 text-center">
              <Loader2 size={24} className="animate-spin text-gold mx-auto mb-2" />
              <p className="text-xs text-warmgrey">Calculating cancellation policy refund...</p>
            </div>
          ) : refundPreview ? (
            <div className="bg-ivory border border-beige-border rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-beige-border">
                <span className="font-semibold text-charcoal uppercase tracking-wider">Applicable Policy</span>
                <span className="font-semibold text-gold-dark">{refundPreview.policyTier}</span>
              </div>
              <div className="flex justify-between text-xs text-warmgrey">
                <span>Total Booking Amount Paid</span>
                <span className="text-charcoal font-medium">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-600">
                <span>Cancellation Charges</span>
                <span>- {formatCurrency(refundPreview.cancellationCharges)}</span>
              </div>
              <div className="pt-2 border-t border-beige-border flex justify-between items-baseline font-serif">
                <span className="text-sm font-bold text-charcoal">Refund Amount Payable</span>
                <span className="text-lg font-bold text-emerald-700">
                  {formatCurrency(refundPreview.refundAmount)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Cancellation Policy summary note */}
          <div className="p-3 bg-beige-light/50 border border-beige-border rounded-xl text-[11px] text-warmgrey leading-relaxed">
            <span className="font-semibold text-charcoal block mb-0.5">Hotel Cancellation Terms:</span>
            • Free cancellation with 100% refund up to 48 hours before check-in date ({formatDate(booking.checkInDate)}).<br />
            • 30% retention fee applied between 24–48 hours prior.<br />
            • Non-refundable if cancelled within 24 hours of arrival.
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you are cancelling this booking..."
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-beige-border rounded-xl focus:outline-none focus:border-gold transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 bg-beige-light hover:bg-beige text-charcoal font-medium rounded-xl text-sm transition"
            >
              Keep My Booking
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancellationModal;

