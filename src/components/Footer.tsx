import React from 'react';
import { MessageCircle, Phone, ArrowUpRight, ShieldCheck, Mail } from 'lucide-react';
import { usePreview } from '../context/PreviewContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { setShowSetupModal } = usePreview();

  const handleNav = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#241C19] text-[#F8F5EF] border-t border-[#3D322E] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-[#3D322E]">
          {/* Brand & Market Identity */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#FFFEFC] block">
              ESTCHAY LUX LADY’S BAGS
            </span>
            <p className="text-sm text-[#D8CBBE] max-w-md leading-relaxed">
              Curated ladies’ handbags, practical totes, and coordinated handbag sets in Ghana.
              Browse our catalogue and order conveniently through verified WhatsApp communication.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#B99A64]">
              <span>Market: Ghana</span>
              <span>·</span>
              <span>Currency: Ghanaian Cedi (GH₵)</span>
            </div>
          </div>

          {/* Boutique Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#B99A64] mb-4">
              Boutique
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D8CBBE]">
              <li>
                <button
                  onClick={() => handleNav('/')}
                  className="hover:text-[#FFFEFC] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/shop')}
                  className="hover:text-[#FFFEFC] transition-colors"
                >
                  Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/about')}
                  className="hover:text-[#FFFEFC] transition-colors"
                >
                  About ESTCHAY
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/order')}
                  className="hover:text-[#FFFEFC] transition-colors"
                >
                  Order Selection
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/privacy')}
                  className="hover:text-[#FFFEFC] transition-colors"
                >
                  Privacy Notice
                </button>
              </li>
            </ul>
          </div>

          {/* Verified Customer Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#B99A64] mb-4">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm text-[#D8CBBE]">
              <a
                href="https://wa.me/233548003400?text=Hello%20ESTCHAY%20LUX%20LADY%E2%80%99S%20BAGS%2C%20I%20have%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#B99A64] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#B99A64] shrink-0" />
                <span>WhatsApp: 233548003400</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>

              <a
                href="tel:0548003400"
                className="flex items-center gap-2 hover:text-[#B99A64] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#B99A64] shrink-0" />
                <span>Call: 0548003400</span>
              </a>

              <a
                href="mailto:info@estchaybags.com"
                className="flex items-center gap-2 hover:text-[#B99A64] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#B99A64] shrink-0" />
                <span>info@estchaybags.com</span>
              </a>

              <p className="text-xs text-[#D8CBBE]/70 pt-2 leading-relaxed">
                Orders are reviewed individually. Availability, delivery fees, and payment are agreed directly on WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D8CBBE]/60">
          <p>© {new Date().getFullYear()} ESTCHAY LUX LADY’S BAGS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('/privacy')}
              className="hover:text-[#D8CBBE] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowSetupModal(true)}
              className="hover:text-[#B99A64] transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supabase Architecture</span>
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="hover:text-[#D8CBBE] transition-colors"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
