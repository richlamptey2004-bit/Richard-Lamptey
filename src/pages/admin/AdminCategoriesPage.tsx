import React, { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Tags } from 'lucide-react';
import { Category } from '../../types';
import { fetchCategories } from '../../lib/api';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || null,
      display_order: categories.length + 1,
      is_active: true,
    };

    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setNotice(`Category "${newCat.name}" added successfully.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#241C19]">
          Category Organization
        </h1>
        <p className="text-xs text-[#241C19]/60">
          Manage boutique handbag classifications (Tote Bags, Handbag Sets, Purses, etc.)
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Categories List */}
        <div className="md:col-span-7 bg-[#FFFEFC] border border-[#D8CBBE] rounded-sm shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#D8CBBE]/40 bg-[#F8F5EF] font-semibold text-xs text-[#241C19] uppercase tracking-wider">
            Active Store Categories
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#241C19]/60">Loading categories...</div>
          ) : (
            <div className="divide-y divide-[#D8CBBE]/30 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#F8F5EF]/40 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-serif text-sm font-semibold text-[#241C19] block">
                      {c.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#B99A64]">
                      slug: {c.slug}
                    </span>
                    {c.description && (
                      <p className="text-[11px] text-[#241C19]/60">{c.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCategoryActive(c.id)}
                      className={`px-2.5 py-1 rounded-xs font-semibold uppercase text-[10px] ${
                        c.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category Form */}
        <div className="md:col-span-5 bg-[#FFFEFC] border border-[#D8CBBE] p-5 rounded-sm shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#241C19] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#B99A64]" />
            Add New Category
          </h2>

          <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="category-name" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Crossbody Bags"
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category-description" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Description (Optional)
              </label>
              <textarea
                id="category-description"
                rows={2}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Short editorial summary of this handbag category..."
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] font-semibold rounded-xs transition-colors"
            >
              Save Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
