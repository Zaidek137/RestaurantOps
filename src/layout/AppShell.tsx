import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ScopeControls } from "../components/ScopeControls";
import { useAppContext } from "../context/AppContext";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/expenses", label: "Expenses" },
  { to: "/inventory", label: "Inventory" },
  { to: "/menu", label: "Menu Lab" },
  { to: "/labor", label: "Labor" },
];

export const AppShell = () => {
  const {
    data,
    effectiveScope,
    availableBusinesses,
    availableLocations,
    lastSavedAt,
    resetOfflineData,
  } = useAppContext();

  const scopeLabel =
    effectiveScope.locationId !== "all"
      ? availableLocations.find((location) => location.id === effectiveScope.locationId)?.name
      : effectiveScope.businessId !== "all"
        ? availableBusinesses.find((business) => business.id === effectiveScope.businessId)?.name
        : data.portfolio.name;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">GC</span>
          <div>
            <strong>{data.portfolio.name}</strong>
            <p>{data.portfolio.headquarters}</p>
          </div>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "sidebar__link is-active" : "sidebar__link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <p>Offline-ready local cache</p>
          <strong>{scopeLabel}</strong>
          <span className="sidebar__timestamp">Saved {new Date(lastSavedAt).toLocaleString()}</span>
          <button className="button-secondary sidebar__reset" type="button" onClick={resetOfflineData}>
            Reset local demo data
          </button>
        </div>
      </aside>
      <main className="content-area">
        <motion.div
          className="hero-strip"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hero-strip__copy">
            <span className="hero-strip__eyebrow">Portfolio operations cockpit</span>
            <h2>Ginger Cafe and Coco Cabana performance, costs, menus, and labor in one mobile-ready surface.</h2>
          </div>
          <ScopeControls />
        </motion.div>
        <Outlet />
      </main>
    </div>
  );
};
