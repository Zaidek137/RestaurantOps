import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import { DashboardPage } from "../features/DashboardPage";
import { ExpensesPage } from "../features/ExpensesPage";
import { InventoryPage } from "../features/InventoryPage";
import { LaborPage } from "../features/LaborPage";
import { MenuPage } from "../features/MenuPage";
import { AppShell } from "../layout/AppShell";

export const App = () => (
  <AppProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/labor" element={<LaborPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AppProvider>
);
