import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Microscope, Users, Wrench, Shield, TestTube, Computer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { laboratoryAPI } from '@/services/api';
import { Laboratory } from '@/types/laboratory';
import { useToast } from '@/hooks/use-toast';

const Laboratories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    try {
      setLoading(true);
      const response = await laboratoryAPI.getAll({ type: 'laboratory' });
      if (response.success) {
        setLaboratories(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching laboratories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load laboratories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLaboratories = laboratories.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.software.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalSystems = laboratories.reduce((sum, lab) => sum + lab.numberOfSystems, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading laboratories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratory Registers</h1>
          <p className="text-gray-600">CSBS Department - Laboratory Infrastructure</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search laboratories, software..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laboratories</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laboratories.length}</div>
            <p className="text-xs text-muted-foreground">
              CSBS Department
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
            <Computer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSystems}
            </div>
            <p className="text-xs text-muted-foreground">
              Computer systems
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Systems/Lab</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laboratories.length > 0 ? Math.round(totalSystems / laboratories.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per laboratory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Laboratories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laboratory Details</CardTitle>
          <CardDescription>
            Detailed view of all CSBS laboratories and their equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lab Name</TableHead>
                <TableHead>Systems</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Software</TableHead>
                <TableHead>Equipment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLaboratories.map((lab) => (
                <TableRow key={lab._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{lab.name}</div>
                      <div className="text-xs text-gray-500">
                        {lab.building} - {lab.floor}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50">
                      {lab.numberOfSystems} systems
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-gray-600 truncate" title={lab.systemConfiguration}>
                      {lab.systemConfiguration || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lab.software.slice(0, 3).map((software, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                          {software}
                        </Badge>
                      ))}
                      {lab.software.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{lab.software.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lab.additionalEquipment.map((equipment, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 bg-green-50">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLaboratories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No laboratories found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Laboratories;
