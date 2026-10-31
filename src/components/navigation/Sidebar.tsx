import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../utils/constants";
import type { NavItem } from "../../utils/constants";
import Icon from "../common/Icon";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onExpand: () => void;
};

const groupIsActive = (item: NavItem, pathname: string) =>
  item.children?.some((c) => pathname.startsWith(c.path)) ?? false;

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onExpand,
}: Props) {
  const { pathname } = useLocation();

  // Open the group that matches the current page when the app loads
  const [openGroup, setOpenGroup] = useState<string | null>(
    () => NAV_ITEMS.find((i) => groupIsActive(i, pathname))?.label ?? null
  );

  const handleGroupClick = (label: string) => {
    if (collapsed) {
      // In the icon rail, clicking a group opens the sidebar first
      onExpand();
      setOpenGroup(label);
      return;
    }
    setOpenGroup((current) => (current === label ? null : label));
  };

  return (
    <>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="logo">
            <span className="logo-text">Melting</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            if (!item.children) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path ?? "/dashboard"}
                  className="nav-item"
                  title={collapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                >
                  <Icon name={item.icon} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              );
            }

            const isOpen = openGroup === item.label && !collapsed;

            return (
              <div key={item.label} className={`nav-group ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className={`nav-item ${groupIsActive(item, pathname) ? "has-active" : ""}`}
                  onClick={() => handleGroupClick(item.label)}
                  aria-expanded={isOpen}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon name={item.icon} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  <Icon name="chevron" size={16} className="nav-chevron" />
                </button>

                <div className="nav-sub">
                  <div className="nav-sub-inner">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className="nav-sub-link"
                        onClick={onCloseMobile}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {mobileOpen && <div className="backdrop" onClick={onCloseMobile} />}
    </>
  );
}