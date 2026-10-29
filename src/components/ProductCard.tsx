import React from 'react';
import { Product } from '../types';
import { formatGHS } from '../lib/formatters';
import { HandbagVisual } from './HandbagVisual';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickOrder?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const primaryVariant = product.variants[0];
  const hasMultipleVariants = product.variants.length > 1;
  const isAvailable = product.variants.some((v) => v.is_available && v.stock_quantity > 0);
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

  return (
    <article
      onClick={() => onSelect(product)}
      className="group cursor-pointer bg-[#FFFEFC] border border-[#D8CBBE]/60 rounded-sm overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#B99A64]/50"
    >
      {/* Product Image Presentation (Contain-style, 70% visual height) */}
      <div className="relative aspect-[4/3] w-full bg-[#FAF8F5] overflow-hidden border-b border-[#D8CBBE]/30">
        <HandbagVisual
          slug={product.slug}
          name={product.name}
          imageUrl={primaryImage?.image_url}
          className="w-full h-full"
        />

        {/* Demo Record Badge when in Preview */}
        {product.is_demo && (
          <span className="absolute top-2.5 left-2.5 text-[10px] uppercase tracking-wider font-semibold text-[#6D2638] bg-[#F8F5EF]/90 px-1.5 py-0.5 border border-[#6D2638]/20">
            Preview Demo
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#241C19]/60 uppercase tracking-wider">
            <span>{product.category?.name || 'Handbag'}</span>
            {hasMultipleVariants && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.variants.length} Colours</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#241C19] line-clamp-1 group-hover:text-[#6D2638] transition-colors">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#241C19]/70 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Action Baseline */}
        <div className="mt-4 pt-3 border-t border-[#D8CBBE]/40 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#241C19]/50 block">Price</span>
            <span className="font-sans font-semibold text-[#241C19] text-base tabular-nums">
              {formatGHS(product.base_price_pesewas)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs ${isAvailable ? 'text-[#2D5A43] font-medium' : 'text-[#6D2638]'}`}>
              {isAvailable ? 'In Stock' : 'Awaiting Stock'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F8F5EF] group-hover:bg-[#241C19] group-hover:text-[#F8F5EF] flex items-center justify-center transition-colors text-[#241C19]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
