import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product, Category, StoreSettings } from '../types';
import { fetchProducts, fetchCategories, fetchStoreSettings } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { HandbagVisual } from '../components/HandbagVisual';
import { usePreview } from '../context/PreviewContext';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onSelectProduct }) => {
  const { isPreviewMode } = usePreview();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        const [cats, products, storeSettings] = await Promise.all([
          fetchCategories(),
          fetchProducts({ includeDemo: isPreviewMode }),
          fetchStoreSettings(),
        ]);

        if (isMounted) {
          setCategories(cats);
          setFeaturedProducts(products.filter((p) => p.is_featured).slice(0, 4));
          setNewArrivals(products.filter((p) => p.is_new).slice(0, 4));
          setSettings(storeSettings);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, [isPreviewMode]);

  const hero = settings?.hero_content || {
    eyebrow: 'EVERYDAY STYLE. DISTINCTIVE DETAILS.',
    heading: 'Carry Your Confidence.',
    supporting_text:
      'Discover handbags, totes and matching sets for workdays, weekends and special occasions.',
    primary_cta_label: 'Shop the Collection',
    secondary_cta_label: 'About ESTCHAY',
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION (Split Editorial Layout) */}
      <section className="relative overflow-hidden bg-[#F8F5EF] pt-8 sm:pt-14 pb-12 border-b border-[#D8CBBE]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow */}
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B99A64]">
                {hero.eyebrow}
              </div>

              {/* Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#241C19] text-balance leading-[1.1]">
                {hero.heading}
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#241C19]/80 max-w-xl font-normal leading-relaxed">
                {hero.supporting_text}
              </p>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/shop')}
                  className="px-6 py-3.5 bg-[#241C19] text-[#F8F5EF] text-sm font-medium hover:bg-[#6D2638] transition-colors rounded-xs shadow-xs inline-flex items-center gap-2 group whitespace-nowrap shrink-0"
                >
                  <span>{hero.primary_cta_label}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate('/about')}
                  className="px-6 py-3.5 bg-transparent border border-[#241C19]/30 text-[#241C19] text-sm font-medium hover:bg-[#FFFEFC] hover:border-[#241C19] transition-colors rounded-xs whitespace-nowrap shrink-0"
                >
                  {hero.secondary_cta_label}
                </button>
              </div>

              {/* Subtle Trust Indicators */}
              <div className="pt-6 border-t border-[#D8CBBE]/40 flex flex-wrap items-center gap-6 text-xs text-[#241C19]/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B99A64]" />
                  <span>Ghana Nationwide Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B99A64]" />
                  <span>Personal WhatsApp Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B99A64]" />
                  <span>Priced in Ghanaian Cedis (GH₵)</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column (Editorial Handbag Showcase) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-sm overflow-hidden bg-[#FFFEFC] border border-[#D8CBBE] shadow-xl p-4 sm:p-6">
                <HandbagVisual
                  slug="classic-tote-collection"
                  name="ESTCHAY Signature Collection"
                  className="w-full h-80 sm:h-96"
                />
                <div className="mt-4 pt-4 border-t border-[#D8CBBE]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#B99A64] block font-medium">
                      Featured In Signature Green
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-[#241C19]">
                      Classic Tote Collection
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate('/shop?category=tote-bags')}
                    className="text-xs font-semibold text-[#6D2638] hover:underline flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block mb-1">
              Curated Selection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19]">
              Explore by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs sm:text-sm font-semibold text-[#6D2638] hover:text-[#241C19] transition-colors flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.slug}`)}
              className="cursor-pointer bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 rounded-sm hover:-translate-y-1 hover:shadow-md hover:border-[#B99A64] transition-all group"
            >
              <div className="w-12 h-12 rounded-sm bg-[#F8F5EF] flex items-center justify-center text-[#B99A64] group-hover:bg-[#241C19] group-hover:text-[#FFFEFC] transition-colors mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#241C19] group-hover:text-[#6D2638] transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-[#241C19]/70 mt-2 line-clamp-2 leading-relaxed">
                {cat.description || `Browse our complete range of ${cat.name.toLowerCase()}.`}
              </p>
              <div className="mt-4 pt-3 border-t border-[#D8CBBE]/30 flex items-center justify-between text-xs font-medium text-[#B99A64] group-hover:text-[#6D2638]">
                <span>Discover</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED HANDBAGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block mb-1">
              Handpicked Pieces
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19]">
              Featured Collection
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs sm:text-sm font-semibold text-[#6D2638] hover:text-[#241C19] transition-colors flex items-center gap-1"
          >
            <span>View Full Shop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-stone-100 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. BRAND INTRODUCTION (Draft Copy) */}
      <section className="bg-[#FFFEFC] border-y border-[#D8CBBE]/60 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block">
            The ESTCHAY Standard
          </span>
          <blockquote className="font-serif text-xl sm:text-2xl text-[#241C19] leading-relaxed italic">
            &ldquo;Find a bag that fits your day. ESTCHAY LUX LADY’S BAGS brings together practical totes, distinctive handbags and coordinated sets, with clear product information and convenient WhatsApp ordering.&rdquo;
          </blockquote>
          <p className="text-xs text-[#241C19]/60 uppercase tracking-wider">
            Verified Handbag Boutique · Accra & Nationwide Ghana
          </p>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block mb-1">
                Latest Additions
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19]">
                New Arrivals
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?sort=newest')}
              className="text-xs sm:text-sm font-semibold text-[#6D2638] hover:text-[#241C19] transition-colors flex items-center gap-1"
            >
              <span>Explore Latest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. THREE CLEAR STEPS: HOW WHATSAPP ORDERING WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block mb-1">
            Simple & Transparent
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241C19]">
            How Ordering Works
          </h2>
          <p className="text-sm text-[#241C19]/70 mt-2">
            No forced account creation. Select your items online, review your details, and confirm easily on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 sm:p-8 rounded-sm relative">
            <span className="font-serif text-3xl font-bold text-[#B99A64]/40 absolute top-4 right-6">
              01
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#241C19] mb-2">
              Select Your Pieces
            </h3>
            <p className="text-xs text-[#241C19]/70 leading-relaxed">
              Explore our boutique catalogue of handbags, totes and multi-piece sets. Select your preferred colour variants and add them to your order selection.
            </p>
          </div>

          <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 sm:p-8 rounded-sm relative">
            <span className="font-serif text-3xl font-bold text-[#B99A64]/40 absolute top-4 right-6">
              02
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#241C19] mb-2">
              Submit Request Details
            </h3>
            <p className="text-xs text-[#241C19]/70 leading-relaxed">
              Enter your name, phone number, and delivery region or town. Your request is safely recorded with a unique official order reference code.
            </p>
          </div>

          <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-6 sm:p-8 rounded-sm relative">
            <span className="font-serif text-3xl font-bold text-[#B99A64]/40 absolute top-4 right-6">
              03
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#241C19] mb-2">
              Confirm via WhatsApp
            </h3>
            <p className="text-xs text-[#241C19]/70 leading-relaxed">
              Click &lsquo;Continue to WhatsApp&rsquo; to launch WhatsApp with your pre-formatted order summary. We confirm availability, delivery fee, and payment arrangements directly.
            </p>
          </div>
        </div>
      </section>

      {/* 7. WHATSAPP CONTACT CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#241C19] text-[#F8F5EF] p-8 sm:p-12 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block">
              Have Questions Before Ordering?
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFEFC]">
              Chat Directly With Us on WhatsApp
            </h3>
            <p className="text-sm text-[#D8CBBE] max-w-xl">
              We are pleased to answer enquiries regarding handbag sizes, colour variants, delivery routes across Ghana, and special order requests.
            </p>
          </div>

          <a
            href="https://wa.me/233548003400?text=Hello%20ESTCHAY%20LUX%20LADY%E2%80%99S%20BAGS%2C%20I%20would%20like%20to%20enquire%20about%20your%20handbags."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-semibold rounded-xs shadow-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat on WhatsApp (0548003400)</span>
          </a>
        </div>
      </section>
    </div>
  );
};
