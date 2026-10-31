import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/Navbar";
import "../assets/styles/layout.css";

const MOBILE_QUERY = "(max-width: 860px)";
const STORAGE_KEY = "sidebar_collapsed";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
};

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function DashboardLayout() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const saveCollapsed = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // storage unavailable, ignore
    }
  };

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
    } else {
      saveCollapsed(!collapsed);
    }
  };

  const desktopCollapsed = collapsed && !isMobile;

  return (
    <div className={`shell ${desktopCollapsed ? "collapsed" : ""}`}>
      <Sidebar
        collapsed={desktopCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onExpand={() => saveCollapsed(false)}
      />
      <div className="main">
        <Navbar onToggle={handleToggle} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}