import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { transferAPI } from '@/services/api';
import { CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TransferRequest {
    _id: string;
    equipmentId: {
        _id: string;
        sysID: string;
        labName: string;
    };
    equipmentSnapshot: {
        sysID: string;
        processor?: string;
        ram?: string;
        hdd?: string;
        softwareAvailable?: string;
    };
    sourceLocation: {
        _id: string;
        name: string;
        type: string;
        building?: string;
        floor?: string;
    };
    destinationLocation: {
        _id: string;
        name: string;
        type: string;
        building?: string;
        floor?: string;
    };
    requestedBy: {
        _id: string;
        name: string;
        email: string;
    };
    approvedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    requestedAt: string;
    approvedAt?: string;
    notes?: string;
    rejectionReason?: string;
}

const TransferApproval = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState<TransferRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [actionNotes, setActionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response: any = await transferAPI.getAll();
            if (response && response.data) {
                setRequests(response.data);
            }
        } catch (error) {
            console.error('Error fetching transfer requests:', error);
            toast({
                title: "Error",
                description: "Failed to fetch transfer requests",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (request: TransferRequest) => {
        setSelectedRequest(request);
        setIsDialogOpen(true);
        setActionType(null);
        setActionNotes('');
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setIsSubmitting(true);
        try {
            await transferAPI.approve(selectedRequest._id, actionNotes || undefined);
            toast({
                title: "Success",
                description: "Transfer request approved and equipment moved successfully",
            });
            setIsDialogOpen(false);
            fetchRequests();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to approve transfer request",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !actionNotes.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for rejection",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await transferAPI.reject(selectedRequest._id, actionNotes);
            toast({
                title: "Success",
                description: "Transfer request rejected",
            });
            setIsDialogOpen(false);
            fetchRequests();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to reject transfer request",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
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

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const approvedRequests = requests.filter(r => r.status === 'approved');
    const rejectedRequests = requests.filter(r => r.status === 'rejected');

    const renderRequestsTable = (requestsList: TransferRequest[]) => {
        if (requestsList.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    No requests found
                </div>
            );
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Equipment</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Requested By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requestsList.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell className="font-medium">
                                    {request.equipmentSnapshot.sysID}
                                    <div className="text-xs text-muted-foreground">
                                        {request.equipmentSnapshot.processor}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {request.sourceLocation.name}
                                    <div className="text-xs text-muted-foreground">
                                        {request.sourceLocation.type}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {request.destinationLocation.name}
                                    <div className="text-xs text-muted-foreground">
                                        {request.destinationLocation.type}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {request.requestedBy.name}
                                    <div className="text-xs text-muted-foreground">
                                        {request.requestedBy.email}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(request.requestedAt), 'h:mm a')}
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(request)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Transfer Approvals</h2>
                <p className="text-muted-foreground">Review and approve equipment transfer requests</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer Requests</CardTitle>
                    <CardDescription>Manage equipment transfer requests from staff and lab technicians</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pending">
                                    Pending ({pendingRequests.length})
                                </TabsTrigger>
                                <TabsTrigger value="approved">
                                    Approved ({approvedRequests.length})
                                </TabsTrigger>
                                <TabsTrigger value="rejected">
                                    Rejected ({rejectedRequests.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending" className="mt-4">
                                {renderRequestsTable(pendingRequests)}
                            </TabsContent>
                            <TabsContent value="approved" className="mt-4">
                                {renderRequestsTable(approvedRequests)}
                            </TabsContent>
                            <TabsContent value="rejected" className="mt-4">
                                {renderRequestsTable(rejectedRequests)}
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Transfer Request Details</DialogTitle>
                        <DialogDescription>
                            Review the transfer request information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            {/* Equipment Details */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Equipment Information</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p><strong>System ID:</strong> {selectedRequest.equipmentSnapshot.sysID}</p>
                                    <p><strong>Processor:</strong> {selectedRequest.equipmentSnapshot.processor || 'N/A'}</p>
                                    <p><strong>RAM:</strong> {selectedRequest.equipmentSnapshot.ram || 'N/A'}</p>
                                    <p><strong>HDD:</strong> {selectedRequest.equipmentSnapshot.hdd || 'N/A'}</p>
                                    {selectedRequest.equipmentSnapshot.softwareAvailable && (
                                        <p><strong>Software:</strong> {selectedRequest.equipmentSnapshot.softwareAvailable}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Transfer Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">From</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p className="font-medium">{selectedRequest.sourceLocation.name}</p>
                                        <p className="text-muted-foreground capitalize">{selectedRequest.sourceLocation.type}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">To</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p className="font-medium">{selectedRequest.destinationLocation.name}</p>
                                        <p className="text-muted-foreground capitalize">{selectedRequest.destinationLocation.type}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Request Info */}
                            <div className="space-y-2">
                                <p className="text-sm"><strong>Requested by:</strong> {selectedRequest.requestedBy.name} ({selectedRequest.requestedBy.email})</p>
                                <p className="text-sm"><strong>Requested on:</strong> {format(new Date(selectedRequest.requestedAt), 'PPpp')}</p>
                                <p className="text-sm"><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
                                {selectedRequest.notes && (
                                    <div>
                                        <p className="text-sm font-medium mb-1">Notes:</p>
                                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{selectedRequest.notes}</p>
                                    </div>
                                )}
                                {selectedRequest.rejectionReason && (
                                    <div>
                                        <p className="text-sm font-medium mb-1">Rejection Reason:</p>
                                        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{selectedRequest.rejectionReason}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Section for Pending Requests */}
                            {selectedRequest.status === 'pending' && !actionType && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        className="flex-1"
                                        onClick={() => setActionType('approve')}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="destructive"
                                        onClick={() => setActionType('reject')}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {/* Approve Form */}
                            {actionType === 'approve' && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div>
                                        <label className="text-sm font-medium">Admin Notes (Optional)</label>
                                        <Textarea
                                            value={actionNotes}
                                            onChange={(e) => setActionNotes(e.target.value)}
                                            placeholder="Add any notes about this approval..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setActionType(null);
                                                setActionNotes('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleApprove}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Approving...
                                                </>
                                            ) : (
                                                'Confirm Approval'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Reject Form */}
                            {actionType === 'reject' && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div>
                                        <label className="text-sm font-medium">Rejection Reason *</label>
                                        <Textarea
                                            value={actionNotes}
                                            onChange={(e) => setActionNotes(e.target.value)}
                                            placeholder="Explain why this request is being rejected..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setActionType(null);
                                                setActionNotes('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleReject}
                                            disabled={isSubmitting || !actionNotes.trim()}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Rejecting...
                                                </>
                                            ) : (
                                                'Confirm Rejection'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TransferApproval;
