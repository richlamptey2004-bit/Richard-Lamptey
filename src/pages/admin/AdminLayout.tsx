import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Layers,
  Inbox,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreview } from '../../context/PreviewContext';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigate, children }) => {
  const { user, signOut } = useAuth();
  const { isPreviewMode } = usePreview();

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Inventory', path: '/admin/inventory', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: Inbox },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col">
      {/* Admin Top Bar */}
      <header className="bg-[#241C19] text-[#F8F5EF] border-b border-[#3D322E] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold tracking-tight text-[#FFFEFC]">
              ESTCHAY LUX
            </span>
            <span className="text-xs uppercase tracking-wider text-[#B99A64] font-semibold border-l border-[#3D322E] pl-3">
              Admin Portal
            </span>
            {user?.isPreviewAdmin && (
              <span className="bg-[#B99A64]/20 text-[#B99A64] text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs">
                Preview Session
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => navigate('/')}
              className="text-[#D8CBBE] hover:text-[#FFFEFC] flex items-center gap-1.5 transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <span className="hidden sm:inline text-[#D8CBBE]/60 font-mono">
              {user?.email}
            </span>

            <button
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
              className="px-2.5 py-1.5 bg-[#3D322E] hover:bg-[#6D2638] text-[#FFFEFC] rounded-xs transition-colors flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body with Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Navigation Tabs Bar */}
        <nav className="flex overflow-x-auto space-x-1 p-1 bg-[#FFFEFC] border border-[#D8CBBE]/60 rounded-xs shadow-xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? currentPath === '/admin'
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#241C19] text-[#F8F5EF]'
                    : 'text-[#241C19]/70 hover:bg-[#F8F5EF] hover:text-[#241C19]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Container */}
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
};
