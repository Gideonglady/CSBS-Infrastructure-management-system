import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, Eye, Bell, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Issue, IssueCategory, IssuePriority, IssueStatus } from '@/types';
import { generateSingleIssueReport, generateAllIssuesReport } from '@/utils/pdfGenerator';
import { getPendingApprovalCount } from '@/utils/approvalWorkflow';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import NotificationPopup from '@/components/NotificationPopup';
import useNotifications from '@/hooks/useNotifications';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<any>(null);

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

  // Load pending approvals count
  const loadPendingApprovals = () => {
    const count = getPendingApprovalCount();
    setPendingApprovalsCount(count);
  };

  useEffect(() => {
    loadIssues();
    loadPendingApprovals();
  }, []);

  // Show latest notification as popup
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      setLatestNotification(notifications[0]);
    }
  }, [notifications]);

  // Filter issues
  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        issue =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(issue => issue.location.type === locationFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, categoryFilter, priorityFilter, locationFilter]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case IssuePriority.CRITICAL:
        return 'bg-red-500 text-white';
      case IssuePriority.HIGH:
        return 'bg-orange-500 text-white';
      case IssuePriority.MEDIUM:
        return 'bg-yellow-500 text-white';
      case IssuePriority.LOW:
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedIssue(issue)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm line-clamp-2">{issue.title}</h4>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{issue.location.name}</span>
        </div>

        <div className="mt-2 pt-2 border-t flex justify-end">
          <span className="text-xs text-blue-600 hover:underline">View Details</span>
        </div>
      </CardContent>
    </Card>
  );

  const handleGenerateReport = (type: 'single' | 'all') => {
    if (type === 'single' && selectedIssue) {
      generateSingleIssueReport(selectedIssue);
    } else if (type === 'all') {
      generateAllIssuesReport(filteredIssues);
    }
    setShowReportDialog(false);
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
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage all infrastructure issues</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/approvals')}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Approvals
                {pendingApprovalsCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{pendingApprovalsCount}</Badge>
                )}
              </Button>
              <Button onClick={() => setShowReportDialog(true)}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
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
              <CardTitle className="text-lg">Equipment Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Projectors', value: 45, color: '#0088FE' },
                        { name: 'Computers', value: 120, color: '#00C49F' },
                        { name: 'Printers', value: 15, color: '#FFBB28' },
                        { name: 'Smart Boards', value: 25, color: '#FF8042' }
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
                        { name: 'Projectors', value: 45, color: '#0088FE' },
                        { name: 'Computers', value: 120, color: '#00C49F' },
                        { name: 'Printers', value: 15, color: '#FFBB28' },
                        { name: 'Smart Boards', value: 25, color: '#FF8042' }
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
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(IssueCategory).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.values(IssuePriority).map(pri => (
                    <SelectItem key={pri} value={pri}>{pri}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="classroom">Classrooms</SelectItem>
                  <SelectItem value="laboratory">Laboratories</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Issue Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending ({pendingIssues.length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {pendingIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {pendingIssues.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No pending issues</p>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  In Progress ({inProgressIssues.length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {inProgressIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {inProgressIssues.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No issues in progress</p>
              )}
            </div>
          </div>

          {/* Resolved Column */}
          <div>
            <Card className="mb-4 bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resolved ({resolvedIssues.length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {resolvedIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {resolvedIssues.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No resolved issues</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Issue Details Dialog */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedIssue.title}</DialogTitle>
              <DialogDescription>Issue ID: {selectedIssue.id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Priority</p>
                  <Badge className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Category</p>
                  <p className="text-sm">{selectedIssue.category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Reporter</p>
                  <p className="text-sm">{selectedIssue.reporterName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
                <p className="text-sm">{selectedIssue.description}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Location</p>
                <p className="text-sm">
                  {selectedIssue.location.name} - {selectedIssue.location.building}
                  {selectedIssue.location.floor && `, Floor ${selectedIssue.location.floor}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Created</p>
                  <p className="text-sm">{format(new Date(selectedIssue.createdAt), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Updated</p>
                  <p className="text-sm">{format(new Date(selectedIssue.updatedAt), 'PPpp')}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
              <Button onClick={() => {
                generateSingleIssueReport(selectedIssue);
                setSelectedIssue(null);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Generation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Choose the type of report you want to generate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleGenerateReport('all')}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report for All Issues ({filteredIssues.length} issues)
            </Button>

            {selectedIssue && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleGenerateReport('single')}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Report for Selected Issue
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
