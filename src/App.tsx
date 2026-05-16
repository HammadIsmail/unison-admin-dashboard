import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/Login";
import DashboardHome from "@/pages/DashboardHome";
import PendingAccountsPage from "@/pages/PendingAccounts";
import AlumniPage from "@/pages/AlumniPage";
import StudentsPage from "@/pages/StudentsPage";
import OpportunitiesPage from "@/pages/OpportunitiesPage";
import OpportunityDetailPage from "@/pages/OpportunityDetail";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NetworkAnalytics from "@/pages/NetworkAnalytics";
import AdminOpportunitiesPage from "@/pages/AdminOpportunities";
import NotFound from "@/pages/NotFound";
import UpgradeRequestsPage from "@/pages/UpgradeRequestsPage";
import MembersPage from "@/pages/MembersPage";
import EventsPage from "@/pages/EventsPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import RecoveryPage from "@/pages/RecoveryPage";
import StaffManagementPage from "@/pages/StaffManagement";
import ProfileSettingsPage from "@/pages/ProfileSettings.tsx";
import { type ReactNode } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
      <Route path="/pending" element={<ProtectedRoute><PendingAccountsPage /></ProtectedRoute>} />
      <Route path="/upgrades" element={<ProtectedRoute><UpgradeRequestsPage /></ProtectedRoute>} />
      <Route path="/alumni" element={<ProtectedRoute><AlumniPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/recovery" element={<AdminRoute><RecoveryPage /></AdminRoute>} />
      <Route path="/staff" element={<AdminRoute><StaffManagementPage /></AdminRoute>} />
      <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
      <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetailPage /></ProtectedRoute>} />
      <Route path="/admin/opportunities" element={<ProtectedRoute><AdminOpportunitiesPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
      <Route path="/network-analytics" element={<AdminRoute><NetworkAnalytics /></AdminRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
