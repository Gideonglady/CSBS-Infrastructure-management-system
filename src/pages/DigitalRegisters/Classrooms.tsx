import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building2, Users, Wifi, Projector, Computer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { laboratoryAPI } from '@/services/api';
import { Laboratory } from '@/types/laboratory';
import { useToast } from '@/hooks/use-toast';

const Classrooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classrooms, setClassrooms] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await laboratoryAPI.getAll({ type: 'classroom' });
      if (response.success) {
        setClassrooms(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classrooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading classrooms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classroom Registers</h1>
          <p className="text-gray-600">CSBS Department - Classroom Infrastructure</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search classrooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classrooms.length}</div>
            <p className="text-xs text-muted-foreground">
              CSBS Department
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipped Classrooms</CardTitle>
            <Projector className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {classrooms.filter(c => c.additionalEquipment.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              With projectors and equipment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classrooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classroom Details</CardTitle>
          <CardDescription>
            Detailed view of all CSBS classrooms and their equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classroom Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Equipment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClassrooms.map((classroom) => (
                <TableRow key={classroom._id}>
                  <TableCell className="font-medium">
                    <div className="font-semibold">{classroom.name}</div>
                  </TableCell>
                  <TableCell>{classroom.building}</TableCell>
                  <TableCell>{classroom.floor}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {classroom.additionalEquipment.map((equipment, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 bg-blue-50">
                          <Projector className="w-3 h-3 mr-1" />
                          {equipment}
                        </Badge>
                      ))}
                      {classroom.additionalEquipment.length === 0 && (
                        <span className="text-sm text-gray-500">No equipment</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClassrooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No classrooms found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Classrooms;
