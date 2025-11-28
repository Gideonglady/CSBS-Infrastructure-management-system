import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemSpecification, SpecEditData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { createApprovalRequest, notifyAdmin } from '@/utils/approvalWorkflow';
import { toast } from 'sonner';

interface SystemSpecsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  locationType: 'classroom' | 'laboratory';
  locationName: string;
  onSave?: () => void;
}

const SystemSpecsDialog: React.FC<SystemSpecsDialogProps> = ({
  open,
  onOpenChange,
  locationId,
  locationType,
  locationName,
  onSave
}) => {
  const { user } = useAuth();
  const [specs, setSpecs] = useState<SystemSpecification | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    processor: '',
    ram: '',
    rom: ''
  });

  useEffect(() => {
    if (open) {
      loadSpecs();
    }
  }, [open, locationId]);

  const loadSpecs = () => {
    try {
      const stored = localStorage.getItem('dims-system-specs');
      if (stored) {
        const allSpecs: SystemSpecification[] = JSON.parse(stored);
        const locationSpec = allSpecs.find(
          s => s.locationId === locationId && s.locationType === locationType
        );
        
        if (locationSpec) {
          setSpecs(locationSpec);
          setFormData({
            processor: locationSpec.processor,
            ram: locationSpec.ram,
            rom: locationSpec.rom
          });
        } else {
          setSpecs(null);
          setFormData({ processor: '', ram: '', rom: '' });
        }
      }
    } catch (error) {
      console.error('Error loading specs:', error);
    }
  };

  const canEdit = () => {
    return user?.role === UserRole.ADMIN || 
           user?.role === UserRole.LAB_TECHNICIAN ||
           user?.role === UserRole.LAB_INCHARGE;
  };

  const handleSave = () => {
    if (!user) return;

    const isAdmin = user.role === UserRole.ADMIN;
    
    if (isAdmin) {
      // Admin can directly update
      saveSpecs();
    } else {
      // Lab technician/incharge needs approval
      requestApproval();
    }
  };

  const saveSpecs = () => {
    try {
      const stored = localStorage.getItem('dims-system-specs');
      const allSpecs: SystemSpecification[] = stored ? JSON.parse(stored) : [];
      
      const index = allSpecs.findIndex(
        s => s.locationId === locationId && s.locationType === locationType
      );

      const updatedSpec: SystemSpecification = {
        id: index >= 0 ? allSpecs[index].id : `SPEC-${Date.now()}`,
        locationId,
        locationType,
        locationName,
        processor: formData.processor,
        ram: formData.ram,
        rom: formData.rom,
        lastUpdated: new Date(),
        updatedBy: user!.id,
        updatedByName: user!.name
      };

      if (index >= 0) {
        allSpecs[index] = updatedSpec;
      } else {
        allSpecs.push(updatedSpec);
      }

      localStorage.setItem('dims-system-specs', JSON.stringify(allSpecs));
      toast.success('System specifications updated successfully');
      setIsEditing(false);
      loadSpecs();
      onSave?.();
    } catch (error) {
      console.error('Error saving specs:', error);
      toast.error('Failed to save specifications');
    }
  };

  const requestApproval = () => {
    if (!user) return;

    const approvalData: SpecEditData = {
      locationId,
      locationType,
      locationName,
      oldSpecs: {
        processor: specs?.processor || '',
        ram: specs?.ram || '',
        rom: specs?.rom || ''
      },
      newSpecs: formData
    };

    const approvalRequest = createApprovalRequest(
      'spec_edit',
      approvalData,
      user.id,
      user.name,
      user.role
    );

    notifyAdmin(approvalRequest);
    
    toast.success('Approval request submitted');
    setIsEditing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>System Specifications</DialogTitle>
          <DialogDescription>
            {locationName} - {locationType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!specs && !isEditing ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No specifications available for this location</p>
              {canEdit() && (
                <Button onClick={() => setIsEditing(true)}>
                  Add Specifications
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="processor">Processor</Label>
                  <Input
                    id="processor"
                    value={formData.processor}
                    onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., Intel Core i5-10400"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ram">RAM</Label>
                  <Input
                    id="ram"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., 16GB DDR4"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rom">Storage (ROM)</Label>
                  <Input
                    id="rom"
                    value={formData.rom}
                    onChange={(e) => setFormData({ ...formData, rom: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., 512GB SSD"
                    className="mt-1"
                  />
                </div>
              </div>

              {specs && !isEditing && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Last updated by <strong>{specs.updatedByName}</strong> on{' '}
                    {new Date(specs.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                loadSpecs();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {user?.role === UserRole.ADMIN ? 'Save' : 'Submit for Approval'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {canEdit() && specs && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Specifications
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SystemSpecsDialog;
