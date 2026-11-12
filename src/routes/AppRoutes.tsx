import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../features/dashboard/Dashboard";
import UserManagement from "../features/users/pages/UserManagement";
import CustomerManagement from "../features/customers/pages/CustomerManagement";
import SupplierManagement from "../features/suppliers/pages/SupplierManagement";
import FurnaceManagement from "../features/furnaces/pages/FurnaceManagement";
import ProductManagement from "../features/products/pages/ProductManagement";
import HardnessManagement from "../features/hardness/pages/HardnessManagement";
import InoculantManagement from "../features/inoculants/pages/InoculantManagement";
import GranuleManagement from "../features/fesiGranules/pages/GranuleManagement";
import PackingManagement from "../features/packings/pages/PackingManagement";
import ElementManagement from "../features/elements/pages/ElementManagement";
import IronTypeManagement from "../features/ironTypes/pages/IronTypeManagement";
import RawMaterialManagement from "../features/rawMaterials/pages/RawMaterialManagement";
import WireManagement from "../features/wires/pages/WireManagement";
import ElementStockManagement from "../features/elementStocks/pages/ElementStockManagement";
import RawMaterialStockManagement from "../features/rawMaterialStocks/pages/RawMaterialStockManagement";
import WireStockManagement from "../features/wireStocks/pages/WireStockManagement";
import AimManagement from "../features/aims/pages/AimManagement";
import OrderManagement from "../features/orders/pages/OrderManagement";
import FurnaceDashboard from "../features/furnaceDashboard/pages/FurnaceDashboard";
import FurnaceReport from "../features/furnaceReports/pages/FurnaceReport";
import PageHeader from "../components/common/PageHeader";
import { useAppSelector } from "../app/hooks";
import { NAV_ITEMS } from "../utils/constants";
import type { NavChild } from "../utils/constants";

const Placeholder = ({ title }: { title: string }) => (
  <PageHeader title={title} subtitle="This page is not built yet." />
);

// Pages that already exist. Add each new page's path here when you build it.
const BUILT_PATHS = new Set(["/dashboard", "/admin/users", "/admin/customers", "/admin/suppliers", "/master/furnaces", "/master/products", "/master/hardness", "/master/inoculants", "/master/fesi-granules", "/master/packings", "/master/elements", "/master/iron-type", "/master/raw-materials", "/master/wires", "/master/element-stock", "/master/raw-material-stock", "/master/wire-stock", "/master/aims", "/master/orders", "/master/furnace-dashboard", "/master/furnace-reports"]);

const placeholderPages: NavChild[] = NAV_ITEMS.flatMap(
  (item): NavChild[] =>
    item.children ??
    (item.path ? [{ label: item.label, path: item.path }] : [])
).filter((page) => !BUILT_PATHS.has(page.path));

export default function AppRoutes() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/suppliers" element={<SupplierManagement />} />
          <Route path="/master/furnaces" element={<FurnaceManagement />} />
          <Route path="/master/products" element={<ProductManagement />} />
          <Route path="/master/hardness" element={<HardnessManagement />} />
          <Route path="/master/inoculants" element={<InoculantManagement />} />
          <Route path="/master/fesi-granules" element={<GranuleManagement />} />
          <Route path="/master/packings" element={<PackingManagement />} />
          <Route path="/master/elements" element={<ElementManagement />} />
          <Route path="/master/iron-type" element={<IronTypeManagement />} />
          <Route path="/master/raw-materials" element={<RawMaterialManagement />} />
          <Route path="/master/wires" element={<WireManagement />} />
          <Route path="/master/element-stock" element={<ElementStockManagement />} />
          <Route path="/master/raw-material-stock" element={<RawMaterialStockManagement />} />
          <Route path="/master/wire-stock" element={<WireStockManagement />} />
          <Route path="/master/aims" element={<AimManagement />} />
          <Route path="/master/orders" element={<OrderManagement />} />
          <Route path="/master/furnace-dashboard" element={<FurnaceDashboard />} />
          <Route path="/master/furnace-reports" element={<FurnaceReport />} />
          {placeholderPages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<Placeholder title={page.label} />}
            />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}