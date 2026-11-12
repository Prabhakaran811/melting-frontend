import type { IconName } from "../components/common/Icon";

export type NavChild = { label: string; path: string };

export type NavItem = {
  label: string;
  icon: IconName;
  path?: string; // a single link
  children?: NavChild[]; // or a group with sub pages
};

export const NAV_ITEMS: NavItem[] =  [
  {
    label: "Dashboard",
    icon: "dashboard",
    path: "/dashboard",
  },

  {
    label: "Master Data",
    icon: "master",
    children: [
      { label: "Furnaces", path: "/master/furnaces" },
      { label: "Products", path: "/master/products" },
      { label: "Customers", path: "/admin/customers" },
      { label: "Suppliers", path: "/admin/suppliers" },
      { label: "Hardness", path: "/master/hardness" },
      { label: "Inoculants", path: "/master/inoculants" },
      { label: "FeSi Granules", path: "/master/fesi-granules" },
      { label: "Packings", path: "/master/packings" },
      { label: "Elements", path: "/master/elements" },
      { label: "Iron Types", path: "/master/iron-type" },
      { label: "Raw Materials", path: "/master/raw-materials" },
      { label: "Wires", path: "/master/wires" },
    ],
  },

  {
    label: "Inventory",
    icon: "inventory",
    children: [
      { label: "Raw Material Stock", path: "/master/raw-material-stock" },
      { label: "Element Stock", path: "/master/element-stock" },
      { label: "Wire Stock", path: "/master/wire-stock" },
    ],
  },

  {
    label: "Production",
    icon: "production",
    children: [
      { label: "Orders", path: "/master/orders" },
      { label: "AIM Management", path: "/master/aims" },
      { label: "Furnace Dashboard", path: "/master/furnace-dashboard" },
      { label: "Furnace Operations", path: "/production/furnace-operations" },
      { label: "Charge Mix", path: "/production/charge-mix" },
      { label: "Spectrum Testing", path: "/production/spectrum-testing" },
    ],
  },

  {
    label: "Reports",
    icon: "reports",
    children: [
      { label: "Furnace Cycle Reports", path: "/master/furnace-reports" },
      { label: "Spectrum Reports", path: "/reports/spectrum" },
      { label: "Charge Mix Reports", path: "/reports/charge-mix" },
      { label: "Production History", path: "/reports/production-history" },
    ],
  },

  {
    label: "Administration",
    icon: "admin",
    children: [
      { label: "Users", path: "/admin/users" },
    ],
  },
];