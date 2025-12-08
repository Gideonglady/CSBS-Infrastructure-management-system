import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuditProvider } from "@/contexts/AuditContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout/Layout";
// import Index from "./pages/Index"; // Removed - Login is now the default page
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardSimple from "./pages/Dashboard-simple";
import DigitalRegistersHome from "./pages/DigitalRegisters/DigitalRegistersHome";
import Classrooms from "./pages/DigitalRegisters/Classrooms";
import Laboratories from "./pages/DigitalRegisters/Laboratories";
import IssueReporting from "./pages/IssueReporting";

import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIssueManagement from "./pages/AdminIssueManagement";
import UserManagement from "./pages/UserManagement";
import MyIssues from "./pages/MyIssues";
import MyIssuesTest from "./pages/MyIssues-test";
import MyIssuesSimple from "./pages/MyIssues-simple";
import PendingApprovals from "./pages/PendingApprovals";
import EquipmentTransfer from "./pages/EquipmentTransfer";
import NotFound from "./pages/NotFound";
import { UserRole } from "@/types/auth";
import { useNotifications } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

// Issue Management Landing Page Component
const IssueManagementLanding = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name || 'User'}</h1>
        <p className="text-gray-600">Start from your issue list, then jump to reporting or notifications as needed.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/my-issues')}
          className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-muted/40 cursor-pointer"
        >
          <h2 className="text-lg font-semibold mb-2">My Issues</h2>
          <p className="text-gray-600 mb-4">This view opens by default so you can immediately track progress.</p>
          <Button variant="secondary" className="w-full">
            Open Full View
          </Button>
        </div>
        <div
          onClick={() => navigate('/issues/report')}
          className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <h2 className="text-lg font-semibold mb-2">Report an Issue</h2>
          <p className="text-gray-600 mb-4">Found a new problem? Capture details and submit a ticket.</p>
          <Button className="w-full">
            Report Issue
          </Button>
        </div>
        <div
          onClick={() => navigate('/notifications')}
          className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Badge>{unreadCount}</Badge>
          </div>
          <p className="text-gray-600 mb-4">Get alerted whenever a status changes so you never miss an update.</p>
          <Button variant="outline" className="w-full">
            View Notifications
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold mb-1">My Issues</h3>
          <p className="text-gray-600">Recent issues you raised are listed below. Status updates appear instantly.</p>
        </div>
        <div className="p-6">
          <MyIssues />
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <AuditProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/register" element={<Register />} />
                {/* General Dashboard */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Digital Registers */}
                <Route path="/registers" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.FACULTY, UserRole.NON_TEACHING_STAFF, UserRole.LAB_TECHNICIAN]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/registers/classrooms" replace />} />
                  <Route path="classrooms" element={<Classrooms />} />
                  <Route path="labs" element={<Laboratories />} />
                </Route>

                {/* Issue Management - Class Rep, Faculty, Lab Tech */}
                <Route path="/issues" element={
                  <ProtectedRoute allowedRoles={[UserRole.CLASS_REP, UserRole.FACULTY, UserRole.LAB_TECHNICIAN]}>
                    <Layout>
                      <IssueManagementLanding />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/issues/report" element={
                  <ProtectedRoute allowedRoles={[UserRole.CLASS_REP, UserRole.FACULTY, UserRole.LAB_TECHNICIAN]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<IssueReporting />} />
                </Route>

                <Route path="/my-issues" element={
                  <ProtectedRoute allowedRoles={[UserRole.CLASS_REP, UserRole.FACULTY, UserRole.LAB_TECHNICIAN]}>
                    <Layout>
                      <MyIssues />
                    </Layout>
                  </ProtectedRoute>
                } />



                {/* Notifications */}
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Notifications />} />
                </Route>

                {/* Audit Log - Removed */}

                {/* Admin Only Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="issues" element={<AdminIssueManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="approvals" element={<PendingApprovals />} />
                </Route>

                {/* Equipment Transfer */}
                <Route path="/equipment-transfer" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.LAB_TECHNICIAN, UserRole.NON_TEACHING_STAFF]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<EquipmentTransfer />} />
                </Route>

                {/* Faculty Routes */}
                <Route path="/faculty/*" element={
                  <ProtectedRoute allowedRoles={[UserRole.FACULTY, UserRole.ADMIN]}>
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="issues" element={<div>Faculty Issues</div>} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Error Routes */}
                <Route path="/unauthorized" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                      <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                  </div>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuditProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider >
);

export default App;
