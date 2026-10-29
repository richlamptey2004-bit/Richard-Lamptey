import React, { useState, useEffect } from 'react';
import { Product } from './types';
import { CartProvider } from './context/CartContext';
import { PreviewProvider } from './context/PreviewContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { DevSetupModal } from './components/DevSetupModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrderPage } from './pages/OrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function MainRouter() {
  const { isAdmin } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');

  // Handle browser back and forward button navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/shop/${product.slug}`);
  };

  const handleViewAllSearchResults = (query: string) => {
    setInitialSearchQuery(query);
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  // Determine which page to render based on URL route
  const renderRoute = () => {
    // -------------------------------------------------------------
    // ADMIN ROUTES (Protected with Authentication & Admin Role)
    // -------------------------------------------------------------
    if (currentPath === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/admin')) {
      if (!isAdmin) {
        return <AdminLoginPage navigate={navigate} />;
      }

      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          {currentPath === '/admin' && <AdminOverviewPage navigate={navigate} />}
          {currentPath === '/admin/products' && <AdminProductsPage navigate={navigate} />}
          {currentPath === '/admin/products/new' && (
            <AdminProductEditPage navigate={navigate} />
          )}
          {currentPath.startsWith('/admin/products/') && currentPath.endsWith('/edit') && (
            <AdminProductEditPage
              productId={currentPath.replace('/admin/products/', '').replace('/edit', '')}
              navigate={navigate}
            />
          )}
          {currentPath === '/admin/categories' && <AdminCategoriesPage />}
          {currentPath === '/admin/inventory' && <AdminInventoryPage />}
          {currentPath === '/admin/orders' && <AdminOrdersPage navigate={navigate} />}
          {currentPath.startsWith('/admin/orders/') && (
            <AdminOrderDetailPage
              orderId={currentPath.replace('/admin/orders/', '')}
              navigate={navigate}
            />
          )}
          {currentPath === '/admin/messages' && <AdminMessagesPage />}
          {currentPath === '/admin/settings' && <AdminSettingsPage />}
        </AdminLayout>
      );
    }

    // -------------------------------------------------------------
    // PUBLIC ROUTES
    // -------------------------------------------------------------
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#241C19]">
        <Header
          currentPath={currentPath}
          navigate={navigate}
          onOpenSearch={() => setSearchModalOpen(true)}
        />

        <main className="flex-1">
          {currentPath === '/' && (
            <HomePage navigate={navigate} onSelectProduct={handleSelectProduct} />
          )}

          {currentPath === '/about' && <AboutPage navigate={navigate} />}

          {currentPath === '/shop' && (
            <ShopPage
              navigate={navigate}
              onSelectProduct={handleSelectProduct}
              initialQuery={initialSearchQuery}
            />
          )}

          {currentPath.startsWith('/shop/') && (
            selectedProduct ? (
              <ProductDetailPage
                product={selectedProduct}
                onBack={() => navigate('/shop')}
                onSelectProduct={handleSelectProduct}
                onGoToOrder={() => navigate('/order')}
              />
            ) : (
              <ShopPage
                navigate={navigate}
                onSelectProduct={handleSelectProduct}
                initialQuery={initialSearchQuery}
              />
            )
          )}

          {currentPath === '/order' && <OrderPage navigate={navigate} />}

          {currentPath === '/contact' && <ContactPage />}

          {currentPath === '/privacy' && <PrivacyPage />}
        </main>

        <Footer navigate={navigate} />

        <FloatingWhatsApp />

        {/* Global Modals */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelectProduct={handleSelectProduct}
          onViewAllResults={handleViewAllSearchResults}
        />
        <DevSetupModal />
      </div>
    );
  };

  return <>{renderRoute()}</>;
}

export default function App() {
  return (
    <PreviewProvider>
      <AuthProvider>
        <CartProvider>
          <MainRouter />
        </CartProvider>
      </AuthProvider>
    </PreviewProvider>
  );
}
