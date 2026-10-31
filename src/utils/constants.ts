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
      { label: "Roles & permissions", path: "/admin/roles" },
      { label: "Settings", path: "/admin/settings" },
    ],
  },
];