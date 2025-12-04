export interface Laboratory {
    _id: string;
    name: string;
    type: 'laboratory' | 'classroom';
    serialNumber: number;
    numberOfSystems: number;
    systemConfiguration: string;
    software: string[];
    additionalEquipment: string[];
    department: string;
    building: string;
    floor: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LaboratoryFormData {
    name: string;
    type: 'laboratory' | 'classroom';
    serialNumber: number;
    numberOfSystems?: number;
    systemConfiguration?: string;
    software?: string[];
    additionalEquipment?: string[];
    department?: string;
    building?: string;
    floor?: string;
}

export interface LaboratoryFilters {
    type?: 'laboratory' | 'classroom';
    department?: string;
    search?: string;
}

export interface LaboratoryStats {
    totalLaboratories: number;
    totalClassrooms: number;
    totalSystems: number;
    totalLocations: number;
}
