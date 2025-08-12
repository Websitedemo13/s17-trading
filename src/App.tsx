import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useAdminStore } from "@/stores/adminStore";
import { useThemeStore } from "@/stores/themeStore";
import { initializeI18n } from "@/stores/i18nStore";
import Navbar from "@/components/Layout/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load components to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Teams = lazy(() => import("./pages/Teams"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ChatAI = lazy(() => import("./pages/ChatAI"));
const EnhancedChat = lazy(() => import("./pages/EnhancedChat"));
const Settings = lazy(() => import("./pages/Settings"));
const Markets = lazy(() => import("./pages/Markets"));
const Blog = lazy(() => import("./pages/Blog"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const TeamDetail = lazy(() => import("./pages/TeamDetail"));
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));
const FloatingNotifications = lazy(() => import("@/components/FloatingNotifications"));

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const { initialize, user } = useAuthStore();
  const { isAdmin } = useAdminStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeApp = async () => {
      try {
        unsubscribe = initialize();
        initializeTheme();
        initializeI18n();
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Remove dependencies to prevent infinite loops

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <ErrorBoundary fallback={<div className="p-4 text-center text-red-600">Lỗi tải navigation</div>}>
                <Navbar />
              </ErrorBoundary>
              <main>
                <ErrorBoundary fallback={<div className="p-4 text-center text-yellow-600">Lỗi tải thông báo</div>}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <FloatingNotifications />
                  </Suspense>
                </ErrorBoundary>

                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                <Route path="/" element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute>
                      <Teams />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId"
                  element={
                    <ProtectedRoute>
                      <TeamDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/:teamId/detail"
                  element={
                    <ProtectedRoute>
                      <TeamDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <EnhancedChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat-ai"
                  element={
                    <ProtectedRoute>
                      <ChatAI />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/markets"
                  element={
                    <ProtectedRoute>
                      <Markets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <ProtectedRoute>
                      <Blog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
