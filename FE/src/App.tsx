import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import AddGarmentPage from "./pages/AddGarmentPage/AddGarmentPage";
import AddOutfitPage from "./pages/AddOutfitPage/AddOutfitPage";
import Authentication from "./pages/AuthenticationPage/Authentication";
import MainLayout from "./pages/common/Layout/MainLayout";
import ProtectedRoute from "./pages/common/ProtectedRoute";
import EditGarmentPage from "./pages/EditGarmentPage/EditGarmentPage";
import EditOutfitPage from "./pages/EditOutfitPage/EditOutfitPage";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import OutfitDetailsPage from "./pages/OutfitDetailsPage/OutfitDetailsPage";
import OutfitsPage from "./pages/OutfitsPage/OutfitsPage";
import RecommendedPage from "./pages/RecommendedPage/RecommendedPage";
import WardrobePage from "./pages/WardrobePage/WardrobePage";

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
            <Route path="/outfits/:id/edit" element={<EditOutfitPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/wardrobe/edit/:id" element={<EditGarmentPage />} />
            <Route path="/add-garment" element={<AddGarmentPage />} />
            <Route path="/recommended" element={<RecommendedPage />} />
            <Route path="/profile" element={<div>Profile</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
