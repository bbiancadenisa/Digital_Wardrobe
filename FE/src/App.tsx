import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import MainLayout from "./pages/common/Layout/MainLayout";
import ProtectedRoute from "./pages/common/ProtectedRoute";
import LoginPage from "./pages/LoginPage/LoginPage";
import Authentication from "./pages/AuthenticationPage/Authentication";
import HomePage from "./pages/HomePage/HomePage";
import AddOutfitPage from "./pages/AddOutfitPage/AddOutfitPage";
import OutfitsPage from "./pages/OutfitsPage/OutfitsPage";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage";
import WardrobePage from "./pages/WardrobePage/WardrobePage";
import AddGarmentPage from "./pages/AddGarmentPage/AddGarmentPage";
import OutfitDetailsPage from "./pages/OutfitDetailsPage/OutfitDetailsPage";
import EditGarmentPage from "./pages/EditGarmentPage/EditGarmentPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<Authentication />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="/add-outfit" element={<AddOutfitPage />} />
            <Route path="/outfits" element={<OutfitsPage />} />
            <Route path="/outfits/:id" element={<OutfitDetailsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/wardrobe/edit/:id" element={<EditGarmentPage />} />
            <Route path="/add-garment" element={<AddGarmentPage />} />
            <Route path="/profile" element={<div>Profile</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
