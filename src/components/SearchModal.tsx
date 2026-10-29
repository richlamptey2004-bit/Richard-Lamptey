import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fetchProducts } from '../lib/api';
import { formatGHS } from '../lib/formatters';
import { usePreview } from '../context/PreviewContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isPreviewMode } = usePreview();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({
          search: query,
          includeDemo: isPreviewMode,
        });
        setResults(data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isPreviewMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4 sm:px-6">
      <div className="bg-[#FFFEFC] w-full max-w-2xl rounded-sm shadow-2xl border border-[#D8CBBE] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-[#D8CBBE]/60 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#241C19]/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search handbags, totes, sets or colours..."
            className="w-full bg-transparent text-base text-[#241C19] placeholder:text-[#241C19]/40 focus:outline-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onViewAllResults(query);
                onClose();
              }
              if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
          <button
            onClick={onClose}
            className="p-1 text-[#241C19]/50 hover:text-[#241C19] rounded-sm transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-xs text-[#241C19]/60">
              Searching boutique collection...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-[#D8CBBE]/30">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="py-3 px-2 flex items-center justify-between hover:bg-[#F8F5EF] cursor-pointer transition-colors rounded-xs group"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-[11px] uppercase tracking-wider text-[#B99A64] block">
                      {product.category?.name || 'Handbag'}
                    </span>
                    <h4 className="font-serif font-medium text-sm text-[#241C19] group-hover:text-[#6D2638] transition-colors">
                      {product.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold tabular-nums text-[#241C19]">
                      {formatGHS(product.base_price_pesewas)}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-3 text-center">
                <button
                  onClick={() => {
                    onViewAllResults(query);
                    onClose();
                  }}
                  className="text-xs font-medium text-[#6D2638] hover:text-[#241C19] inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>View all results in catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-xs text-[#241C19]/60">
              No handbags found matching &ldquo;{query}&rdquo;. Try browsing all totes or handbag sets.
            </div>
          )}

          {!query.trim() && (
            <div className="py-4 text-xs text-[#241C19]/60">
              <span className="font-medium text-[#241C19] block mb-2">Suggested categories:</span>
              <div className="flex flex-wrap gap-2">
                {['Tote Bags', 'Handbag Sets', 'Cognac', 'Lavender', 'Burgundy'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-2.5 py-1 bg-[#F8F5EF] hover:bg-[#D8CBBE]/40 text-[#241C19] rounded-sm transition-colors text-xs"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
