import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle,
  ShoppingBag,
  MessageSquare,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { fetchAdminOverview, fetchAdminOrders } from '../../lib/api';
import { Order } from '../../types';
import { formatGHS } from '../../lib/formatters';

interface AdminOverviewPageProps {
  navigate: (path: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState({
    orderCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
    dispatchedCount: 0,
    confirmedOrderValuePesewas: 0,
    pendingRequestValuePesewas: 0,
    productCount: 0,
    unreadMessageCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [overview, orders] = await Promise.all([
          fetchAdminOverview(),
          fetchAdminOrders(),
        ]);
        setStats(overview);
        setRecentOrders(orders.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#241C19]">
            Store Operations Overview
          </h1>
          <p className="text-xs text-[#241C19]/60">
            Real-time counts for ESTCHAY LUX LADY’S BAGS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-3.5 py-2 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Handbag</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Strictly distinguishing confirmed value from pending requests) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Confirmed Order Value (Legitimate sales) */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#241C19]/60 font-semibold uppercase tracking-wider">
            <span>Confirmed Orders Value</span>
            <CheckCircle className="w-4 h-4 text-[#2D5A43]" />
          </div>
          <div className="text-2xl font-bold font-sans text-[#241C19] tabular-nums pt-1">
            {formatGHS(stats.confirmedOrderValuePesewas)}
          </div>
          <p className="text-[11px] text-[#241C19]/60">
            Across {stats.confirmedCount} confirmed & fulfilled orders
          </p>
        </div>

        {/* 2. Pending Enquiries Subtotal */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#241C19]/60 font-semibold uppercase tracking-wider">
            <span>Pending Requests Value</span>
            <Clock className="w-4 h-4 text-[#B99A64]" />
          </div>
          <div className="text-2xl font-bold font-sans text-[#B99A64] tabular-nums pt-1">
            {formatGHS(stats.pendingRequestValuePesewas)}
          </div>
          <p className="text-[11px] text-[#241C19]/60">
            {stats.pendingCount} order requests awaiting WhatsApp confirmation
          </p>
        </div>

        {/* 3. Catalogue Products Count */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#241C19]/60 font-semibold uppercase tracking-wider">
            <span>Active Products</span>
            <ShoppingBag className="w-4 h-4 text-[#241C19]" />
          </div>
          <div className="text-2xl font-bold font-sans text-[#241C19] tabular-nums pt-1">
            {stats.productCount}
          </div>
          <p className="text-[11px] text-[#241C19]/60">
            Handbags, totes & multi-piece sets
          </p>
        </div>

        {/* 4. Unread Inquiries */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#241C19]/60 font-semibold uppercase tracking-wider">
            <span>Unread Messages</span>
            <MessageSquare className="w-4 h-4 text-[#6D2638]" />
          </div>
          <div className="text-2xl font-bold font-sans text-[#6D2638] tabular-nums pt-1">
            {stats.unreadMessageCount}
          </div>
          <p className="text-[11px] text-[#241C19]/60">
            Direct web contact form inquiries
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8CBBE]/40">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#241C19]">
              Recent Order Requests
            </h2>
            <p className="text-xs text-[#241C19]/60">
              Submitted via online boutique before WhatsApp confirmation
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-semibold text-[#6D2638] hover:underline flex items-center gap-1"
          >
            <span>View All ({stats.orderCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#241C19]/60">
            Loading recent requests...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#241C19]/60">
            No order requests recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] text-[#241C19]/70 uppercase tracking-wider font-semibold border-b border-[#D8CBBE]/60">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Merchandise Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8CBBE]/30">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F8F5EF]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#241C19]">
                      {ord.order_reference}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold block">{ord.customer_name}</span>
                      <span className="text-[#241C19]/60">{ord.customer_phone}</span>
                    </td>
                    <td className="py-3 px-3 text-[#241C19]/80">
                      {ord.city}, {ord.region}
                    </td>
                    <td className="py-3 px-3 font-semibold tabular-nums">
                      {formatGHS(ord.total_pesewas)}
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${ord.id}`)}
                        className="px-2.5 py-1 bg-[#241C19] text-[#F8F5EF] hover:bg-[#6D2638] rounded-xs font-semibold text-[11px] transition-colors"
                      >
                        Manage
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
