import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, CheckCircle, Plus, Minus, History } from 'lucide-react';
import { Product } from '../../types';
import { fetchProducts } from '../../lib/api';
import { formatGHS } from '../../lib/formatters';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState<{
    productName: string;
    variantId: string;
    variantName: string;
    currentStock: number;
  } | null>(null);

  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Restock from supplier');
  const [notice, setNotice] = useState<string | null>(null);

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
  }, []);

  const handleApplyAdjustment = () => {
    if (!adjustModal) return;

    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        variants: p.variants.map((v) =>
          v.id === adjustModal.variantId
            ? { ...v, stock_quantity: Math.max(0, v.stock_quantity + adjustAmount) }
            : v
        ),
      }))
    );

    setNotice(
      `Stock for ${adjustModal.productName} (${adjustModal.variantName}) adjusted by ${
        adjustAmount > 0 ? `+${adjustAmount}` : adjustAmount
      }. Reason logged: "${adjustReason}".`
    );

    setAdjustModal(null);
    setAdjustAmount(0);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#241C19]">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-[#241C19]/60">
          Variant-level stock control, thresholds, and audit movements
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#241C19]/60">
            Loading stock inventory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] text-[#241C19]/70 uppercase tracking-wider font-semibold border-b border-[#D8CBBE]/60">
                <tr>
                  <th className="py-3 px-4">Handbag Product</th>
                  <th className="py-3 px-4">Variant Option</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8CBBE]/30">
                {products.flatMap((prod) =>
                  prod.variants.map((v) => {
                    const isLow = v.stock_quantity <= 2;
                    return (
                      <tr key={v.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-sm text-[#241C19]">
                          {prod.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#241C19]">{v.name}</span>
                          <span className="text-[11px] text-[#241C19]/60 block">
                            Colour: {v.color_name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#241C19]/70">
                          {v.sku || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold tabular-nums">
                          {formatGHS(v.price_pesewas ?? prod.base_price_pesewas)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold tabular-nums ${
                                v.stock_quantity === 0
                                  ? 'text-red-700'
                                  : isLow
                                  ? 'text-amber-700'
                                  : 'text-[#2D5A43]'
                              }`}
                            >
                              {v.stock_quantity}
                            </span>
                            {isLow && v.stock_quantity > 0 && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded-xs flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Low
                              </span>
                            )}
                            {v.stock_quantity === 0 && (
                              <span className="text-[10px] text-red-700 bg-red-50 px-1 py-0.5 rounded-xs">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-xs font-semibold uppercase text-[10px] ${
                              v.is_available && v.stock_quantity > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {v.is_available && v.stock_quantity > 0 ? 'Active' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setAdjustModal({
                                productName: prod.name,
                                variantId: v.id,
                                variantName: v.name,
                                currentStock: v.stock_quantity,
                              });
                              setAdjustAmount(0);
                            }}
                            className="px-2.5 py-1 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] rounded-xs font-semibold text-[11px] transition-colors"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFEFC] w-full max-w-md border border-[#D8CBBE] rounded-sm p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#241C19]">
              Adjust Inventory Quantity
            </h3>
            <p className="text-xs text-[#241C19]/70">
              {adjustModal.productName} ({adjustModal.variantName})
            </p>

            <div className="p-3 bg-[#F8F5EF] rounded-xs border border-[#D8CBBE]/60 text-xs flex justify-between">
              <span>Current In-Stock Quantity:</span>
              <span className="font-bold tabular-nums text-sm">{adjustModal.currentStock} units</span>
            </div>

            <div className="space-y-1">
              <label htmlFor="adjust-amount" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Stock Adjustment Amount (+ to add, - to reduce)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="adjust-amount"
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-bold tabular-nums"
                />
              </div>
              <span className="text-[11px] text-[#241C19]/60 block">
                Resulting Stock: {Math.max(0, adjustModal.currentStock + adjustAmount)} units
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="adjust-reason" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Reason for Adjustment (Audit Trail)
              </label>
              <select
                id="adjust-reason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs"
              >
                <option value="Restock from supplier">Restock from supplier</option>
                <option value="Inventory recount / audit">Inventory recount / audit</option>
                <option value="Damaged or defective stock removal">Damaged or defective stock removal</option>
                <option value="Showroom sample allocation">Showroom sample allocation</option>
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#D8CBBE]/40">
              <button
                onClick={() => setAdjustModal(null)}
                className="px-3.5 py-1.5 text-xs text-[#241C19]/70 hover:text-[#241C19]"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-4 py-1.5 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs"
              >
                Record Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
