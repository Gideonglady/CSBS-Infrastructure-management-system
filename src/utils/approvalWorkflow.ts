import { ApprovalRequest, ApprovalType, NotificationPayload } from '@/types';

/**
 * Create a new approval request
 */
export const createApprovalRequest = (
  type: ApprovalType,
  data: any,
  requesterId: string,
  requesterName: string,
  requesterRole: string
): ApprovalRequest => {
  const approvalRequest: ApprovalRequest = {
    id: `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    requesterId,
    requesterName,
    requesterRole,
    requestedAt: new Date(),
    status: 'pending',
    data
  };

  // Save to localStorage
  try {
    const stored = localStorage.getItem('dims-approvals');
    const approvals = stored ? JSON.parse(stored) : [];
    approvals.unshift(approvalRequest);
    localStorage.setItem('dims-approvals', JSON.stringify(approvals));
  } catch (error) {
    console.error('Error saving approval request:', error);
  }

  return approvalRequest;
};

/**
 * Approve an approval request
 */
export const approveRequest = (
  requestId: string,
  adminId: string,
  adminName: string,
  comment?: string
): boolean => {
  try {
    const stored = localStorage.getItem('dims-approvals');
    if (!stored) return false;

    const approvals: ApprovalRequest[] = JSON.parse(stored);
    const index = approvals.findIndex(a => a.id === requestId);
    
    if (index === -1) return false;

    approvals[index].status = 'approved';
    approvals[index].approvedBy = adminId;
    approvals[index].approvedByName = adminName;
    approvals[index].approvedAt = new Date();

    localStorage.setItem('dims-approvals', JSON.stringify(approvals));

    // Apply the approved changes based on type
    applyApprovedChanges(approvals[index]);

    // Notify requester
    notifyRequester(approvals[index], 'approved', comment);

    return true;
  } catch (error) {
    console.error('Error approving request:', error);
    return false;
  }
};

/**
 * Reject an approval request
 */
export const rejectRequest = (
  requestId: string,
  adminId: string,
  adminName: string,
  reason: string
): boolean => {
  try {
    const stored = localStorage.getItem('dims-approvals');
    if (!stored) return false;

    const approvals: ApprovalRequest[] = JSON.parse(stored);
    const index = approvals.findIndex(a => a.id === requestId);
    
    if (index === -1) return false;

    approvals[index].status = 'rejected';
    approvals[index].approvedBy = adminId;
    approvals[index].approvedByName = adminName;
    approvals[index].approvedAt = new Date();
    approvals[index].rejectionReason = reason;

    localStorage.setItem('dims-approvals', JSON.stringify(approvals));

    // Notify requester
    notifyRequester(approvals[index], 'rejected', reason);

    return true;
  } catch (error) {
    console.error('Error rejecting request:', error);
    return false;
  }
};

/**
 * Notify admin about new approval request
 */
export const notifyAdmin = (approvalRequest: ApprovalRequest): void => {
  const notification: NotificationPayload = {
    id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'admin',
    title: 'New Approval Request',
    message: getApprovalMessage(approvalRequest),
    type: 'approval',
    read: false,
    createdAt: new Date(),
    actionUrl: '/admin/approvals',
    metadata: {
      approvalId: approvalRequest.id
    }
  };

  saveNotification(notification);
};

/**
 * Notify requester about approval decision
 */
const notifyRequester = (
  approvalRequest: ApprovalRequest,
  decision: 'approved' | 'rejected',
  comment?: string
): void => {
  const notification: NotificationPayload = {
    id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: approvalRequest.requesterId,
    title: `Request ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Your ${getApprovalTypeLabel(approvalRequest.type)} request has been ${decision}.${comment ? ` Reason: ${comment}` : ''}`,
    type: decision === 'approved' ? 'success' : 'error',
    read: false,
    createdAt: new Date(),
    metadata: {
      approvalId: approvalRequest.id
    }
  };

  saveNotification(notification);
};

/**
 * Apply approved changes to the system
 */
const applyApprovedChanges = (approvalRequest: ApprovalRequest): void => {
  switch (approvalRequest.type) {
    case 'component_addition':
      applyComponentAddition(approvalRequest);
      break;
    case 'spec_edit':
      applySpecEdit(approvalRequest);
      break;
    case 'equipment_transfer':
      applyEquipmentTransfer(approvalRequest);
      break;
  }
};

/**
 * Apply component addition
 */
const applyComponentAddition = (approvalRequest: ApprovalRequest): void => {
  // Implementation would add the component to the location
  console.log('Applying component addition:', approvalRequest.data);
  // This would update the classroom/laboratory equipment list
};

/**
 * Apply spec edit
 */
const applySpecEdit = (approvalRequest: ApprovalRequest): void => {
  const data = approvalRequest.data as any;
  try {
    const stored = localStorage.getItem('dims-system-specs');
    const specs = stored ? JSON.parse(stored) : [];
    
    const index = specs.findIndex(
      (s: any) => s.locationId === data.locationId && s.locationType === data.locationType
    );

    const updatedSpec = {
      id: index >= 0 ? specs[index].id : `SPEC-${Date.now()}`,
      locationId: data.locationId,
      locationType: data.locationType,
      locationName: data.locationName,
      processor: data.newSpecs.processor,
      ram: data.newSpecs.ram,
      rom: data.newSpecs.rom,
      lastUpdated: new Date(),
      updatedBy: approvalRequest.requesterId,
      updatedByName: approvalRequest.requesterName
    };

    if (index >= 0) {
      specs[index] = updatedSpec;
    } else {
      specs.push(updatedSpec);
    }

    localStorage.setItem('dims-system-specs', JSON.stringify(specs));
  } catch (error) {
    console.error('Error applying spec edit:', error);
  }
};

/**
 * Apply equipment transfer
 */
const applyEquipmentTransfer = (approvalRequest: ApprovalRequest): void => {
  const data = approvalRequest.data as any;
  try {
    const stored = localStorage.getItem('dims-equipment-transfers');
    const transfers = stored ? JSON.parse(stored) : [];
    
    const index = transfers.findIndex((t: any) => t.id === data.transferId);
    if (index >= 0) {
      transfers[index].status = 'approved';
      transfers[index].approvedBy = approvalRequest.approvedBy;
      transfers[index].approvedByName = approvalRequest.approvedByName;
      transfers[index].approvedAt = approvalRequest.approvedAt;
      localStorage.setItem('dims-equipment-transfers', JSON.stringify(transfers));
    }
  } catch (error) {
    console.error('Error applying equipment transfer:', error);
  }
};

/**
 * Get approval message for notification
 */
const getApprovalMessage = (approvalRequest: ApprovalRequest): string => {
  switch (approvalRequest.type) {
    case 'component_addition':
      const compData = approvalRequest.data as any;
      return `${approvalRequest.requesterName} wants to add ${compData.component.name} to ${compData.locationName}`;
    case 'spec_edit':
      const specData = approvalRequest.data as any;
      return `${approvalRequest.requesterName} wants to update system specifications for ${specData.locationName}`;
    case 'equipment_transfer':
      const transData = approvalRequest.data as any;
      return `${approvalRequest.requesterName} wants to transfer ${transData.equipmentName} from ${transData.sourceLocation} to ${transData.destinationLocation}`;
    default:
      return `New approval request from ${approvalRequest.requesterName}`;
  }
};

/**
 * Get approval type label
 */
const getApprovalTypeLabel = (type: ApprovalType): string => {
  switch (type) {
    case 'component_addition':
      return 'component addition';
    case 'spec_edit':
      return 'specification edit';
    case 'equipment_transfer':
      return 'equipment transfer';
    default:
      return 'approval';
  }
};

/**
 * Save notification to localStorage
 */
const saveNotification = (notification: NotificationPayload): void => {
  try {
    const stored = localStorage.getItem('dims-notifications');
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.unshift(notification);
    localStorage.setItem('dims-notifications', JSON.stringify(notifications));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

/**
 * Get all pending approvals
 */
export const getPendingApprovals = (): ApprovalRequest[] => {
  try {
    const stored = localStorage.getItem('dims-approvals');
    if (!stored) return [];
    const approvals: ApprovalRequest[] = JSON.parse(stored);
    return approvals.filter(a => a.status === 'pending');
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    return [];
  }
};

/**
 * Get approval count
 */
export const getPendingApprovalCount = (): number => {
  return getPendingApprovals().length;
};
