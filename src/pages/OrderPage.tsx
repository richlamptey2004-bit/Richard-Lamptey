import React, { useState, useEffect, useId } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, MessageCircle, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, Order, OrderItem, CustomerOrderForm } from '../types';
import { fetchProducts, submitOrderRequest } from '../lib/api';
import { formatGHS, buildWhatsAppOrderUrl } from '../lib/formatters';
import { HandbagVisual } from '../components/HandbagVisual';
import { usePreview } from '../context/PreviewContext';

interface OrderPageProps {
  navigate: (path: string) => void;
}

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'Savannah',
  'North East',
  'Western North',
];

export const OrderPage: React.FC<OrderPageProps> = ({ navigate }) => {
  const { items: cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { isPreviewMode } = usePreview();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Customer Form state (strictly kept in component state, never persisted to localStorage)
  const [customer, setCustomer] = useState<CustomerOrderForm>({
    fullName: '',
    phone: '',
    altPhone: '',
    region: 'Greater Accra',
    city: '',
    deliveryAddress: '',
    deliveryNotes: '',
    idempotencyKey: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [priceDiscrepancyNotice, setPriceDiscrepancyNotice] = useState<{
    revisedTotal: number;
  } | null>(null);

  // Saved Order State
  const [savedOrder, setSavedOrder] = useState<{
    order: Order;
    items: OrderItem[];
  } | null>(null);

  // Load product definitions matching cart items
  useEffect(() => {
    let isMounted = true;
    async function loadCatalogue() {
      try {
        const prods = await fetchProducts({ includeDemo: isPreviewMode });
        if (isMounted) setProducts(prods);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }
    loadCatalogue();
    return () => {
      isMounted = false;
    };
  }, [isPreviewMode]);

  // Generate unique idempotency key when form loads
  useEffect(() => {
    if (!customer.idempotencyKey) {
      setCustomer((prev) => ({
        ...prev,
        idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }));
    }
  }, []);

  // Compute enriched line items
  const enrichedCartItems = cartItems
    .map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      if (!prod || !variant) return null;
      const unitPrice = variant.price_pesewas ?? prod.base_price_pesewas;
      return {
        ...item,
        product: prod,
        variant,
        unitPricePesewas: unitPrice,
        subtotalPesewas: unitPrice * item.quantity,
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    variantId: string;
    quantity: number;
    product: Product;
    variant: any;
    unitPricePesewas: number;
    subtotalPesewas: number;
  }>;

  const estimatedTotalPesewas = enrichedCartItems.reduce(
    (sum, item) => sum + item.subtotalPesewas,
    0
  );

  const handleSubmitOrder = async (e: React.FormEvent, forceRevisedTotal?: number) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customer.fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!customer.phone.trim() || customer.phone.replace(/[^0-9]/g, '').length < 9) {
      setErrorMessage('Please enter a valid Ghana phone number (e.g. 0548003400).');
      return;
    }
    if (!customer.city.trim()) {
      setErrorMessage('Please enter your city or town.');
      return;
    }
    if (!customer.deliveryAddress.trim()) {
      setErrorMessage('Please specify your delivery address or prominent landmark.');
      return;
    }
    if (enrichedCartItems.length === 0) {
      setErrorMessage('Your order selection is empty. Please add a handbag first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitOrderRequest(
        customer,
        cartItems,
        forceRevisedTotal ?? estimatedTotalPesewas,
        isPreviewMode
      );

      if (response.priceDiscrepancy && response.revisedTotalPesewas) {
        setPriceDiscrepancyNotice({ revisedTotal: response.revisedTotalPesewas });
        setIsSubmitting(false);
        return;
      }

      if (response.success && response.order && response.items) {
        setSavedOrder({
          order: response.order,
          items: response.items,
        });
        clearCart();
      } else {
        setErrorMessage(
          response.error || 'Unable to record order request. Your details have been preserved. Please retry.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'An unexpected network error occurred while submitting your order request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE WITH VERIFIED WHATSAPP HANDOFF
  if (savedOrder) {
    const whatsappUrl = buildWhatsAppOrderUrl(
      savedOrder.order,
      savedOrder.items,
      '233548003400'
    );

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm p-6 sm:p-10 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-[#2D5A43]/10 text-[#2D5A43] rounded-full mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#B99A64] font-bold block">
              Order Request Recorded
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19]">
              Your Request Has Been Saved
            </h1>
            <p className="text-sm text-[#241C19]/70 max-w-lg mx-auto">
              Your official order reference is <strong className="text-[#241C19] font-mono">{savedOrder.order.order_reference}</strong>.
            </p>
          </div>

          {/* Mandatory WhatsApp Step Banner */}
          <div className="bg-[#F8F5EF] border border-[#D8CBBE] p-5 rounded-sm text-left space-y-3">
            <h4 className="font-serif font-semibold text-sm text-[#241C19] flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              Final Step: Continue to WhatsApp
            </h4>
            <p className="text-xs text-[#241C19]/80 leading-relaxed">
              &ldquo;Your order request has been saved. Open WhatsApp and send the prepared message to continue. Availability, delivery charges and payment are subject to confirmation.&rdquo;
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-semibold rounded-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Continue to WhatsApp (Send Order Request)</span>
              </a>
            </div>
          </div>

          {/* Summary of Saved Order */}
          <div className="text-left border-t border-[#D8CBBE]/50 pt-5 space-y-3 text-xs text-[#241C19]/80">
            <div className="flex justify-between font-semibold text-sm text-[#241C19] pb-2 border-b border-[#D8CBBE]/30">
              <span>Customer Summary:</span>
              <span>{savedOrder.order.customer_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[#241C19]/50 block">Phone:</span>
                <span>{savedOrder.order.customer_phone}</span>
              </div>
              <div>
                <span className="text-[#241C19]/50 block">Destination:</span>
                <span>{savedOrder.order.city}, {savedOrder.order.region}</span>
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <span className="text-[#241C19]/50 block">Items Selected:</span>
              {savedOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between py-1 border-b border-[#D8CBBE]/20">
                  <span>
                    {it.quantity}× {it.product_name_snapshot} ({it.variant_name_snapshot})
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatGHS(it.total_pesewas_snapshot)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2 text-sm font-bold text-[#241C19]">
              <span>Merchandise Subtotal:</span>
              <span className="tabular-nums">{formatGHS(savedOrder.order.total_pesewas)}</span>
            </div>
            <p className="text-[11px] text-[#241C19]/60 italic">
              Delivery fees will be confirmed on WhatsApp based on your exact delivery town.
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="text-xs text-[#6D2638] font-semibold hover:underline"
            >
              ← Return to Boutique Catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (cartItems.length === 0 && !loadingProducts) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-[#F8F5EF] border border-[#D8CBBE] rounded-full mx-auto flex items-center justify-center text-[#241C19]/40">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19]">
            Your Order Selection is Empty
          </h1>
          <p className="text-sm text-[#241C19]/70 max-w-md mx-auto">
            Discover our curated ladies’ handbags, practical totes, and matching sets before submitting your request.
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[#241C19] text-[#F8F5EF] text-xs font-semibold rounded-xs hover:bg-[#6D2638] transition-colors"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="border-b border-[#D8CBBE]/50 pb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold uppercase tracking-wider text-[#241C19]/70 hover:text-[#6D2638] flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-serif text-3xl font-bold text-[#241C19]">
            Order Selection & Delivery Details
          </h1>
        </div>
      </div>

      {/* Price Discrepancy Modal/Banner */}
      {priceDiscrepancyNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-sm space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-amber-900">
                Price Update Notice
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed mt-1">
                Catalogue prices for your selected items have updated. The revised merchandise total is{' '}
                <strong className="font-bold">{formatGHS(priceDiscrepancyNotice.revisedTotal)}</strong>.
                Please confirm to proceed with this updated total.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => setPriceDiscrepancyNotice(null)}
              className="px-3 py-1.5 text-xs text-amber-900 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={(e) => handleSubmitOrder(e, priceDiscrepancyNotice.revisedTotal)}
              className="px-4 py-1.5 bg-amber-900 text-white text-xs font-semibold rounded-xs"
            >
              Accept Revised Total ({formatGHS(priceDiscrepancyNotice.revisedTotal)})
            </button>
          </div>
        </div>
      )}

      {/* Main Split Grid: Left Items List + Right Customer Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Selected Items List */}
        <div className="lg:col-span-7 bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8CBBE]/40">
            <h2 className="font-serif text-lg font-semibold text-[#241C19]">
              Selected Items ({enrichedCartItems.length})
            </h2>
            <button
              onClick={clearCart}
              className="text-xs text-[#6D2638] hover:underline"
            >
              Clear selection
            </button>
          </div>

          <div className="divide-y divide-[#D8CBBE]/30">
            {enrichedCartItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="py-4 flex gap-4 items-start"
              >
                <div className="w-20 h-20 bg-[#F8F5EF] border border-[#D8CBBE]/40 rounded-xs overflow-hidden shrink-0">
                  <HandbagVisual
                    slug={item.product.slug}
                    name={item.product.name}
                    selectedColorHex={item.variant.color_hex}
                    className="w-full h-full p-1"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#B99A64] block font-medium">
                    {item.product.category?.name || 'Handbag'}
                  </span>
                  <h3 className="font-serif font-semibold text-sm text-[#241C19]">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-[#241C19]/60">
                    Option: <span className="font-medium text-[#241C19]">{item.variant.name}</span>
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#D8CBBE] rounded-xs bg-[#FFFEFC]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                        className="px-2 py-0.5 text-xs text-[#241C19] hover:bg-[#F8F5EF]"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-0.5 text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                        className="px-2 py-0.5 text-xs text-[#241C19] hover:bg-[#F8F5EF]"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold tabular-nums text-[#241C19]">
                        {formatGHS(item.subtotalPesewas)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-[#241C19]/40 hover:text-[#6D2638] transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal Display */}
          <div className="pt-4 border-t border-[#D8CBBE]/60 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[#241C19]/70">Merchandise Subtotal:</span>
              <span className="font-sans text-xl font-bold text-[#241C19] tabular-nums">
                {formatGHS(estimatedTotalPesewas)}
              </span>
            </div>
            <p className="text-xs text-[#241C19]/60 leading-relaxed">
              * Delivery charges and dispatch schedule will be agreed upon on WhatsApp based on your destination town.
            </p>
          </div>
        </div>

        {/* Right: Customer Delivery Form */}
        <div className="lg:col-span-5 bg-[#FFFEFC] border border-[#D8CBBE] p-6 sm:p-8 rounded-sm shadow-xs space-y-5 lg:sticky lg:top-28">
          <div className="pb-3 border-b border-[#D8CBBE]/50">
            <h2 className="font-serif text-lg font-semibold text-[#241C19]">
              Customer & Delivery Details
            </h2>
            <p className="text-xs text-[#241C19]/60 mt-1">
              No account required. Used strictly to assign your official order reference.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="customer-fullname" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Full Name <span className="text-[#6D2638]">*</span>
              </label>
              <input
                id="customer-fullname"
                type="text"
                required
                value={customer.fullName}
                onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                placeholder="e.g. Ama Mensah"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label htmlFor="customer-phone" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Phone Number (WhatsApp Active) <span className="text-[#6D2638]">*</span>
              </label>
              <input
                id="customer-phone"
                type="tel"
                required
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="e.g. 0548003400"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Alternative Phone */}
            <div className="space-y-1">
              <label htmlFor="customer-alt-phone" className="text-xs uppercase tracking-wider text-[#241C19]/70 font-semibold block">
                Alternative Contact Number (Optional)
              </label>
              <input
                id="customer-alt-phone"
                type="tel"
                value={customer.altPhone || ''}
                onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })}
                placeholder="e.g. 0244123456"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Region & Town */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="customer-region" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                  Region <span className="text-[#6D2638]">*</span>
                </label>
                <select
                  id="customer-region"
                  value={customer.region}
                  onChange={(e) => setCustomer({ ...customer, region: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
                >
                  {GHANA_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="customer-city" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                  City or Town <span className="text-[#6D2638]">*</span>
                </label>
                <input
                  id="customer-city"
                  type="text"
                  required
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  placeholder="e.g. East Legon / Kumasi"
                  className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1">
              <label htmlFor="customer-address" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Delivery Location / Prominent Landmark <span className="text-[#6D2638]">*</span>
              </label>
              <textarea
                id="customer-address"
                rows={2}
                required
                value={customer.deliveryAddress}
                onChange={(e) => setCustomer({ ...customer, deliveryAddress: e.target.value })}
                placeholder="Street name, landmark, or GPS digital address"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-1">
              <label htmlFor="customer-notes" className="text-xs uppercase tracking-wider text-[#241C19]/70 font-semibold block">
                Delivery Instructions (Optional)
              </label>
              <input
                id="customer-notes"
                type="text"
                value={customer.deliveryNotes || ''}
                onChange={(e) => setCustomer({ ...customer, deliveryNotes: e.target.value })}
                placeholder="e.g. Deliver afternoon, call upon arrival"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || enrichedCartItems.length === 0}
                className="w-full py-3.5 px-6 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-sm font-semibold rounded-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:bg-stone-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Recording Order Request...</span>
                ) : (
                  <span>Save Request & Proceed to WhatsApp</span>
                )}
              </button>
            </div>

            {/* Security and privacy reassurance */}
            <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-[#241C19]/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B99A64]" />
              <span>Idempotent submission · Zero online card data requested</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
