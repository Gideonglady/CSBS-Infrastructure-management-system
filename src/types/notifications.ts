// Notification and Approval Types

export interface SystemSpecification {
  id: string;
  locationId: string;
  locationType: 'classroom' | 'laboratory';
  locationName: string;
  processor: string;
  ram: string;
  rom: string;
  additionalSpecs?: Record<string, string>;
  lastUpdated: Date;
  updatedBy: string;
  updatedByName: string;
}

export interface EquipmentTransfer {
  id: string;
  equipmentId: string;
  equipmentName: string;
  sourceLocation: {
    type: 'classroom' | 'laboratory';
    id: string;
    name: string;
  };
  destinationLocation: {
    type: 'classroom' | 'laboratory';
    id: string;
    name: string;
  };
  quantity: number;
  reason: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  completedAt?: Date;
}

export type ApprovalType = 'component_addition' | 'spec_edit' | 'equipment_transfer';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  data: ComponentAdditionData | SpecEditData | EquipmentTransferData;
}

export interface ComponentAdditionData {
  locationId: string;
  locationType: 'classroom' | 'laboratory';
  locationName: string;
  component: {
    name: string;
    type: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    quantity: number;
    condition: string;
    notes?: string;
  };
}

export interface SpecEditData {
  locationId: string;
  locationType: 'classroom' | 'laboratory';
  locationName: string;
  oldSpecs: {
    processor: string;
    ram: string;
    rom: string;
  };
  newSpecs: {
    processor: string;
    ram: string;
    rom: string;
  };
}

export interface EquipmentTransferData {
  transferId: string;
  equipmentName: string;
  sourceLocation: string;
  destinationLocation: string;
  quantity: number;
  reason: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: {
    approvalId?: string;
    issueId?: string;
    transferId?: string;
    [key: string]: any;
  };
}
