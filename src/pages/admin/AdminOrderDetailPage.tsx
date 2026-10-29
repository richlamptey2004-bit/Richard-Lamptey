import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Phone, CheckCircle, AlertCircle, Clock, Truck, ShieldAlert } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { fetchAdminOrders, updateOrderStatus } from '../../lib/api';
import { formatGHS, buildWhatsAppOrderUrl } from '../../lib/formatters';

interface AdminOrderDetailPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const AdminOrderDetailPage: React.FC<AdminOrderDetailPageProps> = ({
  orderId,
  navigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchAdminOrders();
        const found = all.find((o) => o.id === orderId);
        if (found) setOrder(found);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setNotice(null);
    setTransitioning(true);

    try {
      const res = await updateOrderStatus(order.id, newStatus);
      if (res.success) {
        setOrder({
          ...order,
          status: newStatus,
          inventory_deducted:
            newStatus === 'confirmed' ? true : order.inventory_deducted,
          inventory_restored:
            newStatus === 'cancelled' && order.inventory_deducted
              ? true
              : order.inventory_restored,
        });
        setNotice({
          type: 'success',
          text: `Order status updated to "${newStatus.replace('_', ' ')}". Inventory rules verified.`,
        });
      } else {
        setNotice({
          type: 'error',
          text: res.error || 'Failed to update order status.',
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.message || 'Status transition error occurred.',
      });
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-[#241C19]/60">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-xs text-[#241C19]/60 space-y-3">
        <p>Order not found.</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="text-xs text-[#6D2638] underline"
        >
          Return to orders list
        </button>
      </div>
    );
  }

  const whatsappCustomerUrl = buildWhatsAppOrderUrl(
    order,
    order.items || [],
    order.customer_phone
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8CBBE]/50">
        <button
          onClick={() => navigate('/admin/orders')}
          className="text-xs font-semibold uppercase tracking-wider text-[#241C19]/70 hover:text-[#6D2638] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#241C19]/50">Status:</span>
          <span
            className={`px-2.5 py-1 rounded-xs font-semibold uppercase text-xs tracking-wider ${
              order.status === 'confirmed'
                ? 'bg-emerald-100 text-emerald-800'
                : order.status === 'pending_confirmation'
                ? 'bg-amber-100 text-amber-800'
                : order.status === 'dispatched'
                ? 'bg-blue-100 text-blue-800'
                : order.status === 'delivered'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 text-xs rounded-xs flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Main Grid: Order Details & Customer Contact */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Items & Customer Details */}
        <div className="md:col-span-8 space-y-6">
          {/* Customer Information Card */}
          <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm shadow-xs space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#241C19]">
              Customer & Destination Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#241C19]/50 block">Customer Name:</span>
                <span className="font-semibold text-sm">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-[#241C19]/50 block">Phone Contact:</span>
                <span className="font-mono font-semibold">{order.customer_phone}</span>
                {order.customer_alt_phone && (
                  <span className="block text-[11px] text-[#241C19]/60 font-mono">
                    Alt: {order.customer_alt_phone}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#241C19]/50 block">Region & City:</span>
                <span className="font-medium">{order.city}, {order.region}</span>
              </div>
              <div>
                <span className="text-[#241C19]/50 block">Order Reference:</span>
                <span className="font-mono font-bold text-[#6D2638]">{order.order_reference}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8CBBE]/30 text-xs">
              <span className="text-[#241C19]/50 block">Delivery Address / Landmark:</span>
              <p className="font-medium mt-0.5">{order.delivery_address}</p>
              {order.delivery_notes && (
                <p className="text-[11px] text-[#241C19]/70 italic mt-1">
                  Note: {order.delivery_notes}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={whatsappCustomerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>

              <a
                href={`tel:${order.customer_phone}`}
                className="px-3 py-1.5 bg-[#F8F5EF] hover:bg-[#EFEAE2] border border-[#D8CBBE] text-[#241C19] text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
            </div>
          </div>

          {/* Ordered Line Items Snapshot */}
          <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm shadow-xs space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#241C19]">
              Ordered Handbags (Trusted DB Snapshot)
            </h2>

            <div className="divide-y divide-[#D8CBBE]/30 text-xs">
              {order.items?.map((it) => (
                <div key={it.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-[#241C19] block">
                      {it.product_name_snapshot}
                    </span>
                    <span className="text-[#241C19]/60">
                      Option: {it.variant_name_snapshot} · Unit Price: {formatGHS(it.unit_price_pesewas_snapshot)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#241C19]/60 block">Qty: {it.quantity}</span>
                    <span className="font-bold tabular-nums text-sm">
                      {formatGHS(it.total_pesewas_snapshot)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#D8CBBE]/60 flex items-baseline justify-between text-sm font-bold text-[#241C19]">
              <span>Merchandise Subtotal:</span>
              <span className="text-lg tabular-nums">{formatGHS(order.total_pesewas)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Status Lifecycle & Inventory Control */}
        <div className="md:col-span-4 bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm shadow-xs space-y-5">
          <h2 className="font-serif text-base font-semibold text-[#241C19]">
            Order Lifecycle Management
          </h2>

          {/* Status Progression Controls */}
          <div className="space-y-2 text-xs">
            {order.status === 'pending_confirmation' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={transitioning}
                  className="w-full py-2.5 px-3 bg-[#2D5A43] hover:bg-[#234835] text-white font-semibold rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Order & Deduct Stock</span>
                </button>
                <p className="text-[10px] text-[#241C19]/60 leading-tight">
                  * Atomically checks available inventory and locks stock for these items.
                </p>
              </div>
            )}

            {order.status === 'confirmed' && (
              <button
                onClick={() => handleStatusChange('processing')}
                disabled={transitioning}
                className="w-full py-2.5 px-3 bg-[#241C19] hover:bg-[#3D322E] text-white font-semibold rounded-xs transition-colors"
              >
                Mark as Processing
              </button>
            )}

            {order.status === 'processing' && (
              <button
                onClick={() => handleStatusChange('dispatched')}
                disabled={transitioning}
                className="w-full py-2.5 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Mark as Dispatched (With Rider/Courier)</span>
              </button>
            )}

            {order.status === 'dispatched' && (
              <button
                onClick={() => handleStatusChange('delivered')}
                disabled={transitioning}
                className="w-full py-2.5 px-3 bg-[#6D2638] hover:bg-[#521927] text-white font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Successfully Delivered</span>
              </button>
            )}

            {/* Cancellation Option (Pre-dispatch) */}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <div className="pt-3 border-t border-[#D8CBBE]/40">
                <button
                  onClick={() => {
                    if (confirm('Cancel this order? If stock was deducted, it will be restored once.')) {
                      handleStatusChange('cancelled');
                    }
                  }}
                  disabled={transitioning}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold rounded-xs transition-colors"
                >
                  Cancel Order
                </button>
                {order.status === 'dispatched' && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    Notice: Order is already dispatched. Handled as courier recall.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Audit Trail Information */}
          <div className="pt-3 border-t border-[#D8CBBE]/40 space-y-1 text-[11px] text-[#241C19]/60">
            <span className="font-semibold block text-[#241C19]">Audit Status:</span>
            <div>Inventory Deducted: {order.inventory_deducted ? 'Yes' : 'No'}</div>
            <div>Inventory Restored: {order.inventory_restored ? 'Yes' : 'No'}</div>
            <div>Order Created: {new Date(order.created_at).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
