import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAudit } from '@/contexts/AuditContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { formatDistanceToNow } from 'date-fns';

const AuditLog = () => {
  const { logs, getLogsByUser, getLogsByResource } = useAudit();
  const { canManageUsers } = useRoleAccess();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Mock data - replace with actual API calls
  const mockLogs = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Dr. Smith',
      action: 'CREATE',
      resource: 'Issue',
      resourceId: 'issue-123',
      oldValues: null,
      newValues: { title: 'Projector not working', priority: 'high' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Lab Tech Johnson',
      action: 'UPDATE',
      resource: 'Equipment',
      resourceId: 'eq-456',
      oldValues: { condition: 'poor' },
      newValues: { condition: 'good' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Admin Brown',
      action: 'DELETE',
      resource: 'User',
      resourceId: 'user-789',
      oldValues: { name: 'John Doe', email: 'john@example.com' },
      newValues: null,
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  const allLogs = [...logs, ...mockLogs];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'Issue': return 'bg-orange-100 text-orange-800';
      case 'Equipment': return 'bg-blue-100 text-blue-800';
      case 'User': return 'bg-purple-100 text-purple-800';
      case 'Classroom': return 'bg-green-100 text-green-800';
      case 'Laboratory': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = filterUser === 'all' || log.userId === filterUser;
    const matchesResource = filterResource === 'all' || log.resource === filterResource;
    
    return matchesSearch && matchesUser && matchesResource;
  });

  const uniqueUsers = Array.from(new Set(allLogs.map(log => log.userId)));
  const uniqueResources = Array.from(new Set(allLogs.map(log => log.resource)));

  const exportLogs = () => {
    // Mock export functionality
    console.log('Exporting audit logs...');
  };

  if (!canManageUsers()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(userId => {
                  const user = allLogs.find(log => log.userId === userId);
                  return (
                    <SelectItem key={userId} value={userId}>
                      {user?.userName || userId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {uniqueResources.map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setFilterUser('all');
              setFilterResource('all');
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              All recorded activities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allLogs.filter(log => 
                new Date(log.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Activities today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources Modified</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueResources.length}</div>
            <p className="text-xs text-muted-foreground">
              Different resource types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Complete history of all system activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Resource ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {log.createdAt.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{log.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getResourceColor(log.resource)}>
                      {log.resource}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.resourceId || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this audit log entry
                          </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">User</label>
                                <p className="text-sm">{selectedLog.userName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Action</label>
                                <p className="text-sm">
                                  <Badge className={getActionColor(selectedLog.action)}>
                                    {selectedLog.action}
                                  </Badge>
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Resource</label>
                                <p className="text-sm">
                                  <Badge className={getResourceColor(selectedLog.resource)}>
                                    {selectedLog.resource}
                                  </Badge>
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                                <p className="text-sm">{selectedLog.createdAt.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            {selectedLog.oldValues && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Previous Values</label>
                                <pre className="text-sm bg-gray-100 p-3 rounded mt-1 overflow-auto">
                                  {JSON.stringify(selectedLog.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {selectedLog.newValues && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">New Values</label>
                                <pre className="text-sm bg-gray-100 p-3 rounded mt-1 overflow-auto">
                                  {JSON.stringify(selectedLog.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">IP Address</label>
                                <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">User Agent</label>
                                <p className="text-sm text-xs break-all">{selectedLog.userAgent}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
