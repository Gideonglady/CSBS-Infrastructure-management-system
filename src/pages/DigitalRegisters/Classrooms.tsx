import React, { useState } from 'react';
import { Plus, Search, Filter, Building2, Users, Wifi, Projector, Computer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SystemSpecsDialog from '@/components/SystemSpecsDialog';

const Classrooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const [specsDialogOpen, setSpecsDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  const classrooms = [
    {
      id: '1',
      name: 'Room 101',
      building: 'Computer Science Building',
      floor: 1,
      capacity: 50,
      equipment: [
        { name: 'Projector', condition: 'good', quantity: 1 },
        { name: 'Computer', condition: 'excellent', quantity: 1 },
        { name: 'Chairs', condition: 'good', quantity: 50 },
        { name: 'Tables', condition: 'fair', quantity: 25 }
      ],
      responsiblePerson: 'Dr. Smith',
      status: 'active',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      amenities: ['WiFi', 'Projector', 'AC', 'Whiteboard']
    },
    {
      id: '2',
      name: 'Room 205',
      building: 'Engineering Building',
      floor: 2,
      capacity: 40,
      equipment: [
        { name: 'Projector', condition: 'poor', quantity: 1 },
        { name: 'Computer', condition: 'good', quantity: 1 },
        { name: 'Chairs', condition: 'excellent', quantity: 40 },
        { name: 'Tables', condition: 'good', quantity: 20 }
      ],
      responsiblePerson: 'Prof. Johnson',
      status: 'maintenance',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      amenities: ['WiFi', 'Projector', 'AC']
    },
    {
      id: '3',
      name: 'Lab 301',
      building: 'Science Building',
      floor: 3,
      capacity: 30,
      equipment: [
        { name: 'Computer', condition: 'excellent', quantity: 30 },
        { name: 'Chairs', condition: 'good', quantity: 30 },
        { name: 'Tables', condition: 'excellent', quantity: 15 }
      ],
      responsiblePerson: 'Dr. Martinez',
      status: 'active',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      amenities: ['WiFi', 'Computers', 'AC', 'Lab Equipment']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classroom.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || classroom.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || classroom.building === buildingFilter;
    
    return matchesSearch && matchesStatus && matchesBuilding;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classroom Registers</h1>
          <p className="text-gray-600">Manage and monitor classroom infrastructure</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Classroom</DialogTitle>
              <DialogDescription>
                Enter the details for the new classroom.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" placeholder="e.g., Room 101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building">Building</Label>
                <Input id="building" placeholder="e.g., Computer Science Building" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input id="floor" type="number" placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" placeholder="50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible Person</Label>
                <Input id="responsible" placeholder="Dr. Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Textarea id="amenities" placeholder="WiFi, Projector, AC, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Add Classroom
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            <SelectItem value="Computer Science Building">Computer Science</SelectItem>
            <SelectItem value="Engineering Building">Engineering</SelectItem>
            <SelectItem value="Science Building">Science</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classrooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(classrooms.map(c => c.building)).size} buildings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classrooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {classrooms.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {classrooms.filter(c => c.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classrooms.reduce((sum, c) => sum + c.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Students across all rooms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classrooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classroom Details</CardTitle>
          <CardDescription>
            Detailed view of all classrooms and their equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClassrooms.map((classroom) => (
                <TableRow key={classroom.id}>
                  <TableCell className="font-medium">{classroom.name}</TableCell>
                  <TableCell>{classroom.building}</TableCell>
                  <TableCell>{classroom.capacity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(classroom.status)}>
                      {classroom.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {classroom.equipment.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline" className={getConditionColor(item.condition)}>
                            {item.name} ({item.quantity})
                          </Badge>
                        </div>
                      ))}
                      {classroom.equipment.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{classroom.equipment.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{classroom.responsiblePerson}</TableCell>
                  <TableCell>{classroom.lastMaintenance}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedClassroom(classroom);
                        setSpecsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Specifications Dialog */}
      {selectedClassroom && (
        <SystemSpecsDialog
          open={specsDialogOpen}
          onOpenChange={setSpecsDialogOpen}
          locationId={selectedClassroom.id}
          locationType="classroom"
          locationName={selectedClassroom.name}
        />
      )}
    </div>
  );
};

export default Classrooms;
