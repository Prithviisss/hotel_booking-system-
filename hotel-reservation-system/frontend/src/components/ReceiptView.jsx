import React from 'react';
import { Crown, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const ReceiptView = ({ booking, payment, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const roomType = booking.roomType || {};
  const room = booking.room || {};

  return (
    <div className="max-w-3xl mx-auto my-8">
      {/* Top action toolbar (hidden during print) */}
      <div className="no-print flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-beige-border shadow-soft">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-semibold text-charcoal hover:text-gold uppercase tracking-wider transition"
          >
            ← Back to Reservations
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-semibold tracking-wider transition shadow-sm"
          >
            <Printer size={15} />
            Print Official Receipt
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-ivory hover:bg-beige-light border border-beige-border text-charcoal rounded-xl text-xs font-semibold tracking-wider transition"
          >
            <Download size={15} />
            Save as PDF
          </button>
        </div>
      </div>

      {/* Official Receipt Card */}
      <div className="bg-white border border-beige-border rounded-2xl p-8 sm:p-12 shadow-luxury text-charcoal relative print:border-none print:shadow-none print:p-0">
        
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-beige-border gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center border border-gold/30">
                <Crown size={20} />
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-charcoal">
                The Grand Heritage
              </h2>
            </div>
            <p className="text-xs uppercase tracking-widest text-warmgrey">
              Palace Enclave, 108 Heritage Blvd, New Delhi - 110001
            </p>
            <p className="text-[11px] text-warmgrey">
              GSTIN: 07AABCT8901Z1Z2 • CIN: U55101DL2024PTC123456
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider mb-1">
              Official Tax Invoice
            </span>
            <p className="font-serif text-lg font-bold text-charcoal">
              {booking.bookingId}
            </p>
            <p className="text-xs text-warmgrey">
              Date: {formatDate(booking.createdAt || new Date())}
            </p>
          </div>
        </div>

        {/* Guest & Reservation Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-beige-border text-sm">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warmgrey mb-3">
              Guest Information
            </h4>
            <p className="font-semibold text-base text-charcoal">{booking.guestName}</p>
            <p className="text-warmgrey text-xs mt-0.5">{booking.guestEmail}</p>
            <p className="text-warmgrey text-xs mt-0.5">{booking.guestPhone}</p>
            {booking.specialRequests && (
              <p className="text-[11px] text-warmgrey mt-2 italic bg-ivory p-2 rounded-lg border border-beige-border">
                Special Requests: "{booking.specialRequests}"
              </p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-warmgrey mb-3">
              Reservation Schedule
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-warmgrey">Check-in:</span>
                <span className="font-medium text-charcoal">{formatDate(booking.checkInDate)} (2:00 PM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgrey">Check-out:</span>
                <span className="font-medium text-charcoal">{formatDate(booking.checkOutDate)} (11:00 AM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgrey">Duration:</span>
                <span className="font-medium text-charcoal">{booking.nights} Night{booking.nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgrey">Occupancy:</span>
                <span className="font-medium text-charcoal">{booking.adults} Adults{booking.children ? `, ${booking.children} Children` : ''}</span>
              </div>
              {room.roomNumber && (
                <div className="flex justify-between font-semibold text-gold-dark">
                  <span>Assigned Room:</span>
                  <span>Room #{room.roomNumber} (Floor {room.floor || 1})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-8 border-b border-beige-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-beige-border text-warmgrey uppercase tracking-wider">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 text-center font-semibold">Nights</th>
                <th className="pb-3 text-right font-semibold">Rate / Night</th>
                <th className="pb-3 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-border/50 text-sm">
              <tr>
                <td className="py-4">
                  <span className="font-semibold text-charcoal block">{roomType.name || 'Luxury Suite'}</span>
                  <span className="text-xs text-warmgrey">{roomType.bedType || 'King Bed'} • {roomType.size || 'Spacious'}</span>
                </td>
                <td className="py-4 text-center text-charcoal">{booking.nights}</td>
                <td className="py-4 text-right text-charcoal">
                  {formatCurrency(roomType.basePrice || booking.subtotal / booking.nights)}
                </td>
                <td className="py-4 text-right font-medium text-charcoal">
                  {formatCurrency(booking.subtotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pricing Summary */}
          <div className="w-full sm:w-1/2 ml-auto pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-warmgrey">
              <span>Room Subtotal</span>
              <span className="font-medium text-charcoal">{formatCurrency(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between text-warmgrey">
              <span>Applicable Goods & Services Tax (GST)</span>
              <span className="font-medium text-charcoal">{formatCurrency(booking.taxes)}</span>
            </div>
            <div className="pt-2 border-t border-beige-border flex justify-between items-baseline font-serif text-base font-bold text-charcoal">
              <span>Total Amount Paid (INR)</span>
              <span className="text-xl text-gold-dark">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Verification Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 size={16} />
              <span>Payment Verified: {payment?.paymentStatus || booking.paymentStatus || 'SUCCESS'}</span>
            </div>
            <p className="text-warmgrey text-[11px]">
              Payment Gateway: {payment?.paymentMethod || 'Razorpay Test Gateway'} • Ref: {payment?.transactionReference || 'TXN-HERITAGE-9821'}
            </p>
          </div>

          <div className="text-left sm:text-right text-[11px] text-warmgrey">
            <p className="font-semibold text-charcoal">The Grand Heritage Hospitality Ltd.</p>
            <p>Computer-generated invoice. Authorized signatory.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;

