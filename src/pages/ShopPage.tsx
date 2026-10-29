import React, { useState, useEffect } from 'react';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product, Category } from '../types';
import { fetchProducts, fetchCategories } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { formatGHS } from '../lib/formatters';
import { usePreview } from '../context/PreviewContext';

interface ShopPageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  initialQuery?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ navigate, onSelectProduct, initialQuery }) => {
  const { isPreviewMode } = usePreview();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [minPriceGHS, setMinPriceGHS] = useState<number | ''>('');
  const [maxPriceGHS, setMaxPriceGHS] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Parse URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const search = params.get('search');
    const color = params.get('color');
    const minP = params.get('minPrice');
    const maxP = params.get('maxPrice');
    const sort = params.get('sort');
    const inStock = params.get('inStock');

    if (cat) setSelectedCategory(cat);
    if (search) setSearchQuery(search);
    if (color) setSelectedColor(color);
    if (minP) setMinPriceGHS(Number(minP));
    if (maxP) setMaxPriceGHS(Number(maxP));
    if (sort && ['newest', 'price-asc', 'price-desc'].includes(sort)) {
      setSortBy(sort as any);
    }
    if (inStock === 'true') setInStockOnly(true);
  }, []);

  // Sync state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedColor !== 'all') params.set('color', selectedColor);
    if (minPriceGHS !== '') params.set('minPrice', minPriceGHS.toString());
    if (maxPriceGHS !== '') params.set('maxPrice', maxPriceGHS.toString());
    if (inStockOnly) params.set('inStock', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedCategory, searchQuery, selectedColor, minPriceGHS, maxPriceGHS, inStockOnly, sortBy]);

  // Load Categories & Filtered Products
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts({
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: searchQuery.trim() || undefined,
            color: selectedColor === 'all' ? undefined : selectedColor,
            minPricePesewas: minPriceGHS !== '' ? minPriceGHS * 100 : undefined,
            maxPricePesewas: maxPriceGHS !== '' ? maxPriceGHS * 100 : undefined,
            inStockOnly: inStockOnly || undefined,
            sortBy,
            includeDemo: isPreviewMode,
          }),
        ]);

        if (isMounted) {
          setCategories(cats);
          setProducts(prods);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Unable to load products');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, selectedColor, minPriceGHS, maxPriceGHS, inStockOnly, sortBy, isPreviewMode]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedColor('all');
    setMinPriceGHS('');
    setMaxPriceGHS('');
    setInStockOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedColor !== 'all' ||
    minPriceGHS !== '' ||
    maxPriceGHS !== '' ||
    inStockOnly;

  const colorOptions = [
    { label: 'All Colours', value: 'all' },
    { label: 'Black', value: 'Black' },
    { label: 'Cognac / Brown', value: 'Cognac' },
    { label: 'Burgundy / Wine', value: 'Burgundy' },
    { label: 'Tan', value: 'Tan' },
    { label: 'Taupe', value: 'Taupe' },
    { label: 'Beige', value: 'Beige' },
    { label: 'Green', value: 'Green' },
    { label: 'Blue', value: 'Blue' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="border-b border-[#D8CBBE]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B99A64] font-semibold block mb-1">
            ESTCHAY Boutique Catalogue
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241C19]">
            The Handbag Collection
          </h1>
          <p className="text-sm text-[#241C19]/70 mt-1 max-w-xl">
            Totes, structured bags, and coordinated sets. All priced in Ghanaian Cedis (GH₵).
          </p>
        </div>

        {/* Total counts & active filters badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#241C19]/70 tabular-nums">
            Showing {products.length} {products.length === 1 ? 'handbag' : 'handbags'}
          </span>
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden px-3 py-2 bg-[#FFFEFC] border border-[#D8CBBE] text-xs font-semibold rounded-xs flex items-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Filters Sidebar + Right Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-[#FFFEFC] border border-[#D8CBBE]/60 p-5 rounded-sm sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8CBBE]/40">
            <span className="font-serif text-base font-semibold text-[#241C19] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#B99A64]" />
              Filter Catalogue
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#6D2638] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search Field */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#241C19]/60 font-semibold block">
              Search By Name
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Tote, Lavender, Cognac..."
              className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#241C19]/60 font-semibold block">
              Category
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2 py-1.5 rounded-xs transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-[#241C19] text-[#F8F5EF] font-semibold'
                    : 'text-[#241C19]/80 hover:bg-[#F8F5EF]'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-2 py-1.5 rounded-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-[#241C19] text-[#F8F5EF] font-semibold'
                      : 'text-[#241C19]/80 hover:bg-[#F8F5EF]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Colour Filter */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[#241C19]/60 font-semibold block">
              Colour Accent
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
            >
              {colorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range (in GH₵) */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#241C19]/60 font-semibold block">
              Price Range (GH₵)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min GH₵"
                value={minPriceGHS}
                onChange={(e) =>
                  setMinPriceGHS(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                }
                className="w-full text-xs px-2.5 py-1.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
              <input
                type="number"
                min="0"
                placeholder="Max GH₵"
                value={maxPriceGHS}
                onChange={(e) =>
                  setMaxPriceGHS(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                }
                className="w-full text-xs px-2.5 py-1.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden focus:border-[#241C19]"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#241C19]/80">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#241C19] rounded-xs"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Right Products Container */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and Active Filter Pills */}
          <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-3 sm:p-4 rounded-sm flex flex-wrap items-center justify-between gap-4">
            {/* Active Filters Display */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#241C19]/50 font-medium">Applied:</span>
              {selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs flex items-center gap-1">
                  Cat: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3 text-[#241C19]/60" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="px-2 py-0.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs flex items-center gap-1">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3 text-[#241C19]/60" />
                  </button>
                </span>
              )}
              {selectedColor !== 'all' && (
                <span className="px-2 py-0.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs flex items-center gap-1">
                  Color: {selectedColor}
                  <button onClick={() => setSelectedColor('all')}>
                    <X className="w-3 h-3 text-[#241C19]/60" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="px-2 py-0.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs flex items-center gap-1">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="w-3 h-3 text-[#241C19]/60" />
                  </button>
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-[#241C19]/40 italic">None (Displaying all)</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#241C19]/50" />
              <label htmlFor="sort-select" className="text-[#241C19]/60">Sort:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F8F5EF] border border-[#D8CBBE] text-xs px-2.5 py-1 rounded-xs focus:outline-hidden"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-stone-100 rounded-sm animate-pulse" />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-8 bg-red-50 border border-red-200 text-red-800 rounded-sm text-center space-y-3">
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-red-800 text-white text-xs rounded-xs font-medium"
              >
                Reset Catalogue Filters
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="bg-[#FFFEFC] border border-[#D8CBBE]/60 p-12 text-center rounded-sm space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#241C19]">
                No handbags match your current filters
              </h3>
              <p className="text-xs text-[#241C19]/70 max-w-md mx-auto">
                Try widening your price range, clearing search terms, or exploring other categories.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#241C19] text-[#F8F5EF] text-xs font-semibold rounded-xs hover:bg-[#6D2638] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
