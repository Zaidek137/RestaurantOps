import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Panel } from "../components/Panel";
import { AppProvider } from "../context/AppContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AppShell } from "../layout/AppShell";

const DashboardPage = lazy(() =>
  import("../features/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const ExpensesPage = lazy(() =>
  import("../features/ExpensesPage").then((module) => ({ default: module.ExpensesPage })),
);
const InventoryPage = lazy(() =>
  import("../features/InventoryPage").then((module) => ({ default: module.InventoryPage })),
);
const LaborPage = lazy(() =>
  import("../features/LaborPage").then((module) => ({ default: module.LaborPage })),
);
const MenuPage = lazy(() =>
  import("../features/MenuPage").then((module) => ({ default: module.MenuPage })),
);
const CateringPage = lazy(() =>
  import("../features/CateringPage").then((module) => ({ default: module.CateringPage })),
);
const ReportsPage = lazy(() =>
  import("../features/ReportsPage").then((module) => ({ default: module.ReportsPage })),
);

const RouteFallback = () => (
  <div className="page-content">
    <Panel title="Loading workspace" subtitle="Preparing the selected operations view." />
  </div>
);

export const App = () => (
  <ThemeProvider>
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/labor" element={<LaborPage />} />
              <Route path="/catering" element={<CateringPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  </ThemeProvider>
);
