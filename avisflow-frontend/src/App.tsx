import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { I18nProvider } from "@/lib/i18n";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import BusinessDetail from "@/pages/BusinessDetail";
import ReviewPage from "@/pages/ReviewPage";
import AdminPanel from "@/pages/AdminPanel";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import VerifyEmail from "@/pages/VerifyEmail";
import ErrorBoundary from "@/components/ErrorBoundary";

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: any }) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children, user }: { children: React.ReactNode; user: any }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <I18nProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", padding: "12px 16px", fontSize: "14px" },
          }}
        />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register onLogin={login} />} />
          <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user} onLogout={logout} /></ProtectedRoute>} />
          <Route path="/business/:id" element={<ProtectedRoute user={user}><BusinessDetail /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute user={user}><AdminPanel /></AdminRoute>} />
          <Route path="/review/:slug" element={<ReviewPage />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
    </ErrorBoundary>
  );
}
