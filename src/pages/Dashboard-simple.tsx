import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Eye
} from 'lucide-react';

const DashboardSimple: React.FC = () => {
  // Mock data - replace with actual API calls
  const stats = {
    totalIssues: 24,
    pendingIssues: 8,
    resolvedIssues: 14,
    inProgressIssues: 2,
    totalClassrooms: 45,
    totalLabs: 12,
    totalUsers: 156,
    avgResolutionTime: '2.5 days'
  };

  const recentIssues = [
    {
      id: '1',
      title: 'Projector not working in Room 101',
      priority: 'high',
      status: 'pending',
      reporter: 'Dr. Smith',
      location: 'Room 101 - Computer Lab',
      createdAt: '2 hours ago'
    },
    {
      id: '4',
      title: 'Leaking faucet in Chemistry Lab',
      priority: 'medium',
      status: 'pending',
      reporter: 'Lab Tech Sarah',
      location: 'Chemistry Lab - Building A',
      createdAt: '3 hours ago'
    },
    {
      id: '2',
      title: 'Air conditioning malfunction in Chemistry Lab',
      priority: 'medium',
      status: 'in_progress',
      reporter: 'Lab Tech Johnson',
      location: 'Chemistry Lab - Building A',
      createdAt: '4 hours ago'
    },
    {
      id: '5',
      title: 'Network switch failure in Server Room',
      priority: 'high',
      status: 'in_progress',
      reporter: 'IT Admin Mike',
      location: 'Server Room - Main Block',
      createdAt: '5 hours ago'
    },
    {
      id: '3',
      title: 'Broken chair in Lecture Hall 2',
      priority: 'low',
      status: 'resolved',
      reporter: 'Student Rep Martinez',
      location: 'Lecture Hall 2',
      createdAt: '1 day ago'
    },
    {
      id: '6',
      title: 'Whiteboard replacement needed',
      priority: 'low',
      status: 'resolved',
      reporter: 'Prof. Davis',
      location: 'Room 203 - Building B',
      createdAt: '2 days ago'
    }
  ];

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
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Admin User!
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your infrastructure today.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1 bg-white text-blue-600">
            Administrator
          </Badge>
        </div>
      </div>

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
              +2 from last week
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
              +4 this week
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
              -0.5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

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
                  Pending ({recentIssues.filter(i => i.status === 'pending').length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3">
              {recentIssues.filter(i => i.status === 'pending').map(issue => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                            {issue.priority}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{issue.location}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{issue.reporter}</span>
                      <span>{issue.createdAt}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  In Progress ({recentIssues.filter(i => i.status === 'in_progress').length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3">
              {recentIssues.filter(i => i.status === 'in_progress').map(issue => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                            {issue.priority}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{issue.location}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{issue.reporter}</span>
                      <span>{issue.createdAt}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resolved Column */}
          <div>
            <Card className="mb-4 bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resolved ({recentIssues.filter(i => i.status === 'resolved').length})
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="space-y-3">
              {recentIssues.filter(i => i.status === 'resolved').map(issue => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                            {issue.priority}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{issue.location}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{issue.reporter}</span>
                      <span>{issue.createdAt}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 text-xs">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;
