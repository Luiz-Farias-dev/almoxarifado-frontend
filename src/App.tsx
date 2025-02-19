import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import AddProductPage from "./components/addProducToCatalog/AddProduct";
import AddEmployeePage from "./components/addEmployee/AddEmployee";
import { ArrivalProductsPage } from "./components/arrivalProducts/ArrivalProducts";
import { InventoryAccuracyPage } from "./components/inventoryAccuracy/InventoryAccuracy";
import { CatalogPage } from "./components/catalog/Catalog"
import { WaitListPage } from "./components/waitList/WaitList";
import GenerateReportPage from "./components/generateReport/GenerateReport";
import HomePage from "./components/Home";
import NotFoundPage from "./components/NotFoundPage";
import LoginPage from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";

// Run Vite
// npm run dev

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para login */}
        <Route path="/login" element={<LoginPage />} />
        {/* Rotas protegidas */}
        <Route
          path="/"
          element={<PrivateRoute element={<HomePage />} />}
        />
        <Route
          path="/cadastrar-funcionario"
          element={<PrivateRoute element={<AddEmployeePage />} />}
        />
        <Route
          path="/adicionar-produto"
          element={<PrivateRoute element={<AddProductPage />} />}
        />
        <Route
          path="/catalogo"
          element={<PrivateRoute element={<CatalogPage />} />}
        />
        <Route
          path="/lista-espera"
          element={<PrivateRoute element={<WaitListPage />} />}
        />
        <Route
          path="/chegada-produtos"
          element={<PrivateRoute element={<ArrivalProductsPage />} />}
        />
        <Route
          path="/acuracia-estoque"
          element={<PrivateRoute element={<InventoryAccuracyPage />} />}
        />
        <Route
          path="/gerar-relatorio"
          element={<PrivateRoute element={<GenerateReportPage />} />}
        />
        {/* Rota para página não encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App
