import React, { useState } from 'react';
import { Phone, MessageCircle, Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { submitContactMessage } from '../lib/api';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Please provide your name, subject, and message.');
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError('Please provide at least one valid contact method: your phone number or email.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactMessage({
        name: formData.name,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        subject: formData.subject,
        message: formData.message,
      });

      if (res.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError(res.error || 'Failed to submit contact enquiry. Please reach us directly on WhatsApp.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Page Title */}
      <div className="border-b border-[#D8CBBE]/50 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241C19]">
          Contact ESTCHAY LUX LADY’S BAGS
        </h1>
        <p className="text-sm text-[#241C19]/70 max-w-xl">
          We welcome questions regarding available handbag stock, colour selections, and dispatch arrangements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Left: Direct Verified Channels */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-6">
            <h2 className="font-serif text-lg font-semibold text-[#241C19]">
              Direct Communication
            </h2>

            {/* WhatsApp */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#B99A64] font-semibold block">
                Primary Ordering & Enquiry Desk
              </span>
              <a
                href="https://wa.me/233548003400?text=Hello%20ESTCHAY%20LUX%20LADY%E2%80%99S%20BAGS%2C%20I%20have%20an%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xs shadow-xs transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-semibold block">WhatsApp Desk</span>
                    <span className="text-xs opacity-90 font-mono">233548003400</span>
                  </div>
                </div>
                <span className="text-xs font-bold underline group-hover:no-underline">Chat Now →</span>
              </a>
            </div>

            {/* Phone */}
            <div className="space-y-2 pt-2 border-t border-[#D8CBBE]/40">
              <span className="text-xs uppercase tracking-wider text-[#241C19]/60 font-semibold block">
                Direct Telephone Calls
              </span>
              <a
                href="tel:0548003400"
                className="p-3 bg-[#F8F5EF] hover:bg-[#EFEAE2] border border-[#D8CBBE]/60 text-[#241C19] rounded-xs transition-colors flex items-center gap-3"
              >
                <Phone className="w-4 h-4 text-[#B99A64] shrink-0" />
                <div>
                  <span className="text-xs font-semibold block">Business Line</span>
                  <span className="text-xs font-mono">0548003400</span>
                </div>
              </a>
            </div>

            {/* Email */}
            <div className="space-y-2 pt-2 border-t border-[#D8CBBE]/40">
              <span className="text-xs uppercase tracking-wider text-[#241C19]/60 font-semibold block">
                Official Business Email
              </span>
              <a
                href="mailto:chayestee1@mail.com"
                className="p-3 bg-[#F8F5EF] hover:bg-[#EFEAE2] border border-[#D8CBBE]/60 text-[#241C19] rounded-xs transition-colors flex items-center gap-3"
              >
                <Mail className="w-4 h-4 text-[#B99A64] shrink-0" />
                <div>
                  <span className="text-xs font-semibold block">Email Address</span>
                  <span className="text-xs">chayestee1@mail.com</span>
                </div>
              </a>
            </div>

            <p className="text-xs text-[#241C19]/60 leading-relaxed pt-2">
              Our handbag boutique serves customers in Accra and arranges reliable parcel deliveries across all 16 regions of Ghana.
            </p>
          </div>
        </div>

        {/* Right: Working Secure Contact Form */}
        <div className="md:col-span-7 bg-[#FFFEFC] border border-[#D8CBBE] p-6 sm:p-8 rounded-sm shadow-xs space-y-6">
          <div className="border-b border-[#D8CBBE]/40 pb-3">
            <h2 className="font-serif text-lg font-semibold text-[#241C19]">
              Send a Message
            </h2>
            <p className="text-xs text-[#241C19]/60 mt-1">
              Please enter your contact details and message below.
            </p>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Thank you. Your message has been safely received. Our team will contact you via your provided contact details.
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="contact-name" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Your Name <span className="text-[#6D2638]">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Abena Osei"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Phone & Email (At least one required) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="contact-phone" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0548003400"
                  className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-email" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. abena@example.com"
                  className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#241C19]/55 italic">
              * Please provide either your phone number or email so we can reach you.
            </p>

            {/* Subject */}
            <div className="space-y-1">
              <label htmlFor="contact-subject" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Subject <span className="text-[#6D2638]">*</span>
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Handbag Set Availability / Custom Order"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label htmlFor="contact-message" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Message <span className="text-[#6D2638]">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your questions or order preferences here..."
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:bg-stone-300"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
