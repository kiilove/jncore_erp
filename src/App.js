"use client";

import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./features/dashboard/pages/DashboardPage";
import Purchases from "./features/purchases/pages/PurchasesPage";
import PurchaseReportPage from "./features/purchases/pages/PurchaseReportPage";
import PaymentPage from "./features/purchases/pages/PaymentPage";
import Sales from "./features/sales/pages/Sales";
import SalesAdd from "./features/sales/pages/SalesAdd";
import SalesEdit from "./features/sales/pages/SalesEdit";
import SalesDetail from "./features/sales/pages/SalesDetail";
import Products from "./features/products/pages/ProductsPage";
import ProductAdd from "./features/products/pages/ProductAdd";
import ProductEdit from "./features/products/pages/ProductEdit";
import ProductDetail from "./features/products/pages/ProductDetail";
import Customers from "./features/customers/pages/Customers";
import CustomerAdd from "./features/customers/pages/CustomerAdd";
import CustomerDetail from "./features/customers/pages/CustomerDetail";
import CustomerEdit from "./features/customers/pages/CustomerEdit";
import SuppliersPage from "./features/suppliers/pages/SuppliersPage";
import SupplierDetailPage from "./features/suppliers/pages/SupplierDetailPage";
import SalesInvoice from "./features/sales/pages/SalesInvoicePage";
import UserManagement from "./features/users/pages/UserManagementPage";
import SettingsPage from "./features/settings/pages/SettingsPage";
import Login from "./features/auth/pages/LoginPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SalesProvider } from "./features/sales/context/SalesContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import CustomerImportPage from "./features/customers/pages/CustomerImportPage";
import { useProducts } from "./hooks/useProducts";
import "./index.css";

// 권한이 필요한 라우트를 위한 컴포넌트
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, hasPermission } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { currentUser, loading } = useAuth();
  // 제품 데이터 구독 초기화
  useProducts();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <SalesProvider>
        <Routes>
          {/* 인증이 필요하지 않은 라우트 */}
          <Route
            path="/login"
            element={!currentUser ? <Login /> : <Navigate to="/" replace />}
          />

          {/* 인증이 필요한 라우트 */}
          {currentUser ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="purchases/report" element={<PurchaseReportPage />} />
              <Route path="purchases/payment/:id" element={<PaymentPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="suppliers/:id" element={<SupplierDetailPage />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/add" element={<SalesAdd />} />
              <Route path="sales/edit/:id" element={<SalesEdit />} />
              <Route path="sales/:id" element={<SalesDetail />} />
              <Route path="sales/invoice/:id" element={<SalesInvoice />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<ProductAdd />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/add" element={<CustomerAdd />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="customers/:id/edit" element={<CustomerEdit />} />
              <Route path="customers/import" element={<CustomerImportPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="user-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </SalesProvider>
    </NotificationProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
