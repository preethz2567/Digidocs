import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ui/ToastContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Documents from "./pages/Documents";
import { SharedDocument } from "./pages/SharedDocument";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/share/:token" element={<SharedDocument />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Documents />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChangePassword />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ToastProvider>
  );
}

export default App;