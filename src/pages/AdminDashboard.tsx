import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, Eye, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Issue, IssueCategory, IssueStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import NotificationPopup from '@/components/NotificationPopup';
import useNotifications from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [labStats, setLabStats] = useState<any[]>([]);

  // Load lab stats
  useEffect(() => {
    const loadLabStats = async () => {
      try {
        const { labSystemAPI } = await import('@/services/api');
        const response: any = await labSystemAPI.getLabsSummary();
        if (response && response.success && response.data) {
          const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#a4c8e0'];
          
          const nameMapping: { [key: string]: string } = {
            'Agile Software Engineering Lab': 'Agile',
            'Integrated Business Application Lab': 'IBA',
            'Integrated Business Environment Lab': 'IBA', // Handling user's variation just in case
            'Smart and Secure Environment Lab': 'SSE'
          };

          const formattedStats = response.data
            .filter((lab: any) => !lab.labName.toLowerCase().includes('office')) // Remove CSBS Dept Office
            .map((lab: any, index: number) => ({
              name: nameMapping[lab.labName] || lab.labName, // Use shortform or original
              value: lab.systemCount,
              color: COLORS[index % COLORS.length]
            }));
            
          setLabStats(formattedStats);
        }
      } catch (error) {
        console.error('Error loading lab stats:', error);
      }
    };
    loadLabStats();
  }, []);

  const { notifications, unreadCount, markAsRead } = useNotifications('admin');

  // Load issues from MongoDB API
  const loadIssues = async () => {
    try {
      // Import the issueAPI
      const { issueAPI } = await import('@/services/api');

      // Fetch all issues from API
      const response: any = await issueAPI.getAll();

      if (response && response.success !== false && response.data) {
        setIssues(response.data);
        setFilteredIssues(response.data);
      } else {
        setIssues([]);
        setFilteredIssues([]);
      }
    } catch (error) {
      console.error('Error loading issues from API:', error);
      setIssues([]);
      setFilteredIssues([]);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  // Show latest notification as popup
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      setLatestNotification(notifications[0]);
    }
  }, [notifications]);

  // Set filtered issues to all issues (no filtering in dashboard)
  useEffect(() => {
    setFilteredIssues(issues);
  }, [issues]);

  // Group issues by status
  const pendingIssues = filteredIssues.filter(i => i.status === IssueStatus.PENDING);
  const inProgressIssues = filteredIssues.filter(i => i.status === IssueStatus.IN_PROGRESS);
  const resolvedIssues = filteredIssues.filter(i => i.status === IssueStatus.RESOLVED || i.status === IssueStatus.CLOSED);

  const getStatusColor = (status: string) => {
    switch (status) {
      case IssueStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case IssueStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case IssueStatus.RESOLVED:
      case IssueStatus.CLOSED:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };





  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Notification Popup */}
      {latestNotification && (
        <NotificationPopup
          notification={latestNotification}
          onClose={() => setLatestNotification(null)}
          onRead={markAsRead}
        />
      )}

      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Admin'}</h1>
              <p className="text-sm text-muted-foreground">Manage all infrastructure issues</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Issue Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: issues.filter(i => i.status === 'pending').length, color: '#fbbf24' },
                        { name: 'In Progress', value: issues.filter(i => i.status === 'in_progress').length, color: '#3b82f6' },
                        { name: 'Resolved', value: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length, color: '#22c55e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ value }) => value}
                    >
                      {[
                        { name: 'Pending', value: issues.filter(i => i.status === 'pending').length, color: '#fbbf24' },
                        { name: 'In Progress', value: issues.filter(i => i.status === 'in_progress').length, color: '#3b82f6' },
                        { name: 'Resolved', value: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length, color: '#22c55e' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Student Strength Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Students per Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '1st Year', value: 450, color: '#8884d8' },
                        { name: '2nd Year', value: 420, color: '#82ca9d' },
                        { name: '3rd Year', value: 380, color: '#ffc658' },
                        { name: '4th Year', value: 350, color: '#ff7300' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ value }) => value}
                    >
                      {[
                        { name: '1st Year', value: 450, color: '#8884d8' },
                        { name: '2nd Year', value: 420, color: '#82ca9d' },
                        { name: '3rd Year', value: 380, color: '#ffc658' },
                        { name: '4th Year', value: 350, color: '#ff7300' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Availability Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Systems by Lab</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={labStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ value }) => value}
                    >
                      {labStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issue Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Card */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600">{pendingIssues.length}</div>
              <p className="text-sm text-gray-600 mt-2">Issues awaiting action</p>
            </CardContent>
          </Card>

          {/* In Progress Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{inProgressIssues.length}</div>
              <p className="text-sm text-gray-600 mt-2">Issues being worked on</p>
            </CardContent>
          </Card>

          {/* Resolved Card */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{resolvedIssues.length}</div>
              <p className="text-sm text-gray-600 mt-2">Issues completed</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
