import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Database, Key, Server, Copy, Check } from 'lucide-react';
import { usePreview } from '../context/PreviewContext';

export const DevSetupModal: React.FC = () => {
  const { showSetupModal, setShowSetupModal, serverStatus, isPreviewMode, setPreviewMode } = usePreview();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!showSetupModal) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FFFEFC] w-full max-w-3xl rounded-sm shadow-2xl border border-[#D8CBBE] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-[#241C19] text-[#F8F5EF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#B99A64]" />
            <div>
              <h3 className="font-serif text-lg font-bold">Supabase & Architecture Status</h3>
              <p className="text-xs text-[#D8CBBE]/80">
                ESTCHAY LUX LADY’S BAGS persistence, authentication and storage pipeline
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSetupModal(false)}
            className="text-[#D8CBBE] hover:text-white p-1 rounded-sm transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#241C19]">
          {/* Current Connection Status */}
          <div className="bg-[#F8F5EF] p-4 rounded-sm border border-[#D8CBBE]/60 space-y-3">
            <h4 className="font-serif font-semibold text-sm text-[#241C19] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#B99A64]" />
              Environment Integration Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xs border border-[#D8CBBE]/40">
                {serverStatus.supabaseConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#B99A64] shrink-0" />
                )}
                <div>
                  <span className="font-semibold block">SUPABASE_URL</span>
                  <span className="text-[#241C19]/70">
                    {serverStatus.supabaseConfigured ? 'Configured' : 'Missing / Using Demo Fixtures'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xs border border-[#D8CBBE]/40">
                {serverStatus.databaseConnected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#B99A64] shrink-0" />
                )}
                <div>
                  <span className="font-semibold block">PostgreSQL Database</span>
                  <span className="text-[#241C19]/70">
                    {serverStatus.databaseConnected ? 'Connected & Migrated' : 'Not Connected (Isolated Preview)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode switch */}
            <div className="pt-2 flex items-center justify-between border-t border-[#D8CBBE]/40 text-xs">
              <span>Preview Mode (Demo Records Visible):</span>
              <button
                onClick={() => setPreviewMode(!isPreviewMode)}
                className={`px-3 py-1 font-semibold rounded-xs transition-colors ${
                  isPreviewMode
                    ? 'bg-[#B99A64] text-[#241C19]'
                    : 'bg-stone-200 text-[#241C19]'
                }`}
              >
                {isPreviewMode ? 'Preview Mode: ACTIVE' : 'Production Mode: LIVE ONLY'}
              </button>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-[#241C19] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#B99A64]" />
              How to Connect Your Supabase Project
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#241C19]/80 leading-relaxed">
              <li>
                Create a new project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#6D2638] underline">supabase.com</a>.
              </li>
              <li>
                Open the <strong>SQL Editor</strong> in Supabase and run the provided migration script located at:
                <code className="mx-1 px-1.5 py-0.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono text-[11px]">
                  supabase/migrations/20261029000000_initial_schema.sql
                </code>
              </li>
              <li>
                Run the idempotent seed script at:
                <code className="mx-1 px-1.5 py-0.5 bg-[#F8F5EF] border border-[#D8CBBE] rounded-xs font-mono text-[11px]">
                  supabase/seed.sql
                </code>
              </li>
              <li>
                Add the following keys to your AI Studio Secrets or <code className="font-mono text-[11px]">.env</code>:
              </li>
            </ol>

            <div className="bg-[#241C19] text-[#F8F5EF] p-3 rounded-xs font-mono text-xs space-y-1 relative group">
              <button
                onClick={() =>
                  copyToClipboard(
                    `SUPABASE_URL=https://your-project.supabase.co\nSUPABASE_ANON_KEY=your-anon-key\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key\nADMIN_EMAIL=owner@estchaybags.com`,
                    'env'
                  )
                }
                className="absolute top-2.5 right-2.5 px-2 py-1 bg-[#3D322E] hover:bg-[#B99A64] hover:text-[#241C19] rounded-xs text-[10px] flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'env' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'env' ? 'Copied' : 'Copy Template'}
              </button>
              <div>SUPABASE_URL=&quot;https://your-project-id.supabase.co&quot;</div>
              <div>SUPABASE_ANON_KEY=&quot;eyJhbGciOi...&quot;</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=&quot;eyJhbGciOi...&quot; # Server-side only!</div>
              <div>ADMIN_EMAIL=&quot;owner@estchaybags.com&quot;</div>
            </div>
          </div>

          {/* Vercel Deployment Note */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 leading-relaxed">
            <strong>Vercel Export Ready:</strong> Full Vercel configuration files, serverless route rewrites and deployment instructions have been generated in <code className="font-mono text-[11px]">VERCEL_DEPLOYMENT.md</code> and <code className="font-mono text-[11px]">vercel.json</code>.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F5EF] border-t border-[#D8CBBE]/60 flex justify-end">
          <button
            onClick={() => setShowSetupModal(false)}
            className="px-4 py-2 bg-[#241C19] text-[#F8F5EF] text-xs font-semibold rounded-xs hover:bg-[#3D322E] transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
