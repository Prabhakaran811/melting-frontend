import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../features/dashboard/Dashboard";
import UserManagement from "../features/users/pages/UserManagement";
import CustomerManagement from "../features/customers/pages/CustomerManagement";
import SupplierManagement from "../features/suppliers/pages/SupplierManagement";
import PageHeader from "../components/common/PageHeader";
import { useAppSelector } from "../app/hooks";
import { NAV_ITEMS } from "../utils/constants";
import type { NavChild } from "../utils/constants";

const Placeholder = ({ title }: { title: string }) => (
  <PageHeader title={title} subtitle="This page is not built yet." />
);

// Pages that already exist. Add each new page's path here when you build it.
const BUILT_PATHS = new Set(["/dashboard", "/admin/users", "/admin/customers", "/admin/suppliers"]);

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