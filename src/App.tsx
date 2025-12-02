import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuditProvider } from "@/contexts/AuditContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardSimple from "./pages/Dashboard-simple";
import DigitalRegisters from "./pages/DigitalRegisters";
import IssueReporting from "./pages/IssueReporting";

import Notifications from "./pages/Notifications";
import AuditLog from "./pages/AuditLog";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIssueManagement from "./pages/AdminIssueManagement";
import MyIssues from "./pages/MyIssues";
import MyIssuesTest from "./pages/MyIssues-test";
import MyIssuesSimple from "./pages/MyIssues-simple";
import PendingApprovals from "./pages/PendingApprovals";
import EquipmentTransfer from "./pages/EquipmentTransfer";
import NotFound from "./pages/NotFound";
import { UserRole } from "@/types/auth";

const queryClient = new QueryClient();

// Issue Management Landing Page Component
const IssueManagementLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Issue Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Report an Issue</h2>
          <p className="text-gray-600 mb-4">Report infrastructure issues, equipment problems, or maintenance needs.</p>
          <Button onClick={() => navigate('/issues/report')} className="w-full">
            Report Issue
          </Button>
        </div>
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">My Issues</h2>
          <p className="text-gray-600 mb-4">Track the status of your reported issues and view updates.</p>
          <Button onClick={() => navigate('/my-issues')} variant="outline" className="w-full">
            View My Issues
          </Button>
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
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                </Route>

                {/* Digital Registers */}
                <Route path="/registers" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.FACULTY, UserRole.NON_TEACHING_STAFF, UserRole.LAB_TECHNICIAN]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route path="*" element={<DigitalRegisters />} />
                </Route>

                {/* Issue Management */}
                <Route path="/issues" element={
                  <ProtectedRoute>
                    <Layout>
                      <IssueManagementLanding />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/issues/report" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<IssueReporting />} />
                </Route>

                <Route path="/my-issues" element={
                  <ProtectedRoute>
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

                {/* Audit Log */}
                <Route path="/audit-log" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AuditLog />} />
                </Route>

                {/* Admin Only Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="issues" element={<AdminIssueManagement />} />
                  <Route path="approvals" element={<PendingApprovals />} />
                  <Route path="users" element={<div>User Management</div>} />
                  <Route path="settings" element={<div>Admin Settings</div>} />
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
