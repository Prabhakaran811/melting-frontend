import type { IconName } from "../components/common/Icon";

export type NavChild = { label: string; path: string };

export type NavItem = {
  label: string;
  icon: IconName;
  path?: string; // a single link
  children?: NavChild[]; // or a group with sub pages
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", icon: "dashboard", path: "/dashboard" },
  {
    label: "Melting",
    icon: "flame",
    children: [
      { label: "Furnaces", path: "/melting/furnaces" },
      { label: "Heat log", path: "/melting/heats" },
      { label: "Charge planning", path: "/melting/charge" },
    ],
  },
   {
    label: "Master",
    icon: "master",
    children: [
      { label: "Furnaces", path: "/master/furnaces" },
      { label: "Products", path: "/master/products" },
      { label: "Hardness", path: "/master/hardness" },
      { label: "Inoculants", path: "/master/inoculants" },
      {label:  "Fesi Granuals", path: "/master/fesi-granules"},
      {label: "Packings", path: "/master/packings"},
      {label: "Elements", path: "/master/elements"},
      {label: "Iron Type", path: "/master/iron-type"},
      {label: "Raw Materials", path: "/master/raw-materials"},
      {label: "Wires", path: "/master/wires"},
      {label: "element stock", path: "/master/element-stock"},

    ],
  },
  {
    label: "Production",
    icon: "factory",
    children: [
      { label: "Orders", path: "/production/orders" },
      { label: "Pouring", path: "/production/pouring" },
    ],
  },
  {
    label: "Inspection",
    icon: "inspect",
    children: [
      { label: "Quality checks", path: "/inspection/checks" },
      { label: "Defects", path: "/inspection/defects" },
    ],
  },
  { label: "Reports", icon: "reports", path: "/reports" },
  {
    label: "Admin",
    icon: "admin",
    children: [
      { label: "Users", path: "/admin/users" },
      { label: "Customers", path: "/admin/customers" },
      { label: "Suppliers", path: "/admin/suppliers" }
    ],
  },
];