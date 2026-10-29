import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Shield, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { usePreview } from '../context/PreviewContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, onOpenSearch }) => {
  const { itemCount } = useCart();
  const { isPreviewMode, setShowSetupModal } = usePreview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Labelled Preview Mode Top Banner if in preview mode */}
      {isPreviewMode && (
        <aside
          aria-label="Catalogue preview notice"
          className="bg-[#241C19] text-[#F8F5EF] text-xs py-1.5 px-4 flex items-center justify-between border-b border-[#3D322E]"
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <span className="font-semibold tracking-wider uppercase text-[10px] text-[#B99A64]">
              Preview Mode
            </span>
            <span className="text-stone-300 truncate">
              Showing isolated demo fixtures. Connect Supabase for production persistence & live inventory.
            </span>
            <button
              onClick={() => setShowSetupModal(true)}
              className="ml-auto underline hover:text-[#B99A64] text-[11px] whitespace-nowrap shrink-0 transition-colors flex items-center gap-1"
            >
              <Info className="w-3 h-3" /> Setup Details
            </button>
          </div>
        </aside>
      )}

      {/* Main One-Row Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FFFEFC]/95 backdrop-blur-md border-b border-[#D8CBBE]/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (One-line text element) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#241C19] whitespace-nowrap shrink-0 hover:text-[#6D2638] transition-colors"
          >
            ESTCHAY LUX LADY’S BAGS
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#241C19]/80">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(link.path);
                  }}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#241C19] font-semibold'
                      : 'hover:text-[#6D2638]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#B99A64]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Search, Order Bag Count, Unobtrusive Admin) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Quick Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-[#241C19]/75 hover:text-[#241C19] hover:bg-[#F8F5EF] rounded-full transition-colors"
              aria-label="Search Handbags"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Order Selection / Bag Icon */}
            <button
              type="button"
              onClick={() => handleNav('/order')}
              className="relative p-2 text-[#241C19] hover:bg-[#F8F5EF] rounded-full transition-colors"
              aria-label={`Order Selection containing ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-[#241C19]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6D2638] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Unobtrusive Admin Icon */}
            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className="p-2 text-[#241C19]/50 hover:text-[#241C19] hover:bg-[#F8F5EF] rounded-full transition-colors"
              title="Administrator Portal"
              aria-label="Administrator Portal"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#241C19] hover:bg-[#F8F5EF] rounded-lg transition-colors ml-1"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out / Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D8CBBE]/40 bg-[#FFFEFC] px-4 pt-4 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(link.path);
                  }}
                  className={`text-base font-medium py-2 px-3 rounded-md transition-colors ${
                    currentPath === link.path
                      ? 'bg-[#F8F5EF] text-[#6D2638] font-semibold'
                      : 'text-[#241C19] hover:bg-[#F8F5EF]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-[#D8CBBE]/40" />
              <button
                onClick={() => handleNav('/order')}
                className="flex items-center justify-between text-base font-medium py-2 px-3 rounded-md bg-[#241C19] text-[#F8F5EF]"
              >
                <span>View Order Selection</span>
                <span className="bg-[#B99A64] text-[#241C19] text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
                  {itemCount} items
                </span>
              </button>
              <button
                onClick={() => handleNav('/admin')}
                className="flex items-center gap-2 text-sm text-[#241C19]/70 py-2 px-3 hover:text-[#241C19]"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Management</span>
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
