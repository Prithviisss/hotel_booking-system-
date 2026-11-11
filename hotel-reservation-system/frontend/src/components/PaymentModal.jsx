import React, { useState } from 'react';
import { paymentService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Loader2,
  Sparkles
} from 'lucide-react';

const PaymentModal = ({ booking, onPaymentSuccess, onPaymentFailure, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [paymentModeInfo, setPaymentModeInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState('INIT'); // 'INIT', 'MOCK_CHOICE', 'PROCESSING'

  // Initialize payment order
  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await paymentService.createOrder(booking.bookingId);
      const orderData = res.data;
      setPaymentModeInfo(orderData);

      // If Razorpay checkout is available on window and real credentials were provided
      if (!orderData.isMockMode && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: 'The Grand Heritage Hotel',
          description: `Booking #${orderData.bookingId} Reservation Deposit`,
          order_id: orderData.orderId,
          prefill: {
            name: booking.guestName,
            email: booking.guestEmail,
            contact: booking.guestPhone
          },
          theme: {
            color: '#C5A46D'
          },
          handler: async function (response) {
            try {
              setStep('PROCESSING');
              const verifyRes = await paymentService.verifyPayment({
                bookingId: booking.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                isMock: false
              });
              onPaymentSuccess(verifyRes.data.booking, verifyRes.data.payment);
            } catch (verErr) {
              setErrorMsg(verErr.message);
              onPaymentFailure(verErr.message);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setErrorMsg(resp.error?.description || 'Payment transaction failed.');
          onPaymentFailure(resp.error?.description);
        });
        rzp.open();
        setLoading(false);
      } else {
        // Mock Payment Mode is active
        setStep('MOCK_CHOICE');
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to initialize payment gateway.');
    }
  };

  // Process Mock Simulations
  const handleMockSimulation = async (simulationType) => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await paymentService.verifyPayment({
        bookingId: booking.bookingId,
        razorpay_order_id: paymentModeInfo?.orderId || 'mock_order_123',
        isMock: true,
        simulationType
      });

      if (simulationType === 'SUCCESS') {
        onPaymentSuccess(res.data.booking, res.data.payment);
      }
    } catch (err) {
      setErrorMsg(err.message);
      if (simulationType === 'FAILED' || simulationType === 'CANCEL') {
        onPaymentFailure(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-dark/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-beige-border shadow-elevated max-w-lg w-full overflow-hidden text-charcoal">
        
        {/* Header */}
        <div className="bg-ivory border-b border-beige-border px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center border border-gold/30">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Secure Reservation Checkout
              </h3>
              <p className="text-xs text-warmgrey">
                Booking Reference: <span className="font-semibold text-charcoal">{booking.bookingId}</span>
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

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Order Summary Card */}
          <div className="bg-ivory/70 border border-beige-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warmgrey">Suite / Category</span>
              <span className="font-medium text-charcoal">{booking.roomType?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warmgrey">Stay Duration</span>
              <span className="font-medium text-charcoal">{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warmgrey">Guests</span>
              <span className="font-medium text-charcoal">{booking.adults} Adults{booking.children ? `, ${booking.children} Children` : ''}</span>
            </div>
            <div className="pt-2 border-t border-beige-border flex justify-between items-baseline">
              <span className="font-serif text-base font-semibold text-charcoal">Total Amount Due</span>
              <span className="font-serif text-2xl font-bold text-gold-dark">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'INIT' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <Lock size={16} className="text-gold-dark shrink-0" />
                <span>
                  All payments are securely processed through 256-bit encrypted SSL. In testing environments, you may choose verified test gateway checkout or simulate transaction outcomes.
                </span>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl transition shadow-md hover:shadow-luxury flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Contacting Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Proceed to Pay {formatCurrency(booking.totalAmount)}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* MOCK PAYMENT MODE SELECTOR (Strict Requirement) */}
          {step === 'MOCK_CHOICE' && (
            <div className="space-y-4 border border-gold/30 bg-gold/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-gold-dark font-serif font-bold text-sm">
                <Sparkles size={16} />
                <span>MOCK PAYMENT TEST HARNESS (Local Development)</span>
              </div>
              <p className="text-xs text-warmgrey leading-relaxed">
                Razorpay API keys were not supplied in <code className="bg-white px-1 py-0.5 rounded border border-beige-border">.env</code>. The backend has activated the test simulator to allow full functional verification of the booking lifecycle.
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleMockSimulation('SUCCESS')}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 size={17} />
                  <span>Simulate Successful Payment</span>
                </button>

                <button
                  onClick={() => handleMockSimulation('FAILED')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <XCircle size={17} />
                  <span>Simulate Failed Payment</span>
                </button>

                <button
                  onClick={() => handleMockSimulation('CANCEL')}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-white hover:bg-ivory text-charcoal border border-beige-border font-medium rounded-xl text-xs transition"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="text-center py-6">
              <Loader2 size={36} className="animate-spin text-gold mx-auto mb-3" />
              <p className="font-serif text-base font-semibold text-charcoal">
                Verifying Cryptographic Payment Signature...
              </p>
              <p className="text-xs text-warmgrey mt-1">
                Please do not refresh or close this browser window.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-ivory/50 border-t border-beige-border px-6 py-3.5 flex items-center justify-between text-[11px] text-warmgrey">
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-gold" />
            PCI-DSS Level 1 Encrypted
          </span>
          <span>Razorpay Integration • Team-6</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

