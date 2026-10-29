import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { ContactMessage } from '../../types';
import { fetchAdminMessages } from '../../lib/api';

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAdminMessages();
        setMessages(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const markAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#241C19]">
          Customer Messages & Enquiries
        </h1>
        <p className="text-xs text-[#241C19]/60">
          Inquiries submitted through the public website contact form
        </p>
      </div>

      <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60">
            No contact inquiries recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#D8CBBE]/30 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-5 space-y-3 transition-colors ${
                  m.status === 'unread' ? 'bg-[#FAF8F5]' : 'bg-[#FFFEFC]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-semibold text-[#241C19]">
                      {m.name}
                    </span>
                    {m.status === 'unread' && (
                      <span className="px-1.5 py-0.5 bg-[#6D2638] text-white text-[9px] uppercase font-bold rounded-xs">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#241C19]/50">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-[#241C19]/70">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-1 text-[#241C19] hover:text-[#6D2638]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#B99A64]" />
                      <span className="font-mono">{m.phone}</span>
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="flex items-center gap-1 text-[#241C19] hover:text-[#6D2638]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#B99A64]" />
                      <span>{m.email}</span>
                    </a>
                  )}
                </div>

                <div className="space-y-1 pt-1">
                  <h4 className="font-semibold text-xs text-[#241C19]">
                    Subject: {m.subject}
                  </h4>
                  <p className="text-xs text-[#241C19]/80 leading-relaxed bg-[#F8F5EF] p-3 rounded-xs border border-[#D8CBBE]/40">
                    {m.message}
                  </p>
                </div>

                {m.status === 'unread' && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => markAsRead(m.id)}
                      className="text-[11px] text-[#241C19]/70 hover:text-[#241C19] flex items-center gap-1 font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Read</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
