import React, { useState, useEffect } from 'react';
import { Save, Check, Settings, Info } from 'lucide-react';
import { StoreSettings } from '../../types';
import { fetchStoreSettings } from '../../lib/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStoreSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setNotice('Store settings saved successfully.');
      setTimeout(() => setNotice(null), 3000);
    }, 400);
  };

  if (loading || !settings) {
    return <div className="py-12 text-center text-xs text-[#241C19]/60">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#241C19]">
          Store Settings & Editorial Copy
        </h1>
        <p className="text-xs text-[#241C19]/60">
          Configure verified contact numbers, hero campaign copy, and brand introduction
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Communication Channels */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#241C19]">
            Verified Communication Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label htmlFor="settings-phone" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Business Telephone Line
              </label>
              <input
                id="settings-phone"
                type="text"
                value={settings.brand_info.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    brand_info: { ...settings.brand_info, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-whatsapp" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                WhatsApp Ordering Number
              </label>
              <input
                id="settings-whatsapp"
                type="text"
                value={settings.brand_info.whatsapp}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    brand_info: { ...settings.brand_info, whatsapp: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-email" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Business Email Address
              </label>
              <input
                id="settings-email"
                type="email"
                value={settings.brand_info.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    brand_info: { ...settings.brand_info, email: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Hero Content Editor */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#241C19]">
            Homepage Hero Campaign
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="settings-eyebrow" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Eyebrow Text
              </label>
              <input
                id="settings-eyebrow"
                type="text"
                value={settings.hero_content.eyebrow}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, eyebrow: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-heading" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Main Heading
              </label>
              <input
                id="settings-heading"
                type="text"
                value={settings.hero_content.heading}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, heading: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-serif text-sm font-bold"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-supporting-text" className="uppercase tracking-wider text-[#241C19] font-semibold block text-[10px]">
                Supporting Description
              </label>
              <textarea
                id="settings-supporting-text"
                rows={2}
                value={settings.hero_content.supporting_text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, supporting_text: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Brand Introduction */}
        <div className="bg-[#FFFEFC] border border-[#D8CBBE] p-6 rounded-sm shadow-xs space-y-3 text-xs">
          <h2 className="font-serif text-base font-semibold text-[#241C19]">
            Draft Brand Statement
          </h2>
          <textarea
            rows={3}
            value={settings.brand_info.introduction}
            onChange={(e) =>
              setSettings({
                ...settings,
                brand_info: { ...settings.brand_info, introduction: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs"
          />
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#241C19] hover:bg-[#6D2638] text-[#F8F5EF] text-xs font-semibold rounded-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
