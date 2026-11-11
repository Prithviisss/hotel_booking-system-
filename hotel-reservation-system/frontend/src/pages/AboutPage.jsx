import React from 'react';
import { Crown, Award, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-ivory min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-2 border border-gold/30">
            <Crown size={24} />
          </div>
          <span className="text-xs uppercase tracking-widest text-gold-dark font-semibold">
            Centenary Heritage Since 1924
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">
            The Grand Heritage Legacy
          </h1>
          <p className="text-warmgrey text-base max-w-2xl mx-auto leading-relaxed">
            Where majestic Indo-Saracenic royal architecture seamlessly meets world-class contemporary hospitality and culinary artistry.
          </p>
        </div>

        <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-luxury border border-beige-border">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
            alt="Palace facade"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white rounded-3xl border border-beige-border p-8 sm:p-12 shadow-soft space-y-8 text-charcoal leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-3">Our Royal Roots</h2>
            <p className="text-warmgrey text-sm sm:text-base">
              Founded over a century ago as an imperial royal guest residence, The Grand Heritage Hotel has welcomed dignitaries, artists, and discerning travelers from around the world. Every archway, hand-carved jali, and Italian marble terrace tells an extraordinary story of craftsmanship and dedication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-beige-border">
            <div className="space-y-2">
              <Award className="text-gold w-8 h-8" />
              <h4 className="font-serif text-lg font-bold">Uncompromising Luxury</h4>
              <p className="text-xs text-warmgrey">Custom-designed interiors, Egyptian cotton linens, and personalized 24/7 butler assistance.</p>
            </div>

            <div className="space-y-2">
              <ShieldCheck className="text-gold w-8 h-8" />
              <h4 className="font-serif text-lg font-bold">Pure Transparency</h4>
              <p className="text-xs text-warmgrey">Zero hidden fees, transparent cancellation policies, and verified Razorpay SSL transactions.</p>
            </div>

            <div className="space-y-2">
              <HeartHandshake className="text-gold w-8 h-8" />
              <h4 className="font-serif text-lg font-bold">Indian Atithi Devo Bhava</h4>
              <p className="text-xs text-warmgrey">Treating every honored guest as the divine center of our palace hospitality.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;

