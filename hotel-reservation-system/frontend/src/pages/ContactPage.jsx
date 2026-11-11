import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="bg-ivory min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-semibold">
            24/7 Concierge & Inquiries
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
            Connect With Our Concierge
          </h1>
          <p className="text-warmgrey text-sm max-w-xl mx-auto">
            Whether planning an imperial wedding, corporate symposium, or private family retreat, our luxury concierge team is at your command.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft space-y-8">
            <h3 className="font-serif text-2xl font-bold text-charcoal pb-4 border-b border-beige-border">
              Estate Information
            </h3>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Location Address</h4>
                  <p className="text-warmgrey text-xs mt-0.5">
                    108 Heritage Boulevard, Palace Enclave, Diplomatic District, New Delhi - 110001, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Direct Inquiries</h4>
                  <p className="text-warmgrey text-xs mt-0.5">+91 11 4890 5500 / +91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Electronic Mail</h4>
                  <p className="text-warmgrey text-xs mt-0.5">reservations@grandheritage.com / concierge@grandheritage.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Hours of Hospitality</h4>
                  <p className="text-warmgrey text-xs mt-0.5">Front Desk: 24 Hours • Room Service: 24 Hours • Spa: 7 AM - 10 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl border border-beige-border p-8 shadow-soft">
            <h3 className="font-serif text-2xl font-bold text-charcoal pb-4 border-b border-beige-border mb-6">
              Send an Inquiry
            </h3>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 size={44} className="text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-charcoal">Message Delivered</h4>
                <p className="text-xs text-warmgrey">Our Chief Concierge will respond to your registered email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Inquiry regarding suite booking..."
                    className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-charcoal mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How may our concierge assist your upcoming stay?"
                    className="w-full px-4 py-2.5 bg-ivory border border-beige-border rounded-xl text-sm focus:outline-none focus:border-gold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;

