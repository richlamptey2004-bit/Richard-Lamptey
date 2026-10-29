import React from 'react';
import { ArrowRight, MessageCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#D8CBBE]/50 pb-8 space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block">
          Editorial Focus & Principles
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241C19]">
          About ESTCHAY LUX LADY’S BAGS
        </h1>
        <p className="text-base text-[#241C19]/80 leading-relaxed max-w-2xl">
          Focused exclusively on curated ladies’ handbags, practical work totes, and harmonious multi-piece handbag sets for clients across Ghana.
        </p>
      </div>

      {/* Main Philosophy (Draft Copy, No Invented History) */}
      <section className="space-y-6 text-sm text-[#241C19]/85 leading-relaxed bg-[#FFFEFC] border border-[#D8CBBE] p-6 sm:p-8 rounded-sm shadow-xs">
        <h2 className="font-serif text-xl font-bold text-[#241C19]">
          Clear Selection, Transparent Communication
        </h2>
        <p>
          At ESTCHAY LUX LADY’S BAGS, our objective is straightforward: to bring together distinctive, practical handbags with complete transparency in pricing, colour options, and dimensions.
        </p>
        <p>
          We recognise that shopping for a handbag requires knowing how handles fit the shoulder, how hardware complements the silhouette, and which accessories are included. That is why every photograph is framed to keep straps and bag edges in full view, and all multi-piece sets clearly distinguish what is in the collection.
        </p>
      </section>

      {/* Three Guiding Standards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 rounded-sm space-y-2">
          <div className="w-10 h-10 rounded-xs bg-[#F8F5EF] text-[#B99A64] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-semibold text-[#241C19]">
            Exclusively Handbags
          </h3>
          <p className="text-xs text-[#241C19]/70 leading-relaxed">
            We do not manufacture or sell clothing garments, fast-fashion outfits, or apparel. We focus solely on women’s bags, totes, and purses.
          </p>
        </div>

        <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 rounded-sm space-y-2">
          <div className="w-10 h-10 rounded-xs bg-[#F8F5EF] text-[#B99A64] flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-semibold text-[#241C19]">
            Authentic Specifications
          </h3>
          <p className="text-xs text-[#241C19]/70 leading-relaxed">
            We only list confirmed specifications. Where material or dimensions have not been formally confirmed, they are clearly stated or omitted rather than assumed.
          </p>
        </div>

        <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 rounded-sm space-y-2">
          <div className="w-10 h-10 rounded-xs bg-[#F8F5EF] text-[#B99A64] flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-semibold text-[#241C19]">
            Convenient WhatsApp Desk
          </h3>
          <p className="text-xs text-[#241C19]/70 leading-relaxed">
            Browse freely without registering an account. Finalise delivery, town arrangements, and payment directly with our team on WhatsApp.
          </p>
        </div>
      </section>

      {/* Direct Contact CTAs */}
      <section className="bg-[#241C19] text-[#F8F5EF] p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-xl font-bold text-[#FFFEFC]">
            Ready to explore our curated pieces?
          </h3>
          <p className="text-xs text-[#D8CBBE]">
            Browse our catalogue or chat with us on WhatsApp regarding any bag in stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-3 bg-[#FFFEFC] text-[#241C19] text-xs font-semibold rounded-xs hover:bg-[#B99A64] transition-colors flex items-center gap-1.5"
          >
            <span>View Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://wa.me/233548003400?text=Hello%20ESTCHAY%20LUX%20LADY%E2%80%99S%20BAGS%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20boutique."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
