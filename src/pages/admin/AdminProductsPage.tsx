import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Archive, Eye, EyeOff } from 'lucide-react';
import { Product } from '../../types';
import { fetchProducts } from '../../lib/api';
import { formatGHS } from '../../lib/formatters';
import { HandbagVisual } from '../../components/HandbagVisual';
import { usePreview } from '../../context/PreviewContext';

interface AdminProductsPageProps {
  navigate: (path: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ navigate }) => {
  const { isPreviewMode } = usePreview();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts({ includeDemo: true });
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isPreviewMode]);

  const togglePublish = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_published: !p.is_published } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#241C19]">
            Handbag Catalogue Management
          </h1>
          <p className="text-xs text-[#241C19]/60">
            Publish, edit, and organize handbags in your store
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/products/new')}
          className="px-4 py-2 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60 space-y-3">
            <p>No products found in the catalogue.</p>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="px-4 py-2 bg-[#241C19] text-[#F8F5EF] text-xs rounded-xs font-semibold"
            >
              Create First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] text-[#241C19]/70 uppercase tracking-wider font-semibold border-b border-[#D8CBBE]/60">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Variants & Stock</th>
                  <th className="py-3 px-4">Storefront Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8CBBE]/30">
                {products.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
                  return (
                    <tr key={p.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#F8F5EF] border border-[#D8CBBE]/40 rounded-xs overflow-hidden shrink-0">
                            <HandbagVisual
                              slug={p.slug}
                              name={p.name}
                              imageUrl={p.images[0]?.image_url}
                              className="w-full h-full p-0.5"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-[#241C19] block">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#241C19]/60">
                              <span className="font-mono">{p.slug}</span>
                              {p.is_demo && (
                                <span className="text-[#6D2638] font-bold uppercase text-[9px] bg-[#6D2638]/10 px-1 rounded-xs">
                                  Demo Fixture
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#241C19]/80">
                        {p.category?.name || 'Tote Bags'}
                      </td>

                      <td className="py-3 px-4 font-semibold tabular-nums text-[#241C19]">
                        {formatGHS(p.base_price_pesewas)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="block font-medium">
                          {p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'}
                        </span>
                        <span className="text-[11px] text-[#241C19]/60 tabular-nums">
                          {totalStock} total units in stock
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePublish(p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-semibold text-[11px] transition-colors ${
                            p.is_published
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {p.is_published ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-700" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-stone-500" />
                              <span>Unpublished</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                            className="p-1.5 text-[#241C19]/70 hover:text-[#241C19] hover:bg-[#F8F5EF] rounded-xs transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Archive "${p.name}"?`)) {
                                setProducts(products.filter((item) => item.id !== p.id));
                              }
                            }}
                            className="p-1.5 text-[#241C19]/40 hover:text-[#6D2638] hover:bg-[#F8F5EF] rounded-xs transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
