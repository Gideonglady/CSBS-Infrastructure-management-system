import React, { useState } from 'react';
import { Download, Filter, Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const Analytics = () => {
  const { canViewAnalytics } = useRoleAccess();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('issues');

  // Mock data - replace with actual API calls
  const issuesOverTime = [
    { date: '2024-01-01', reported: 12, resolved: 8, pending: 4 },
    { date: '2024-01-02', reported: 15, resolved: 10, pending: 5 },
    { date: '2024-01-03', reported: 8, resolved: 12, pending: 1 },
    { date: '2024-01-04', reported: 20, resolved: 15, pending: 6 },
    { date: '2024-01-05', reported: 10, resolved: 8, pending: 8 },
    { date: '2024-01-06', reported: 18, resolved: 16, pending: 10 },
    { date: '2024-01-07', reported: 14, resolved: 12, pending: 12 }
  ];

  const issuesByCategory = [
    { name: 'Equipment', value: 45, color: '#8884d8' },
    { name: 'Infrastructure', value: 30, color: '#82ca9d' },
    { name: 'Safety', value: 15, color: '#ffc658' },
    { name: 'Cleanliness', value: 7, color: '#ff7300' },
    { name: 'Security', value: 3, color: '#ff0000' }
  ];

  const issuesByPriority = [
    { priority: 'Low', count: 25, resolved: 20, pending: 5 },
    { priority: 'Medium', count: 35, resolved: 28, pending: 7 },
    { priority: 'High', count: 20, resolved: 15, pending: 5 },
    { priority: 'Critical', count: 8, resolved: 6, pending: 2 }
  ];

  const resolutionTimeData = [
    { category: 'Equipment', avgTime: 2.5, targetTime: 3.0 },
    { category: 'Infrastructure', avgTime: 4.2, targetTime: 5.0 },
    { category: 'Safety', avgTime: 1.8, targetTime: 2.0 },
    { category: 'Cleanliness', avgTime: 1.2, targetTime: 1.5 },
    { category: 'Security', avgTime: 0.8, targetTime: 1.0 }
  ];

  const topReporters = [
    { name: 'Dr. Smith', count: 12, role: 'Faculty' },
    { name: 'Lab Tech Johnson', count: 8, role: 'Lab Technician' },
    { name: 'Student Rep Martinez', count: 6, role: 'Class Representative' },
    { name: 'Prof. Wilson', count: 5, role: 'Faculty' },
    { name: 'Admin Brown', count: 4, role: 'Administrator' }
  ];

  const departmentStats = [
    { department: 'Computer Science', total: 45, resolved: 38, pending: 7, avgTime: 2.1 },
    { department: 'Engineering', total: 32, resolved: 28, pending: 4, avgTime: 2.8 },
    { department: 'Science', total: 28, resolved: 24, pending: 4, avgTime: 3.2 },
    { department: 'Business', total: 15, resolved: 12, pending: 3, avgTime: 2.5 }
  ];

  const totalIssues = issuesByCategory.reduce((sum, item) => sum + item.value, 0);
  const totalResolved = issuesByPriority.reduce((sum, item) => sum + item.resolved, 0);
  const totalPending = issuesByPriority.reduce((sum, item) => sum + item.pending, 0);
  const resolutionRate = (totalResolved / totalIssues) * 100;

  const exportReport = () => {
    // Mock export functionality
    console.log('Exporting analytics report...');
  };

  if (!canViewAnalytics()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Infrastructure performance and issue tracking insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
              -8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 days</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-green-600" />
              -0.5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Issues Over Time</CardTitle>
            <CardDescription>Trend of reported, resolved, and pending issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={issuesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="reported" stackId="1" stroke="#8884d8" fill="#8884d8" name="Reported" />
                <Area type="monotone" dataKey="resolved" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Resolved" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#ffc658" fill="#ffc658" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Distribution of issues across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issuesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issuesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Priority</CardTitle>
            <CardDescription>Breakdown of issues by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuesByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Total" />
                <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                <Bar dataKey="pending" fill="#ffc658" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Time by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time by Category</CardTitle>
            <CardDescription>Average resolution time vs target time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgTime" fill="#8884d8" name="Average Time (days)" />
                <Bar dataKey="targetTime" fill="#82ca9d" name="Target Time (days)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Reporters */}
        <Card>
          <CardHeader>
            <CardTitle>Top Issue Reporters</CardTitle>
            <CardDescription>Users who have reported the most issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReporters.map((reporter, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{reporter.name}</p>
                      <p className="text-sm text-gray-500">{reporter.role}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{reporter.count} issues</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Issue management performance by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.department}</span>
                    <Badge variant="outline">{dept.total} total</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{dept.resolved} resolved, {dept.pending} pending</span>
                    <span>Avg: {dept.avgTime} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(dept.resolved / dept.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 - Faculty and Student Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Count by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Distribution</CardTitle>
            <CardDescription>Number of faculty members by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Computer Science', value: 25, color: '#8884d8' },
                    { name: 'Engineering', value: 30, color: '#82ca9d' },
                    { name: 'Science', value: 20, color: '#ffc658' },
                    { name: 'Business', value: 15, color: '#ff7300' },
                    { name: 'Arts', value: 10, color: '#0088FE' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Computer Science', value: 25, color: '#8884d8' },
                    { name: 'Engineering', value: 30, color: '#82ca9d' },
                    { name: 'Science', value: 20, color: '#ffc658' },
                    { name: 'Business', value: 15, color: '#ff7300' },
                    { name: 'Arts', value: 10, color: '#0088FE' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Strength by Year */}
        <Card>
          <CardHeader>
            <CardTitle>Student Strength by Year</CardTitle>
            <CardDescription>Distribution of students across academic years</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
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
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Complaints Count Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Total Complaints Over Time</CardTitle>
          <CardDescription>Cumulative number of complaints reported</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', complaints: 45 },
              { month: 'Feb', complaints: 52 },
              { month: 'Mar', complaints: 48 },
              { month: 'Apr', complaints: 61 },
              { month: 'May', complaints: 55 },
              { month: 'Jun', complaints: 67 },
              { month: 'Jul', complaints: 70 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="complaints" stroke="#8884d8" strokeWidth={2} name="Total Complaints" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
