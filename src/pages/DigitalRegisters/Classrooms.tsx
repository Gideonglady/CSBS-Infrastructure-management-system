import React, { useState, useEffect } from 'react';
import { Building2, Users, Projector } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { laboratoryAPI } from '@/services/api';
import { Laboratory } from '@/types/laboratory';
import { useAuth } from '@/contexts/AuthContext';
import ActionHistoryDialog from '@/components/ActionHistoryDialog';

interface ClassroomSummary {
  _id: string;
  serialNumber: number;
  name: string;
  numberOfDesks: number;
  equipment: string;
}

const Classrooms = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response: any = await laboratoryAPI.getAll({ type: 'classroom' });
      if (response && response.data && response.data.length > 0) {
        // Transform data to match the expected format
        const transformedData = response.data.map((classroom: Laboratory) => ({
          _id: classroom._id,
          serialNumber: classroom.serialNumber,
          name: classroom.name,
          numberOfDesks: classroom.numberOfSystems, // numberOfSystems stores desk count for classrooms
          equipment: classroom.additionalEquipment.join(', '),
        }));
        setClassrooms(transformedData);
      } else {
        throw new Error('No data');
      }
    } catch {
      const sampleClassrooms: ClassroomSummary[] = [
        { _id: 'c1', serialNumber: 101, name: 'ITT1', numberOfDesks: 38, equipment: 'Projector, 4 Windows, Big Desk, Audio System' },
        { _id: 'c2', serialNumber: 102, name: 'ITT2', numberOfDesks: 38, equipment: 'Projector, 4 Windows, Big Desk, Smart Board' },
        { _id: 'c3', serialNumber: 103, name: 'ITT3', numberOfDesks: 38, equipment: 'Projector, 4 Windows, Big Desk' },
        { _id: 'c4', serialNumber: 104, name: 'ITT4', numberOfDesks: 34, equipment: 'Projector, 4 Windows, Big Desk' },
      ];
      setClassrooms(sampleClassrooms);
    } finally {
      setLoading(false);
    }
  };

  const totalDesks = classrooms.reduce((sum, classroom) => sum + classroom.numberOfDesks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold">Classroom Registers</h1>
           <p className="text-gray-600">CSBS Department - Classroom Infrastructure</p>
        </div>
        <ActionHistoryDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classrooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Active classrooms
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Desks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalDesks}
            </div>
            <p className="text-xs text-muted-foreground">
              Total desks available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Desks/Classroom</CardTitle>
            <Projector className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classrooms.length > 0 ? Math.round(totalDesks / classrooms.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per classroom
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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading classrooms...</p>
            </div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No classrooms found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead className="text-center">No. of Desk</TableHead>
                  <TableHead>Other Equipment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom, index) => (
                  <TableRow key={classroom._id}>
                    <TableCell className="font-medium">{classroom.serialNumber}</TableCell>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell className="text-center">{classroom.numberOfDesks}</TableCell>
                    <TableCell className="max-w-md truncate" title={classroom.equipment}>
                      {classroom.equipment || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Classrooms;
