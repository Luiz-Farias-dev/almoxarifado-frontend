import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import AddProductPage from "./components/addProducToCatalog/AddProduct";
import { ArrivalProductsPage } from "./components/arrivalProducts/ArrivalProducts";
import { CatalogPage } from "./components/catalog/Catalog"
import { WaitListPage } from "./components/waitList/WaitList";
import GenerateReportPage from "./components/generateReport/GenerateReport";
import MainPage from "./components/MainPage";
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
        {/* Rota para página inicial */}
        <Route path="/" element={<MainPage />} />
        {/* Rota para login */}
        <Route path="/almoxarifado/login" element={<LoginPage />} />
        {/* Rota privada para produtos */}
        <Route path="/login" element={<LoginPage />} />
        {/* Rotas protegidas */}
        <Route
          path="/almoxarifado"
          element={<PrivateRoute element={<HomePage />} />}
        />
        <Route
          path="/almoxarifado/adicionar"
          element={<PrivateRoute element={<AddProductPage />} />}
        />
        <Route
          path="/almoxarifado/catalogo"
          element={<PrivateRoute element={<CatalogPage />} />}
        />
        <Route
          path="/almoxarifado/lista-espera"
          element={<PrivateRoute element={<WaitListPage />} />}
        />
        <Route
          path="/almoxarifado/chegada-produtos"
          element={<PrivateRoute element={<ArrivalProductsPage />} />}
        />
        <Route
          path="/almoxarifado/gerar-relatorio"
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
