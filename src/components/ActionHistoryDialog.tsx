import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { History, Check, X, Clock, RotateCcw } from 'lucide-react';
import { actionsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ActionRequest {
  _id: string;
  actionType: string;
  targetModel: string;
  status: string;
  data: any;
  entityId?: string; // ID of the entity affected
  previousState?: any; // Snapshot of data before action
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  requestedBy: {
    name: string;
    email: string;
  };
  sourceLocation?: { name: string };
  destinationLocation?: { name: string };
  sourceLabName?: string;
  destinationLabName?: string;
}

const ActionHistoryDialog = () => {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<ActionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (open) {
      fetchRequests();
    }
  }, [open]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response: any = await actionsAPI.getHistory();
      if (response && response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await actionsAPI.approve(id);
      toast({ title: 'Success', description: 'Request approved successfully' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await actionsAPI.reject(id, reason);
      toast({ title: 'Success', description: 'Request rejected' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' });
    }
  };

  const handleRevert = async (id: string) => {
      if (!confirm('Are you sure you want to revert this action? This will undo the changes.')) return;
      try {
          await actionsAPI.revert(id);
          toast({ title: 'Success', description: 'Action reverted successfully' });
          fetchRequests();
      } catch (error) {
          toast({ title: 'Error', description: 'Failed to revert action', variant: 'destructive' });
      }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const historyRequests = requests.filter(r => r.status !== 'pending');

  const ActionCard = ({ request, showActions = false }: { request: ActionRequest, showActions?: boolean }) => (
    <Card className="mb-3 border-l-4" style={{ 
      borderLeftColor: request.status === 'pending' ? '#eab308' : 
                       request.status === 'approved' ? '#22c55e' : 
                       request.status === 'reverted' ? '#9333ea' :
                       '#ef4444' 
    }}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="uppercase text-xs font-bold">
                {request.actionType}
              </Badge>
              <span className="text-sm font-medium text-gray-500">
                {request.targetModel}
              </span>
              <span className="text-xs text-gray-400">
                • {format(new Date(request.createdAt), 'MMM dd, HH:mm')}
              </span>
              {request.status === 'reverted' && (
                  <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-800">Reverted</Badge>
              )}
            </div>
            <div className="text-sm font-medium">
              {request.actionType === 'transfer' ? (
                <span>
                   Transfer <b>{request.data?.sysID || request.previousState?.sysID || 'System'}</b> from <b>{request.sourceLabName || request.sourceLocation?.name || 'Unknown'}</b> to <b>{request.destinationLabName || request.destinationLocation?.name || 'Unknown'}</b>
                </span>
              ) : request.actionType === 'create' ? (
                <span>
                    Created System <b>{request.data?.sysID || 'New System'}</b> in <b>{request.data?.labName || 'Laboratory'}</b>
                </span>
              ) : request.actionType === 'delete' ? (
                <span>
                    Deleted System <b>{request.previousState?.sysID || request.entityId}</b> from <b>{request.previousState?.labName || 'Laboratory'}</b>
                </span>
              ) : request.actionType === 'update' ? (
                 <span>
                    Updated System <b>{request.data?.sysID || request.previousState?.sysID || 'System'}</b>
                 </span>
              ) : (
                <span>
                  {request.notes || 'No notes provided'}
                </span>
              )}
            </div>
            {request.notes && request.actionType !== 'transfer' && (
                 <p className="text-xs text-gray-500 mt-1 italic">"{request.notes}"</p>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Requested by: {request.requestedBy?.name}
            </div>
            {request.status === 'rejected' && (
              <div className="text-xs text-red-500 mt-1">
                Reason: {request.rejectionReason}
              </div>
            )}
          </div>
          
          {showActions && isAdmin && request.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleApprove(request._id)}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleReject(request._id)}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )}

          {/* Revert Button for Executed Actions (History Tab) */}
          {!showActions && isAdmin && request.status === 'approved' && (
              <div className="flex gap-2">
                   <Button size="sm" variant="outline" title="Revert Action" className="h-8 w-8 p-0" onClick={() => handleRevert(request._id)}>
                       <RotateCcw className="h-4 w-4 text-purple-600" />
                   </Button>
              </div>
          )}

        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="w-4 h-4" />
          Actions / History
          {pendingRequests.length > 0 && isAdmin && (
            <Badge variant="destructive" className="ml-1 px-1 h-5 text-[10px]">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Action History & Approvals</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={isAdmin ? "pending" : "history"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[50vh] mt-4 pr-4">
            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Check className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  No pending requests
                </div>
              ) : (
                pendingRequests.map(req => (
                  <ActionCard key={req._id} request={req} showActions={true} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {historyRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  No history found
                </div>
              ) : (
                historyRequests.map(req => (
                  <ActionCard key={req._id} request={req} />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ActionHistoryDialog;
