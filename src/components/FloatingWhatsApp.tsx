import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappNumber = '233548003400';
  const message = 'Hello ESTCHAY LUX LADY’S BAGS, I have an enquiry.';
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
        aria-label="Contact us on WhatsApp"
      >
        {/* Tooltip */}
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#241C19] text-[#F8F5EF] text-[10px] font-bold uppercase tracking-widest rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          Chat With Us
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#241C19]" />
        </span>
        
        <MessageCircle className="w-7 h-7 fill-white/10" />
        
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
      </a>
    </div>
  );
};
