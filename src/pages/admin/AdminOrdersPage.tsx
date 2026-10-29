import React, { useEffect, useState } from 'react';
import { Inbox, Filter, Eye, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { fetchAdminOrders } from '../../lib/api';
import { formatGHS } from '../../lib/formatters';

interface AdminOrdersPageProps {
  navigate: (path: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ navigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAdminOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const statusPills: Array<{ label: string; value: string }> = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending WhatsApp', value: 'pending_confirmation' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Dispatched', value: 'dispatched' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#241C19]">
            Customer Order Enquiries & Status
          </h1>
          <p className="text-xs text-[#241C19]/60">
            Track requests, perform atomic inventory deductions, and monitor deliveries
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {statusPills.map((p) => (
          <button
            key={p.value}
            onClick={() => setStatusFilter(p.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xs whitespace-nowrap transition-colors ${
              statusFilter === p.value
                ? 'bg-[#241C19] text-[#F8F5EF]'
                : 'bg-[#FFFEFC] border border-[#D8CBBE] text-[#241C19]/70 hover:bg-[#F8F5EF]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60">
            Loading order records...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60">
            No orders match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] text-[#241C19]/70 uppercase tracking-wider font-semibold border-b border-[#D8CBBE]/60">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Delivery Town</th>
                  <th className="py-3 px-4">Merchandise Total</th>
                  <th className="py-3 px-4">Stock Deducted?</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8CBBE]/30">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#241C19]">
                      {ord.order_reference}
                    </td>

                    <td className="py-3 px-4 text-[#241C19]/70">
                      {new Date(ord.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold block">{ord.customer_name}</span>
                      <span className="text-[#241C19]/60 font-mono">{ord.customer_phone}</span>
                    </td>

                    <td className="py-3 px-4 text-[#241C19]/80">
                      {ord.city}, {ord.region}
                    </td>

                    <td className="py-3 px-4 font-semibold tabular-nums text-[#241C19]">
                      {formatGHS(ord.total_pesewas)}
                    </td>

                    <td className="py-3 px-4">
                      {ord.inventory_deducted ? (
                        <span className="text-[#2D5A43] font-semibold text-[11px]">Deducted</span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Pending Confirmation</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-xs font-semibold uppercase text-[10px] tracking-wider ${
                          ord.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'pending_confirmation'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'delivered'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${ord.id}`)}
                        className="px-2.5 py-1 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] rounded-xs font-semibold text-[11px] transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
