import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Microscope, Users, Activity } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DigitalRegistersHome = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const stats = {
    totalClassrooms: 45,
    activeClassrooms: 43,
    totalLabs: 12,
    activeLabs: 11,
    totalUsers: 156,
    systemHealth: 'Excellent'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Digital Registers</h1>
        <p className="text-gray-600">Manage classrooms, laboratories, and infrastructure</p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Overview of infrastructure health and capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Count/Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Classrooms</TableCell>
                <TableCell>{stats.activeClassrooms} / {stats.totalClassrooms}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {stats.totalClassrooms - stats.activeClassrooms} under maintenance
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Laboratories</TableCell>
                <TableCell>{stats.activeLabs} / {stats.totalLabs}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {stats.totalLabs - stats.activeLabs} under maintenance
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Users</TableCell>
                <TableCell>{stats.totalUsers}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Registered</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Faculty, Staff, and Students
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">System Health</TableCell>
                <TableCell>98%</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">{stats.systemHealth}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Operational
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classrooms */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/registers/classrooms')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Classrooms</CardTitle>
                  <CardDescription>Manage classroom infrastructure</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Classrooms</span>
                <Badge variant="outline">{stats.totalClassrooms}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <Badge className="bg-green-100 text-green-800">{stats.activeClassrooms}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Under Maintenance</span>
                <Badge className="bg-yellow-100 text-yellow-800">{stats.totalClassrooms - stats.activeClassrooms}</Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Classrooms
            </Button>
          </CardContent>
        </Card>

        {/* Laboratories */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/registers/labs')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Microscope className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Laboratories</CardTitle>
                  <CardDescription>Manage laboratory infrastructure</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Laboratories</span>
                <Badge variant="outline">{stats.totalLabs}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <Badge className="bg-green-100 text-green-800">{stats.activeLabs}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Under Maintenance</span>
                <Badge className="bg-yellow-100 text-yellow-800">{stats.totalLabs - stats.activeLabs}</Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Laboratories
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Overview</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalClassrooms}</p>
              <p className="text-sm text-gray-600">Total Classrooms</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Microscope className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{stats.totalLabs}</p>
              <p className="text-sm text-gray-600">Total Laboratories</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Registered Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalRegistersHome;
