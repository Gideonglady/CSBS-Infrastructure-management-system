import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { transferAPI, labSystemAPI, laboratoryAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRightLeft, Loader2, Send, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Equipment {
  _id: string;
  sysID: string;
  labName: string;
  processor?: string;
  ram?: string;
  hdd?: string;
  softwareAvailable?: string;
}

interface Location {
  _id: string;
  name: string;
  type: 'laboratory' | 'classroom';
}

interface TransferRequest {
  _id: string;
  equipmentSnapshot: {
    sysID: string;
    processor?: string;
    ram?: string;
  };
  sourceLocation: {
    _id: string;
    name: string;
    type: string;
  };
  destinationLocation: {
    _id: string;
    name: string;
    type: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
  notes?: string;
  rejectionReason?: string;
}

const EquipmentTransfer = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  const userLocations = user?.assignedLocations || [];

  useEffect(() => {
    fetchAllLocations();
    fetchTransferRequests();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchEquipment(selectedLocation);
    } else {
      setEquipment([]);
      setSelectedEquipment('');
    }
  }, [selectedLocation]);

  const fetchAllLocations = async () => {
    try {
      // Use includeAll=true to get all locations, not just assigned ones
      const response: any = await laboratoryAPI.getAll({ includeAll: 'true' });
      console.log('Locations API response:', response);

      // Handle different response structures
      let locations = [];
      if (response?.data) {
        locations = response.data;
      } else if (Array.isArray(response)) {
        locations = response;
      }

      console.log('Setting locations:', locations);
      setAllLocations(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive",
      });
    }
  };

  const fetchEquipment = async (locationId: string) => {
    try {
      setIsLoading(true);
      const location = userLocations.find(loc => loc._id === locationId);
      if (!location) return;

      const response: any = await labSystemAPI.getByLabName(location.name);
      if (response && response.data) {
        setEquipment(response.data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch equipment list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransferRequests = async () => {
    try {
      const response: any = await transferAPI.getAll();
      if (response && response.data) {
        setTransferRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEquipment || !selectedLocation || !destinationLocation) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedLocation === destinationLocation) {
      toast({
        title: "Error",
        description: "Source and destination cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await transferAPI.createRequest({
        equipmentId: selectedEquipment,
        sourceLocation: selectedLocation,
        destinationLocation: destinationLocation,
        notes: notes || undefined,
      });

      toast({
        title: "Success",
        description: "Transfer request submitted successfully",
      });

      // Reset form
      setSelectedLocation('');
      setSelectedEquipment('');
      setDestinationLocation('');
      setNotes('');

      // Refresh requests
      fetchTransferRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit transfer request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await transferAPI.cancel(requestId);
      toast({
        title: "Success",
        description: "Transfer request cancelled",
      });
      fetchTransferRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const selectedEquipmentDetails = equipment.find(eq => eq._id === selectedEquipment);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Equipment Transfer</h2>
        <p className="text-muted-foreground">Request equipment transfers between locations</p>
      </div>

      {/* Transfer Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            New Transfer Request
          </CardTitle>
          <CardDescription>
            Select equipment from your assigned locations to transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Location */}
              <div className="space-y-2">
                <Label htmlFor="sourceLocation">Source Location *</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    {userLocations.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name} ({location.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment Selection */}
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment *</Label>
                <Select
                  value={selectedEquipment}
                  onValueChange={setSelectedEquipment}
                  disabled={!selectedLocation || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select equipment"} />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq) => (
                      <SelectItem key={eq._id} value={eq._id}>
                        {eq.sysID} - {eq.processor || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipment Details Preview */}
            {selectedEquipmentDetails && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Equipment Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>System ID:</strong> {selectedEquipmentDetails.sysID}</p>
                  <p><strong>Processor:</strong> {selectedEquipmentDetails.processor || 'N/A'}</p>
                  <p><strong>RAM:</strong> {selectedEquipmentDetails.ram || 'N/A'}</p>
                  <p><strong>HDD:</strong> {selectedEquipmentDetails.hdd || 'N/A'}</p>
                  {selectedEquipmentDetails.softwareAvailable && (
                    <p><strong>Software:</strong> {selectedEquipmentDetails.softwareAvailable}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Destination Location */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination Location *</Label>
              <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  {allLocations
                    .filter(loc => loc._id !== selectedLocation)
                    .map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name} ({location.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes for the admin..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedLocation('');
                  setSelectedEquipment('');
                  setDestinationLocation('');
                  setNotes('');
                }}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Transfer Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>My Transfer Requests</CardTitle>
          <CardDescription>View and manage your transfer requests</CardDescription>
        </CardHeader>
        <CardContent>
          {transferRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transfer requests yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">
                        {request.equipmentSnapshot.sysID}
                      </TableCell>
                      <TableCell>{request.sourceLocation.name}</TableCell>
                      <TableCell>{request.destinationLocation.name}</TableCell>
                      <TableCell>
                        {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelRequest(request._id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {request.status === 'rejected' && request.rejectionReason && (
                          <span className="text-xs text-muted-foreground">
                            {request.rejectionReason}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentTransfer;
