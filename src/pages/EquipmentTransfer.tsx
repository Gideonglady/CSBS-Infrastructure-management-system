import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EquipmentTransfer, EquipmentTransferData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createApprovalRequest, notifyAdmin } from '@/utils/approvalWorkflow';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EquipmentTransferPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    equipmentName: '',
    sourceType: '',
    sourceId: '',
    destinationType: '',
    destinationId: '',
    quantity: 1,
    reason: ''
  });

  const [locations] = useState([
    { type: 'classroom', id: '1', name: 'Room 101' },
    { type: 'classroom', id: '2', name: 'Room 205' },
    { type: 'classroom', id: '3', name: 'Room 301' },
    { type: 'laboratory', id: '4', name: 'Computer Lab 1' },
    { type: 'laboratory', id: '5', name: 'Computer Lab 2' },
    { type: 'laboratory', id: '6', name: 'Chemistry Lab A' },
    { type: 'laboratory', id: '7', name: 'Physics Lab' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to submit a transfer request');
      return;
    }

    if (!formData.equipmentName || !formData.sourceId || !formData.destinationId || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.sourceId === formData.destinationId) {
      toast.error('Source and destination cannot be the same');
      return;
    }

    // Create transfer record
    const transfer: EquipmentTransfer = {
      id: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      equipmentId: `EQ-${Date.now()}`,
      equipmentName: formData.equipmentName,
      sourceLocation: {
        type: formData.sourceType as 'classroom' | 'laboratory',
        id: formData.sourceId,
        name: locations.find(l => l.id === formData.sourceId)?.name || ''
      },
      destinationLocation: {
        type: formData.destinationType as 'classroom' | 'laboratory',
        id: formData.destinationId,
        name: locations.find(l => l.id === formData.destinationId)?.name || ''
      },
      quantity: formData.quantity,
      reason: formData.reason,
      requestedBy: user.id,
      requestedByName: user.name,
      requestedAt: new Date(),
      status: 'pending'
    };

    // Save transfer to localStorage
    try {
      const stored = localStorage.getItem('dims-equipment-transfers');
      const transfers = stored ? JSON.parse(stored) : [];
      transfers.unshift(transfer);
      localStorage.setItem('dims-equipment-transfers', JSON.stringify(transfers));
    } catch (error) {
      console.error('Error saving transfer:', error);
    }

    // Create approval request
    const approvalData: EquipmentTransferData = {
      transferId: transfer.id,
      equipmentName: formData.equipmentName,
      sourceLocation: transfer.sourceLocation.name,
      destinationLocation: transfer.destinationLocation.name,
      quantity: formData.quantity,
      reason: formData.reason
    };

    const approvalRequest = createApprovalRequest(
      'equipment_transfer',
      approvalData,
      user.id,
      user.name,
      user.role
    );

    notifyAdmin(approvalRequest);

    toast.success('Transfer request submitted for admin approval');
    
    // Reset form
    setFormData({
      equipmentName: '',
      sourceType: '',
      sourceId: '',
      destinationType: '',
      destinationId: '',
      quantity: 1,
      reason: ''
    });

    // Navigate to dashboard or transfer history
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const sourceLocations = locations.filter(l => formData.sourceType === '' || l.type === formData.sourceType);
  const destLocations = locations.filter(l => formData.destinationType === '' || l.type === formData.destinationType);

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Equipment Transfer Request</h1>
        <p className="text-gray-600">Request to transfer equipment between locations</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Transfer Details
            </CardTitle>
            <CardDescription>
              Fill in the details of the equipment you want to transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Equipment Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipmentName">Equipment Name *</Label>
                <Input
                  id="equipmentName"
                  value={formData.equipmentName}
                  onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                  placeholder="e.g., Desktop Computer, Projector, Lab Equipment"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Source Location */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Source Location
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sourceType">Location Type *</Label>
                  <Select
                    value={formData.sourceType}
                    onValueChange={(value) => setFormData({ ...formData, sourceType: value, sourceId: '' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sourceId">Location *</Label>
                  <Select
                    value={formData.sourceId}
                    onValueChange={(value) => setFormData({ ...formData, sourceId: value })}
                    disabled={!formData.sourceType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Transfer Arrow */}
            {formData.sourceId && formData.destinationId && (
              <div className="flex justify-center py-2">
                <ArrowRight className="w-8 h-8 text-blue-500" />
              </div>
            )}

            {/* Destination Location */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destination Location
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationType">Location Type *</Label>
                  <Select
                    value={formData.destinationType}
                    onValueChange={(value) => setFormData({ ...formData, destinationType: value, destinationId: '' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destinationId">Location *</Label>
                  <Select
                    value={formData.destinationId}
                    onValueChange={(value) => setFormData({ ...formData, destinationId: value })}
                    disabled={!formData.destinationType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {destLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="pt-4 border-t">
              <Label htmlFor="reason">Reason for Transfer *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain why this equipment needs to be transferred..."
                rows={4}
                required
                className="mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="w-4 h-4 mr-2" />
                Submit Transfer Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All equipment transfer requests require admin approval. 
            You will be notified once your request is reviewed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentTransferPage;
