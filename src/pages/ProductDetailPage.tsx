import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ShoppingBag, MessageCircle, Share2, ShieldCheck } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { formatGHS, buildWhatsAppProductInquiryUrl } from '../lib/formatters';
import { HandbagVisual } from '../components/HandbagVisual';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../lib/api';
import { usePreview } from '../context/PreviewContext';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onGoToOrder: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onGoToOrder,
}) => {
  const { addItem } = useCart();
  const { isPreviewMode } = usePreview();

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: 'default',
      product_id: product.id,
      name: 'Standard',
      color_name: 'Standard',
      stock_quantity: 1,
      is_available: true,
    }
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Update dynamic page title
  useEffect(() => {
    document.title = `${product.name} | ESTCHAY LUX LADY’S BAGS`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch related items in same category
    async function loadRelated() {
      try {
        const all = await fetchProducts({
          category: product.category?.slug,
          includeDemo: isPreviewMode,
        });
        setRelatedProducts(all.filter((p) => p.id !== product.id).slice(0, 3));
      } catch {}
    }
    loadRelated();
  }, [product, isPreviewMode]);

  const currentPricePesewas = selectedVariant.price_pesewas ?? product.base_price_pesewas;
  const isAvailable = selectedVariant.is_available && selectedVariant.stock_quantity > 0;

  const handleAddToOrder = () => {
    addItem(product.id, selectedVariant.id, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const whatsappInquiryUrl = buildWhatsAppProductInquiryUrl(
    product.name,
    selectedVariant.name !== 'Standard' ? selectedVariant.name : undefined,
    currentPricePesewas,
    '233548003400'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold uppercase tracking-wider text-[#241C19]/70 hover:text-[#6D2638] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </button>

        <button
          onClick={handleShare}
          className="text-xs text-[#241C19]/60 hover:text-[#241C19] flex items-center gap-1 px-2.5 py-1 rounded-xs border border-[#D8CBBE]/60 hover:bg-[#FFFEFC]"
          title="Share product link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Main Contiguous Purchase Module (Split Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Handbag Image Gallery (Contain Style) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm p-4 sm:p-8 shadow-sm">
            <HandbagVisual
              slug={product.slug}
              name={product.name}
              imageUrl={product.images[0]?.image_url}
              selectedColorHex={selectedVariant.color_hex}
              className="w-full h-80 sm:h-[460px]"
            />
          </div>

          {/* Visual Note */}
          <div className="p-3 bg-[#F8F5EF] border border-[#D8CBBE]/40 rounded-xs flex items-center gap-2 text-xs text-[#241C19]/70">
            <ShieldCheck className="w-4 h-4 text-[#B99A64] shrink-0" />
            <span>
              All bags are presented in full contain format to showcase genuine proportions, handles, and accessories.
            </span>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Specification Module */}
        <div className="lg:col-span-5 bg-[#FFFEFC] border border-[#D8CBBE] p-6 sm:p-8 rounded-sm shadow-xs space-y-6 lg:sticky lg:top-28">
          {/* Header & Category */}
          <div className="space-y-1.5 pb-4 border-b border-[#D8CBBE]/50">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B99A64] font-semibold">
              <span>{product.category?.name || 'Handbag'}</span>
              {product.is_demo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#6D2638]">Preview Fixture</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19] leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Price & Availability Baseline */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#241C19]/50 block">Price</span>
              <span className="font-sans text-2xl sm:text-3xl font-bold text-[#241C19] tabular-nums">
                {formatGHS(currentPricePesewas)}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-xs inline-block ${
                  isAvailable
                    ? 'bg-[#2D5A43]/10 text-[#2D5A43]'
                    : 'bg-[#6D2638]/10 text-[#6D2638]'
                }`}
              >
                {isAvailable ? 'In Stock (Ready for Dispatch)' : 'Awaiting Stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-[#241C19]/80 leading-relaxed space-y-2">
            <p>{product.description}</p>
          </div>

          {/* Confirmed Specifications Only (Strict Compliance) */}
          <div className="py-3 px-4 bg-[#F8F5EF] border border-[#D8CBBE]/60 rounded-xs space-y-2 text-xs">
            <span className="font-semibold text-[#241C19] block uppercase tracking-wider text-[11px]">
              Confirmed Specifications
            </span>
            <div className="grid grid-cols-2 gap-2 text-[#241C19]/75">
              <div>
                <span className="text-[#241C19]/50 block">Dimensions:</span>
                <span>{product.dimensions || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-[#241C19]/50 block">Material:</span>
                <span>{product.material || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Available Colour Variants (if multiple) */}
          {product.variants.length > 1 && (
            <div className="space-y-2.5 pt-2">
              <label className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Select Colour: <span className="text-[#6D2638] font-bold">{selectedVariant.name}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-2 text-xs font-medium rounded-xs border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#241C19] bg-[#241C19] text-[#F8F5EF] shadow-xs'
                          : 'border-[#D8CBBE] bg-[#FFFEFC] text-[#241C19] hover:border-[#241C19]/60'
                      }`}
                    >
                      {v.color_hex && (
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: v.color_hex }}
                        />
                      )}
                      <span>{v.color_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs uppercase tracking-wider text-[#241C19]/70 font-semibold block">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D8CBBE] rounded-xs bg-[#FFFEFC]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm text-[#241C19] hover:bg-[#F8F5EF] transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold tabular-nums text-[#241C19]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.min(selectedVariant.stock_quantity || 10, quantity + 1)
                    )
                  }
                  className="px-3 py-1.5 text-sm text-[#241C19] hover:bg-[#F8F5EF] transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-[#241C19]/50">
                ({selectedVariant.stock_quantity} available in stock)
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#D8CBBE]/50">
            {/* 1. Add to Order Selection */}
            <button
              onClick={handleAddToOrder}
              disabled={!isAvailable}
              className={`w-full py-3.5 px-6 rounded-xs text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs ${
                isAvailable
                  ? 'bg-[#241C19] text-[#F8F5EF] hover:bg-[#6D2638]'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Order Selection</span>
            </button>

            {/* Added Feedback */}
            {addedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Added {quantity} {product.name} to order
                </span>
                <button
                  onClick={onGoToOrder}
                  className="underline font-bold hover:text-emerald-950"
                >
                  Review Order →
                </button>
              </div>
            )}

            {/* 2. Direct Order / Enquiry via WhatsApp */}
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order via WhatsApp Directly</span>
            </a>
          </div>

          {/* Order Terms Guarantee Notice */}
          <p className="text-[11px] text-[#241C19]/60 leading-relaxed text-center">
            No upfront card payment required online. Submitting an order records your request, then you continue on WhatsApp with our team to confirm availability, delivery fee, and payment.
          </p>
        </div>
      </div>

      {/* Related Handbags Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#D8CBBE]/60 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#241C19]">
            You May Also Admire
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <article
                key={rel.id}
                onClick={() => onSelectProduct(rel)}
                className="group cursor-pointer bg-[#FFFEFC] border border-[#D8CBBE]/60 p-4 rounded-sm hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <HandbagVisual
                  slug={rel.slug}
                  name={rel.name}
                  className="w-full h-48 mb-3"
                />
                <span className="text-[11px] uppercase tracking-wider text-[#B99A64] block">
                  {rel.category?.name || 'Handbag'}
                </span>
                <h3 className="font-serif text-base font-semibold text-[#241C19] group-hover:text-[#6D2638] transition-colors">
                  {rel.name}
                </h3>
                <span className="text-sm font-bold text-[#241C19] tabular-nums mt-1 block">
                  {formatGHS(rel.base_price_pesewas)}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
