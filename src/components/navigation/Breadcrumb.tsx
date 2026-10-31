import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../utils/constants";

// Builds the labels from the menu, so group names show correctly
const getCrumbs = (pathname: string): string[] => {
  for (const item of NAV_ITEMS) {
    if (item.path === pathname) return [item.label];
    const child = item.children?.find((c) => c.path === pathname);
    if (child) return [item.label, child.label];
  }
  return [];
};

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const crumbs = getCrumbs(pathname);

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard">Home</Link>
      {crumbs.map((label, i) => (
        <span key={label}>
          <span className="crumb-sep">/</span>
          {i === crumbs.length - 1 ? (
            <span aria-current="page">{label}</span>
          ) : (
            <span>{label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}