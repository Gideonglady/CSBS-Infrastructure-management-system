import React, { useState, useEffect } from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserRole } from '@/types/auth';

const Dashboard: React.FC = () => {
  const { user, getRoleDisplayName, getRoleColor } = useRoleAccess();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load issues from API
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const { issueAPI } = await import('@/services/api');
        const response: any = await issueAPI.getAll();

        if (response && response.success !== false && response.data) {
          setIssues(response.data);
        }
      } catch (error) {
        console.error('Error loading issues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  // Calculate stats from real data
  const stats = {
    totalIssues: issues.length,
    pendingIssues: issues.filter(i => i.status === 'pending').length,
    resolvedIssues: issues.filter(i => i.status === 'resolved').length,
    inProgressIssues: issues.filter(i => i.status === 'in_progress').length,
    // These would ideally come from another API, keeping static for now or deriving if possible
    totalClassrooms: 45,
    totalLabs: 12,
    totalUsers: 156,
    avgResolutionTime: '2.5 days'
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <TrendingUp className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Total reported issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingIssues}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              Estimated time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific content */}
      {/* All Issues */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending ({issues.filter(i => i.status === 'pending').length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {issues.filter(i => i.status === 'pending').map(issue => (
                <Card key={issue._id || issue.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{issue.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {issue.location?.name}
                      {issue.location?.building && ` - ${issue.location.building}`}
                    </p>
                    <div className="mt-2 pt-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {issues.filter(i => i.status === 'pending').length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No pending issues</p>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  In Progress ({issues.filter(i => i.status === 'in_progress').length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {issues.filter(i => i.status === 'in_progress').map(issue => (
                <Card key={issue._id || issue.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{issue.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {issue.location?.name}
                      {issue.location?.building && ` - ${issue.location.building}`}
                    </p>
                    <div className="mt-2 pt-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {issues.filter(i => i.status === 'in_progress').length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No issues in progress</p>
              )}
            </div>
          </div>

          {/* Resolved Column */}
          <div>
            <Card className="mb-4 bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resolved ({issues.filter(i => i.status === 'resolved').length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {issues.filter(i => i.status === 'resolved').map(issue => (
                <Card key={issue._id || issue.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{issue.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {issue.location?.name}
                      {issue.location?.building && ` - ${issue.location.building}`}
                    </p>
                    <div className="mt-2 pt-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {issues.filter(i => i.status === 'resolved').length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No resolved issues</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issue Details Dialog */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedIssue.title}</DialogTitle>
              <DialogDescription>Issue ID: {selectedIssue._id || selectedIssue.id}</DialogDescription>
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
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Location</p>
                <p className="text-sm">
                  {selectedIssue.location?.name}
                  {selectedIssue.location?.building && ` - ${selectedIssue.location.building}`}
                  {selectedIssue.location?.floor && `, Floor ${selectedIssue.location.floor}`}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Reporter</p>
                <p className="text-sm">{selectedIssue.reporterName || selectedIssue.reporter}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Reported At</p>
                <p className="text-sm">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedIssue(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
