import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Save, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, ProductVariant, Category } from '../../types';
import { fetchProductBySlug, fetchCategories } from '../../lib/api';

interface AdminProductEditPageProps {
  productId?: string;
  navigate: (path: string) => void;
}

export const AdminProductEditPage: React.FC<AdminProductEditPageProps> = ({
  productId,
  navigate,
}) => {
  const isNew = !productId || productId === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [priceGHS, setPriceGHS] = useState<number>(450);
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');

  // Image Upload State (5 MB max, JPEG, PNG, WebP)
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Variants list
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: `var-${Date.now()}`,
      product_id: '',
      name: 'Standard',
      color_name: 'Standard',
      color_hex: '#1C1C1E',
      sku: 'EST-NEW-01',
      price_pesewas: null,
      stock_quantity: 10,
      is_available: true,
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }

        if (!isNew && productId) {
          const prod = await fetchProductBySlug(productId, true);
          if (prod) {
            setName(prod.name);
            setSlug(prod.slug);
            setCategoryId(prod.category_id || (cats[0]?.id ?? ''));
            setDescription(prod.description);
            setPriceGHS(prod.base_price_pesewas / 100);
            setIsPublished(prod.is_published);
            setIsFeatured(prod.is_featured);
            setIsNewArrival(prod.is_new);
            setDimensions(prod.dimensions || '');
            setMaterial(prod.material || '');
            if (prod.images[0]?.image_url) {
              setImageUrl(prod.images[0].image_url);
              setImagePreview(prod.images[0].image_url);
            }
            if (prod.variants && prod.variants.length > 0) {
              setVariants(prod.variants);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId, isNew]);

  // Handle local image file selection with validation
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorNotice(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPEG, PNG, WebP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorNotice('Invalid file type. Allowed formats: JPEG, PNG, and WebP.');
      return;
    }

    // Documented 5 MB limit
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setErrorNotice('Image size exceeds 5 MB limit. Please compress the photograph before uploading.');
      return;
    }

    // Read and create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${prev.length}`,
        product_id: '',
        name: `Option ${prev.length + 1}`,
        color_name: 'Colour',
        color_hex: '#241C19',
        sku: `EST-${Date.now().toString().slice(-4)}`,
        price_pesewas: null,
        stock_quantity: 5,
        is_available: true,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!name.trim()) {
      setErrorNotice('Product name is required.');
      return;
    }

    setSaving(true);
    try {
      // Generate slug if empty
      const cleanSlug = slug.trim()
        ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // In real backend or mock, save record
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSuccessNotice(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1200);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-[#241C19]/60">Loading product editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D8CBBE]/50">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-xs font-semibold uppercase tracking-wider text-[#241C19]/70 hover:text-[#6D2638] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <h1 className="font-serif text-xl font-bold text-[#241C19]">
          {isNew ? 'Create New Handbag' : `Edit: ${name}`}
        </h1>
      </div>

      {errorNotice && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorNotice}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Handbag record saved successfully. Returning to catalogue list...</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Product Information */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#241C19]">
            General Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="product-name" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Product Name <span className="text-[#6D2638]">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (isNew && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                placeholder="e.g. Cognac Tote with Gold-Tone Detail"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="product-slug" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                URL Slug
              </label>
              <input
                id="product-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. cognac-tote-gold-detail"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="product-category" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Category
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="product-price" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
                Base Selling Price (GH₵) <span className="text-[#6D2638]">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1"
                required
                value={priceGHS}
                onChange={(e) => setPriceGHS(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden tabular-nums font-semibold"
              />
              <span className="text-[10px] text-[#241C19]/50 block">
                Stored in database as integer pesewas ({priceGHS * 100} pesewas)
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="product-description" className="text-xs uppercase tracking-wider text-[#241C19] font-semibold block">
              Editorial Description
            </label>
            <textarea
              id="product-description"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A structured tote with pebbled finish and gold-tone detailing..."
              className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden"
            />
          </div>

          {/* Specifications (Dimensions & Material) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D8CBBE]/40">
            <div className="space-y-1">
              <label htmlFor="product-dimensions" className="text-xs uppercase tracking-wider text-[#241C19]/70 font-semibold block">
                Confirmed Dimensions (Optional)
              </label>
              <input
                id="product-dimensions"
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 35cm (W) x 28cm (H) x 12cm (D)"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="product-material" className="text-xs uppercase tracking-wider text-[#241C19]/70 font-semibold block">
                Confirmed Material (Optional)
              </label>
              <input
                id="product-material"
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Leave blank or specify if confirmed"
                className="w-full text-xs px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Publication Toggles */}
          <div className="pt-4 border-t border-[#D8CBBE]/40 flex flex-wrap items-center gap-6 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-[#241C19] rounded-xs"
              />
              <span className="font-semibold text-[#241C19]">Published to Live Storefront</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#241C19] rounded-xs"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 accent-[#241C19] rounded-xs"
              />
              <span>Mark as New Arrival</span>
            </label>
          </div>
        </div>

        {/* Product Imagery & Upload Workflow */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#241C19]">
            Product Photography & Storage
          </h2>
          <p className="text-xs text-[#241C19]/60">
            Supports JPEG, PNG, and WebP up to 5 MB. Images will be stored in Supabase Storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Upload control */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wider text-[#241C19] font-semibold">
                Upload New Image File
              </label>
              <div className="border-2 border-dashed border-[#D8CBBE] hover:border-[#241C19] rounded-sm p-6 text-center cursor-pointer bg-[#F8F5EF]/50 transition-colors relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-[#B99A64] mx-auto mb-2" />
                <span className="text-xs font-semibold text-[#241C19] block">
                  Click to select file or drag here
                </span>
                <span className="text-[10px] text-[#241C19]/50 block mt-1">
                  JPEG, PNG, WebP · Max 5 MB
                </span>
              </div>

              {/* Or Direct Image URL */}
              <div className="space-y-1">
                <label htmlFor="product-image-url" className="text-[11px] text-[#241C19]/70 font-semibold block">
                  Or External Image URL:
                </label>
                <input
                  id="product-image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-1.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#F8F5EF] border border-[#D8CBBE]/60 rounded-xs min-h-[220px]">
              <span className="text-[10px] uppercase tracking-wider text-[#241C19]/50 font-semibold mb-2">
                Image Preview (Contain Format)
              </span>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="max-h-48 max-w-full object-contain rounded-xs shadow-xs"
                />
              ) : (
                <div className="text-center text-xs text-[#241C19]/40 py-8">
                  No custom image uploaded.
                  <span className="block text-[11px] mt-1 text-[#B99A64]">
                    The boutique will render the custom vector silhouette for this bag.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Variants & Stock Management */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8CBBE]/40">
            <div>
              <h2 className="font-serif text-base font-semibold text-[#241C19]">
                Product Variants & Stock Quantities
              </h2>
              <p className="text-xs text-[#241C19]/60">
                Manage colour variants, stock levels, and SKUs.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-[#F8F5EF] hover:bg-[#241C19] hover:text-[#F8F5EF] text-[#241C19] border border-[#D8CBBE] text-xs font-semibold rounded-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={v.id || idx}
                className="p-3 bg-[#F8F5EF] border border-[#D8CBBE]/60 rounded-xs grid grid-cols-1 sm:grid-cols-6 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-2">
                  <label htmlFor={`variant-name-${idx}`} className="text-[10px] uppercase font-semibold text-[#241C19]/60 block">
                    Variant Name
                  </label>
                  <input
                    id={`variant-name-${idx}`}
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx].name = e.target.value;
                      setVariants(next);
                    }}
                    className="w-full px-2 py-1 bg-white border border-[#D8CBBE] rounded-xs"
                  />
                </div>

                <div>
                  <label htmlFor={`variant-color-${idx}`} className="text-[10px] uppercase font-semibold text-[#241C19]/60 block">
                    Colour Name
                  </label>
                  <input
                    id={`variant-color-${idx}`}
                    type="text"
                    value={v.color_name}
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx].color_name = e.target.value;
                      setVariants(next);
                    }}
                    className="w-full px-2 py-1 bg-white border border-[#D8CBBE] rounded-xs"
                  />
                </div>

                <div>
                  <label htmlFor={`variant-sku-${idx}`} className="text-[10px] uppercase font-semibold text-[#241C19]/60 block">
                    SKU Code
                  </label>
                  <input
                    id={`variant-sku-${idx}`}
                    type="text"
                    value={v.sku || ''}
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx].sku = e.target.value;
                      setVariants(next);
                    }}
                    className="w-full px-2 py-1 bg-white border border-[#D8CBBE] rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label htmlFor={`variant-stock-${idx}`} className="text-[10px] uppercase font-semibold text-[#241C19]/60 block">
                    Stock Quantity
                  </label>
                  <input
                    id={`variant-stock-${idx}`}
                    type="number"
                    min="0"
                    value={v.stock_quantity}
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx].stock_quantity = Math.max(0, Number(e.target.value));
                      setVariants(next);
                    }}
                    className="w-full px-2 py-1 bg-white border border-[#D8CBBE] rounded-xs font-semibold tabular-nums"
                  />
                </div>

                <div className="flex items-center justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    disabled={variants.length <= 1}
                    className="p-1.5 text-[#241C19]/40 hover:text-[#6D2638] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 bg-transparent border border-[#D8CBBE] text-[#241C19] text-xs font-semibold rounded-xs hover:bg-[#FFFEFC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:bg-stone-300"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Handbag...' : 'Save Handbag Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
