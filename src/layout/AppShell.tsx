import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ScopeControls } from "../components/ScopeControls";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppContext } from "../context/AppContext";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/expenses", label: "Expenses" },
  { to: "/inventory", label: "Inventory" },
  { to: "/menu", label: "Menu Lab" },
  { to: "/labor", label: "Labor" },
  { to: "/catering", label: "Catering" },
  { to: "/reports", label: "Reports" },
];

export const AppShell = () => {
  const { data, effectiveScope, availableBusinesses, availableLocations } = useAppContext();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scopeLabel =
    effectiveScope.locationId !== "all"
      ? availableLocations.find((location) => location.id === effectiveScope.locationId)?.name
      : effectiveScope.businessId !== "all"
        ? availableBusinesses.find((business) => business.id === effectiveScope.businessId)?.name
        : data.portfolio.name;

  return (
    <div className="app-shell">
      <header className="floating-nav-bar">
        <div className="nav-brand-group" ref={navRef}>
          <button
            className={`brand-popout-trigger ${isNavOpen ? "is-active" : ""}`}
            onClick={() => setIsNavOpen((current) => !current)}
            aria-label="Toggle context scope"
          >
            <span className="brand-mark-bubble">GC</span>
            <div className="brand-text">
              <strong>{scopeLabel}</strong>
              <p>{data.portfolio.headquarters}</p>
            </div>
            <span className={`chevron ${isNavOpen ? "is-open" : ""}`}>
              <Icon name="chevronDown" width={16} height={16} />
            </span>
          </button>

          <AnimatePresence>
            {isNavOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="popout-scope-controls"
              >
                <ScopeControls />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="bubble-nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-bubble-link is-active" : "nav-bubble-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="nav-divider" />
          <ThemeToggle />
        </nav>
      </header>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};
