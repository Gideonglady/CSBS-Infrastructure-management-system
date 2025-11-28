import React, { useState } from 'react';
import { Plus, Search, Filter, Microscope, Users, Wrench, Shield, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import SystemSpecsDialog from '@/components/SystemSpecsDialog';

const Laboratories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [specsDialogOpen, setSpecsDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  const laboratories = [
    {
      id: '1',
      name: 'Computer Lab 1',
      building: 'Computer Science Building',
      floor: 2,
      capacity: 30,
      specializations: ['Programming', 'Software Development', 'Database Management'],
      equipment: [
        { name: 'Desktop Computers', condition: 'excellent', quantity: 30 },
        { name: 'Projector', condition: 'good', quantity: 1 },
        { name: 'Network Switch', condition: 'excellent', quantity: 2 },
        { name: 'Chairs', condition: 'good', quantity: 30 },
        { name: 'Tables', condition: 'excellent', quantity: 15 }
      ],
      responsiblePerson: 'Dr. Smith',
      status: 'active',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      safetyFeatures: ['Fire Extinguisher', 'Emergency Exit', 'First Aid Kit', 'Safety Goggles'],
      certifications: ['ISO 27001', 'Lab Safety Certified']
    },
    {
      id: '2',
      name: 'Chemistry Lab A',
      building: 'Science Building',
      floor: 1,
      capacity: 25,
      specializations: ['Organic Chemistry', 'Analytical Chemistry', 'Biochemistry'],
      equipment: [
        { name: 'Microscopes', condition: 'excellent', quantity: 15 },
        { name: 'Bunsen Burners', condition: 'good', quantity: 25 },
        { name: 'Lab Benches', condition: 'excellent', quantity: 12 },
        { name: 'Safety Equipment', condition: 'good', quantity: 1 },
        { name: 'Chemical Storage', condition: 'excellent', quantity: 5 }
      ],
      responsiblePerson: 'Dr. Martinez',
      status: 'maintenance',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      safetyFeatures: ['Fume Hood', 'Emergency Shower', 'Fire Extinguisher', 'Safety Data Sheets'],
      certifications: ['Chemical Safety Certified', 'ISO 14001']
    },
    {
      id: '3',
      name: 'Physics Lab',
      building: 'Engineering Building',
      floor: 3,
      capacity: 20,
      specializations: ['Mechanics', 'Electronics', 'Optics'],
      equipment: [
        { name: 'Oscilloscopes', condition: 'good', quantity: 10 },
        { name: 'Multimeters', condition: 'excellent', quantity: 20 },
        { name: 'Optical Benches', condition: 'good', quantity: 5 },
        { name: 'Power Supplies', condition: 'excellent', quantity: 10 }
      ],
      responsiblePerson: 'Prof. Johnson',
      status: 'active',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      safetyFeatures: ['Emergency Stop', 'Ground Fault Protection', 'Safety Barriers'],
      certifications: ['Electrical Safety Certified']
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

  const allSpecializations = Array.from(
    new Set(laboratories.flatMap(lab => lab.specializations))
  );

  const filteredLaboratories = laboratories.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lab.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lab.specializations.some(spec => 
                           spec.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;
    const matchesSpecialization = specializationFilter === 'all' || 
                                 lab.specializations.includes(specializationFilter);
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratory Registers</h1>
          <p className="text-gray-600">Manage and monitor laboratory infrastructure and equipment</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Laboratory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Laboratory</DialogTitle>
              <DialogDescription>
                Enter the details for the new laboratory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Laboratory Name</Label>
                  <Input id="name" placeholder="e.g., Computer Lab 1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Input id="building" placeholder="e.g., Science Building" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input id="floor" type="number" placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" placeholder="30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible Person</Label>
                <Input id="responsible" placeholder="Dr. Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specializations">Specializations</Label>
                <Textarea id="specializations" placeholder="Programming, Software Development, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="safety">Safety Features</Label>
                <Textarea id="safety" placeholder="Fire Extinguisher, Emergency Exit, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea id="certifications" placeholder="ISO 27001, Lab Safety Certified, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Add Laboratory
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
            placeholder="Search laboratories, specializations..."
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
        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {allSpecializations.map((spec) => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laboratories</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laboratories.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(laboratories.map(l => l.building)).size} buildings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Labs</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {laboratories.filter(l => l.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {laboratories.filter(l => l.status === 'maintenance').length}
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
              {laboratories.reduce((sum, l) => sum + l.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Students across all labs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Laboratories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laboratory Details</CardTitle>
          <CardDescription>
            Detailed view of all laboratories and their equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Laboratory</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLaboratories.map((lab) => (
                <TableRow key={lab.id}>
                  <TableCell className="font-medium">{lab.name}</TableCell>
                  <TableCell>{lab.building}</TableCell>
                  <TableCell>{lab.capacity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lab.status)}>
                      {lab.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lab.specializations.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {spec}
                        </Badge>
                      ))}
                      {lab.specializations.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{lab.specializations.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lab.equipment.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="outline" className={getConditionColor(item.condition)}>
                            {item.name} ({item.quantity})
                          </Badge>
                        </div>
                      ))}
                      {lab.equipment.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{lab.equipment.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lab.responsiblePerson}</TableCell>
                  <TableCell>{lab.lastMaintenance}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedLab(lab);
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
      {selectedLab && (
        <SystemSpecsDialog
          open={specsDialogOpen}
          onOpenChange={setSpecsDialogOpen}
          locationId={selectedLab.id}
          locationType="laboratory"
          locationName={selectedLab.name}
        />
      )}
    </div>
  );
};

export default Laboratories;
