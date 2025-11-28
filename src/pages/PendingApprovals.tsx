import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ApprovalRequest, ApprovalType } from '@/types';
import { approveRequest, rejectRequest, getPendingApprovals } from '@/utils/approvalWorkflow';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PendingApprovals = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ApprovalRequest[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  const loadApprovals = () => {
    const pending = getPendingApprovals();
    setApprovals(pending);
    setFilteredApprovals(pending);
  };

  useEffect(() => {
    loadApprovals();

    const handleStorageChange = () => {
      loadApprovals();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredApprovals(approvals);
    } else {
      setFilteredApprovals(approvals.filter(a => a.type === typeFilter));
    }
  }, [approvals, typeFilter]);

  const handleApprove = () => {
    if (!selectedApproval || !user) return;

    const success = approveRequest(
      selectedApproval.id,
      user.id,
      user.name,
      comment
    );

    if (success) {
      toast.success('Request approved successfully');
      loadApprovals();
      setSelectedApproval(null);
      setActionType(null);
      setComment('');
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = () => {
    if (!selectedApproval || !user || !comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const success = rejectRequest(
      selectedApproval.id,
      user.id,
      user.name,
      comment
    );

    if (success) {
      toast.success('Request rejected');
      loadApprovals();
      setSelectedApproval(null);
      setActionType(null);
      setComment('');
    } else {
      toast.error('Failed to reject request');
    }
  };

  const getTypeLabel = (type: ApprovalType): string => {
    switch (type) {
      case 'component_addition':
        return 'Component Addition';
      case 'spec_edit':
        return 'Specification Edit';
      case 'equipment_transfer':
        return 'Equipment Transfer';
      default:
        return type;
    }
  };

  const getTypeColor = (type: ApprovalType): string => {
    switch (type) {
      case 'component_addition':
        return 'bg-blue-100 text-blue-800';
      case 'spec_edit':
        return 'bg-purple-100 text-purple-800';
      case 'equipment_transfer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderApprovalDetails = (approval: ApprovalRequest) => {
    switch (approval.type) {
      case 'component_addition':
        const compData = approval.data as any;
        return (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-600">Location</p>
              <p className="text-sm">{compData.locationName} ({compData.locationType})</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Component Details</p>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <p><strong>Name:</strong> {compData.component.name}</p>
                <p><strong>Type:</strong> {compData.component.type}</p>
                {compData.component.brand && <p><strong>Brand:</strong> {compData.component.brand}</p>}
                {compData.component.model && <p><strong>Model:</strong> {compData.component.model}</p>}
                <p><strong>Quantity:</strong> {compData.component.quantity}</p>
                <p><strong>Condition:</strong> {compData.component.condition}</p>
                {compData.component.notes && <p><strong>Notes:</strong> {compData.component.notes}</p>}
              </div>
            </div>
          </div>
        );

      case 'spec_edit':
        const specData = approval.data as any;
        return (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-600">Location</p>
              <p className="text-sm">{specData.locationName} ({specData.locationType})</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Changes</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-xs font-semibold text-red-800 mb-2">Old Specifications</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Processor:</strong> {specData.oldSpecs.processor}</p>
                    <p><strong>RAM:</strong> {specData.oldSpecs.ram}</p>
                    <p><strong>ROM:</strong> {specData.oldSpecs.rom}</p>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs font-semibold text-green-800 mb-2">New Specifications</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Processor:</strong> {specData.newSpecs.processor}</p>
                    <p><strong>RAM:</strong> {specData.newSpecs.ram}</p>
                    <p><strong>ROM:</strong> {specData.newSpecs.rom}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'equipment_transfer':
        const transData = approval.data as any;
        return (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-600">Equipment</p>
              <p className="text-sm">{transData.equipmentName} (Quantity: {transData.quantity})</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">From</p>
                <p className="text-sm">{transData.sourceLocation}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">To</p>
                <p className="text-sm">{transData.destinationLocation}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Reason</p>
              <p className="text-sm">{transData.reason}</p>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">No details available</p>;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve or reject pending requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">{approvals.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Component Additions</p>
                <p className="text-2xl font-bold">
                  {approvals.filter(a => a.type === 'component_addition').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spec Edits</p>
                <p className="text-2xl font-bold">
                  {approvals.filter(a => a.type === 'spec_edit').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transfers</p>
                <p className="text-2xl font-bold">
                  {approvals.filter(a => a.type === 'equipment_transfer').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="component_addition">Component Additions</SelectItem>
                <SelectItem value="spec_edit">Specification Edits</SelectItem>
                <SelectItem value="equipment_transfer">Equipment Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending approvals at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          filteredApprovals.map(approval => (
            <Card key={approval.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(approval.type)}>
                        {getTypeLabel(approval.type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(approval.requestedAt), 'PPp')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      Request from {approval.requesterName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {approval.requesterRole} • ID: {approval.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => {
                        setSelectedApproval(approval);
                        setActionType('approve');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedApproval(approval);
                        setActionType('reject');
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                {renderApprovalDetails(approval)}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approval/Rejection Dialog */}
      {selectedApproval && actionType && (
        <Dialog
          open={!!selectedApproval && !!actionType}
          onOpenChange={() => {
            setSelectedApproval(null);
            setActionType(null);
            setComment('');
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve'
                  ? 'Add an optional comment for the requester'
                  : 'Please provide a reason for rejection'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="comment">
                  {actionType === 'approve' ? 'Comment (Optional)' : 'Reason for Rejection *'}
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any comments or instructions...'
                      : 'Explain why this request is being rejected...'
                  }
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApproval(null);
                  setActionType(null);
                  setComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PendingApprovals;
