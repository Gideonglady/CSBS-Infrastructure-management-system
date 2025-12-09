import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { actionsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SystemActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'create' | 'update' | 'transfer' | null;
  system?: any; // The system being edited/transferred
  labName?: string; // Current lab name (for source)
  allLabs?: string[]; // List of all labs for transfer destination
  onSuccess: () => void;
}

const SystemActionDialog = ({ 
  isOpen, 
  onClose, 
  actionType, 
  system, 
  labName, 
  allLabs = [],
  onSuccess 
}: SystemActionDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sysID: '',
    processor: '',
    ram: '',
    hdd: '',
    softwareAvailable: '',
    equipment: '',
    destinationName: '',
    notes: ''
  });

  useEffect(() => {
    if (system && actionType !== 'create') {
      setFormData({
        sysID: system.sysID || '',
        processor: system.processor || '',
        ram: system.ram || '',
        hdd: system.hdd || '',
        softwareAvailable: system.softwareAvailable || '',
        equipment: system.equipment || '',
        destinationName: '',
        notes: ''
      });
    } else {
      // Reset for create
      setFormData({
        sysID: '',
        processor: '',
        ram: '',
        hdd: '',
        softwareAvailable: '',
        equipment: '',
        destinationName: '',
        notes: ''
      });
    }
  }, [system, actionType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        actionType,
        targetModel: 'LabSystem',
        data: { ...formData }, // Send all data, backend filters if needed
        notes: formData.notes
      };

      if (actionType === 'create') {
        // For create, we need to specify the lab it belongs to
        payload.data.labName = labName;
      } else {
        payload.entityId = system._id;
        payload.sourceLocation = system.labId; 
      }

      console.log('Submitting payload:', payload);

      const response: any = await actionsAPI.submit(payload);

      if (response && (response.success || response.data)) {
        toast({ 
          title: isAdmin ? 'Action Executed' : 'Request Submitted', 
          description: response.data.status === 'approved' 
            ? 'Action executed successfully.' 
            : 'Request sent to Admin for approval.' 
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Action failed:', error);
      toast({ 
        title: 'Error', 
        description: error.data?.message || error.message || 'Failed to submit action', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case 'create': return 'Add New System';
      case 'update': return 'Edit System Details';
      case 'transfer': return 'Transfer System';
      default: return 'System Action';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {actionType === 'transfer' ? (
             <div className="space-y-4">
               <div>
                 <Label>System ID</Label>
                 <Input value={formData.sysID} disabled />
               </div>
               <div>
                 <Label>Transfer To (Destination Lab)</Label>
                 <Select 
                    value={formData.destinationName} 
                    onValueChange={(val) => setFormData({...formData, destinationName: val})}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select Lab" />
                   </SelectTrigger>
                   <SelectContent>
                     {allLabs.map(lab => (
                       <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>Reason / Notes</Label>
                 <Textarea 
                   value={formData.notes} 
                   onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                   placeholder="Why are you transferring this?"
                 />
               </div>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>System ID</Label>
                  <Input 
                    value={formData.sysID} 
                    onChange={(e) => setFormData({...formData, sysID: e.target.value})}
                    placeholder="SYS-001"
                    required
                  />
                </div>
                <div>
                  <Label>Processor</Label>
                  <Input 
                    value={formData.processor} 
                    onChange={(e) => setFormData({...formData, processor: e.target.value})}
                    placeholder="i5-10400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RAM</Label>
                  <Input 
                    value={formData.ram} 
                    onChange={(e) => setFormData({...formData, ram: e.target.value})}
                    placeholder="16GB"
                  />
                </div>
                <div>
                  <Label>HDD/SSD</Label>
                  <Input 
                    value={formData.hdd} 
                    onChange={(e) => setFormData({...formData, hdd: e.target.value})}
                    placeholder="512GB SSD"
                  />
                </div>
              </div>
              <div>
                <Label>Software (comma separated)</Label>
                <Textarea 
                  value={formData.softwareAvailable} 
                  onChange={(e) => setFormData({...formData, softwareAvailable: e.target.value})}
                  placeholder="Python, MATLAB, VS Code..."
                />
              </div>
              
              <div>
                <Label>Notes (Optional)</Label>
                 <Textarea 
                   value={formData.notes} 
                   onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                   placeholder="Reason for change..."
                 />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isAdmin ? 'Executing...' : 'Submitting...') : (isAdmin ? 'Execute Action' : 'Submit Request')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemActionDialog;
