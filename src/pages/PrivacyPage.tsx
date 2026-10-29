import React from 'react';
import { ShieldCheck, Lock, Database, MessageCircle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#D8CBBE]/50 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block">
          Draft Policy & Data Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241C19]">
          Privacy Information
        </h1>
        <p className="text-xs text-[#241C19]/60">
          Last revised: October 2026 · ESTCHAY LUX LADY’S BAGS (Ghana)
        </p>
      </div>

      <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 sm:p-8 rounded-sm shadow-xs space-y-8 text-sm text-[#241C19]/85 leading-relaxed">
        {/* Notice of Draft Status */}
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-xs space-y-1">
          <p className="font-semibold">Notice Regarding Legal Review:</p>
          <p>
            This draft document accurately describes the technical collection, storage, and handoff of customer data implemented in this boutique website. The business owner should conduct an independent review to align with applicable local statutes in Ghana.
          </p>
        </div>

        {/* 1. What We Collect */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#241C19] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#B99A64]" />
            1. Customer Information We Collect
          </h2>
          <p>
            Customers may freely explore the boutique without registering an account. When submitting an order request or contacting us, we collect only necessary logistical details:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#241C19]/80 pl-2">
            <li>Customer full name</li>
            <li>Primary contact telephone number (for WhatsApp and voice verification)</li>
            <li>Optional secondary phone number</li>
            <li>Delivery destination (Region, city or town, and delivery address/landmark)</li>
            <li>Specific delivery notes or requests</li>
            <li>Selected handbags, variants, and quantities</li>
          </ul>
          <p className="text-xs italic text-[#241C19]/70">
            We do not collect or store debit cards, mobile money PINs, or financial account numbers on this website.
          </p>
        </div>

        {/* 2. How Data is Stored & Row Level Security */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#241C19] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#B99A64]" />
            2. Secure Storage via Supabase PostgreSQL
          </h2>
          <p>
            When connected to Supabase, customer orders, contact messages, and audit histories are safeguarded using Row Level Security (RLS) policies:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#241C19]/80 pl-2">
            <li>Orders are private records accessible solely through authenticated administrator roles or validated server-side endpoints.</li>
            <li>Public users cannot list, query, or enumerate order records or contact submissions of other customers.</li>
            <li>Browser local storage only preserves handbag product IDs and quantities in your temporary shopping bag. Customer contact details and delivery addresses are never stored in your browser’s local storage.</li>
          </ul>
        </div>

        {/* 3. The WhatsApp Handoff */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#241C19] flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            3. The WhatsApp Handoff Workflow
          </h2>
          <p>
            Upon clicking &lsquo;Save Request & Proceed to WhatsApp&rsquo;, your order request is assigned a unique reference code. You are then provided a link that opens WhatsApp with your pre-formatted summary directed to our verified number (<strong>233548003400</strong>).
          </p>
          <p className="text-xs text-[#241C19]/75">
            Launching WhatsApp does not conclude an order; it enables a direct conversation with our team to confirm current stock availability, assess delivery fees for your town, and agree on payment.
          </p>
        </div>

        {/* 4. Owner & Privacy Contact */}
        <div className="space-y-2 pt-4 border-t border-[#D8CBBE]/40 text-xs">
          <h3 className="font-semibold text-sm text-[#241C19]">
            4. Enquiries & Data Deletion
          </h3>
          <p>
            If you wish to query, modify, or request the deletion of an order record or contact message you submitted, please call or WhatsApp us on <strong>0548003400</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
