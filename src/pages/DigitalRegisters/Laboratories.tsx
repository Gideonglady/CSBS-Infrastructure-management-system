import React, { useState, useEffect } from 'react';
import { Search, Eye, Microscope, Computer, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { labSystemAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface LabSummary {
  labName: string;
  systemCount: number;
  equipment: string;
}

interface LabSystem {
  _id: string;
  sno: number;
  labName: string;
  sysID: string;
  processor: string;
  ram: string;
  hdd: string;
  softwareAvailable: string;
  equipment: string;
}

const Laboratories = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState<LabSummary[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<LabSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [labSystems, setLabSystems] = useState<LabSystem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dialogSearchTerm, setDialogSearchTerm] = useState('');
  const [dialogFilter, setDialogFilter] = useState('all');

  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    // Filter labs based on search term
    if (searchTerm) {
      const filtered = labs.filter(lab =>
        lab.labName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLabs(filtered);
    } else {
      setFilteredLabs(labs);
    }
  }, [searchTerm, labs]);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response: any = await labSystemAPI.getLabsSummary();
      if (response && response.success) {
        setLabs(response.data);
        setFilteredLabs(response.data);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (labName: string) => {
    try {
      setDetailsLoading(true);
      setSelectedLab(labName);
      setIsDialogOpen(true);

      const response: any = await labSystemAPI.getByLabName(labName);
      if (response && response.success) {
        setLabSystems(response.data);
      }
    } catch (error) {
      console.error('Error fetching lab systems:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const totalSystems = labs.reduce((sum, lab) => sum + lab.systemCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Laboratory Registers</h1>
        <p className="text-gray-600">CSBS Department - Laboratory Infrastructure</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laboratories</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labs.length}</div>
            <p className="text-xs text-muted-foreground">
              Active laboratories
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
              {labs.length > 0 ? Math.round(totalSystems / labs.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per laboratory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by lab name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Labs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laboratory Details</CardTitle>
          <CardDescription>
            Detailed view of all CSBS laboratories and their equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading laboratories...</p>
            </div>
          ) : filteredLabs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No laboratories found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Lab Name</TableHead>
                  <TableHead className="text-center">No. of Systems</TableHead>
                  <TableHead>Other Equipment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabs.map((lab, index) => (
                  <TableRow key={lab.labName}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{lab.labName}</TableCell>
                    <TableCell className="text-center">{lab.systemCount}</TableCell>
                    <TableCell className="max-w-md truncate" title={lab.equipment}>{lab.equipment || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(lab.labName)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lab Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLab} - System Details</DialogTitle>
            <DialogDescription>
              Complete information about all systems in this laboratory
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading system details...</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Dialog Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search systems..."
                    value={dialogSearchTerm}
                    onChange={(e) => setDialogSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={dialogFilter}
                  onValueChange={setDialogFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Systems</SelectItem>
                    {/* Dynamic Processor Options */}
                    {Array.from(new Set(labSystems.map(s => s.processor).filter(Boolean))).map(proc => (
                      <SelectItem key={`proc-${proc}`} value={`processor:${proc}`}>
                        Processor: {proc}
                      </SelectItem>
                    ))}
                    {/* Dynamic RAM Options */}
                    {Array.from(new Set(labSystems.map(s => s.ram).filter(Boolean))).map(ram => (
                      <SelectItem key={`ram-${ram}`} value={`ram:${ram}`}>
                        RAM: {ram}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>System ID</TableHead>
                    {labSystems.some(s => s.processor) && <TableHead>Processor</TableHead>}
                    {labSystems.some(s => s.ram) && <TableHead>RAM</TableHead>}
                    {labSystems.some(s => s.hdd) && <TableHead>HDD</TableHead>}
                    {labSystems.some(s => s.softwareAvailable) && <TableHead>Software</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labSystems
                    .filter(system => {
                      // Text Search
                      const matchesSearch = !dialogSearchTerm ||
                        system.sysID.toLowerCase().includes(dialogSearchTerm.toLowerCase()) ||
                        (system.processor && system.processor.toLowerCase().includes(dialogSearchTerm.toLowerCase())) ||
                        (system.softwareAvailable && system.softwareAvailable.toLowerCase().includes(dialogSearchTerm.toLowerCase()));

                      // Dropdown Filter
                      let matchesFilter = true;
                      if (dialogFilter && dialogFilter !== 'all') {
                        const [type, value] = dialogFilter.split(':');
                        if (type === 'processor') {
                          matchesFilter = system.processor === value;
                        } else if (type === 'ram') {
                          matchesFilter = system.ram === value;
                        }
                      }

                      return matchesSearch && matchesFilter;
                    })
                    .map((system, index) => (
                      <TableRow key={system._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{system.sysID}</TableCell>
                        {labSystems.some(s => s.processor) && <TableCell>{system.processor || '-'}</TableCell>}
                        {labSystems.some(s => s.ram) && <TableCell>{system.ram || '-'}</TableCell>}
                        {labSystems.some(s => s.hdd) && <TableCell>{system.hdd || '-'}</TableCell>}
                        {labSystems.some(s => s.softwareAvailable) && (
                          <TableCell className="whitespace-pre-wrap" title={system.softwareAvailable}>
                            {system.softwareAvailable || '-'}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Laboratories;
