export * from './auth';
export * from './notifications';

// Infrastructure Types
export interface Classroom {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  responsiblePerson: string;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Laboratory {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  responsiblePerson: string;
  specializations: string[];
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'computer' | 'projector' | 'furniture' | 'safety' | 'experimental' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  quantity: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  warranty?: Date;
  notes?: string;
}

// Issue Management Types
export enum IssueStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REJECTED = 'rejected'
}



export enum IssueCategory {
  EQUIPMENT = 'equipment',
  FURNITURE = 'furniture',
  SAFETY = 'safety',
  CLEANLINESS = 'cleanliness',
  ELECTRICAL_AND_ELECTRONICS = 'electrical_and_electronics'
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  // Priority removed as per requirements
  status: IssueStatus;
  reporterId: string;
  reporterName: string;
  assignedTo?: string;
  assignedToName?: string;
  location: {
    type: 'classroom' | 'laboratory' | 'other';
    id?: string;
    name: string;
    building?: string;
    floor?: number;
  };
  images?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  comments: Comment[];
  estimatedResolution?: Date;
  actualCost?: number;
  tags?: string[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;
}

// Analytics Types
export interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  issuesByCategory: Record<IssueCategory, number>;
  issuesByStatus: Record<IssueStatus, number>;
  topReporters: Array<{ name: string; count: number }>;
  topResolvers: Array<{ name: string; count: number }>;
}

export interface ReportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories?: IssueCategory[];
  statuses?: IssueStatus[];
  reporters?: string[];
  assignedTo?: string[];
  locations?: string[];
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
