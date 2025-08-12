import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useEnhancedTeamStore } from "@/stores/enhancedTeamStore";
import Navbar from "@/components/Layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatAI from "./pages/ChatAI";
import EnhancedChat from "./pages/EnhancedChat";
import Settings from "./pages/Settings";
import Markets from "./pages/Markets";
import Blog from "./pages/Blog";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import About from "./pages/About";
import TeamDetail from "./pages/TeamDetail";
import TeamDashboard from "./pages/TeamDashboard";
import FloatingNotifications from "@/components/FloatingNotifications";
import { debugSupabase } from "@/utils/debug";

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

const App = () => {
  const { initialize, user } = useAuthStore();
  const { initializeTheme } = useThemeStore();
  const { fetchUserProfile } = useEnhancedTeamStore();

  useEffect(() => {
    initialize();
    initializeTheme();
  }, [initialize, initializeTheme]);

  useEffect(() => {
    if (user) {
      fetchUserProfile().catch((error) => {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Error in App fetchUserProfile:', {
          message: errorMessage,
          error
        });
      });

      // Debug table existence in development
      if (process.env.NODE_ENV === 'development') {
        debugSupabase.checkAllTables();
      }
    }
  }, [user, fetchUserProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main>
              {/* Original floating notifications for general app notifications */}
              <FloatingNotifications />
              
              
              <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
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
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
