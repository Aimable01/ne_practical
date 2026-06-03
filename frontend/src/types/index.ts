export type UserRole = 'ADMIN' | 'INSPECTOR' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export type ExtinguisherType = 'WATER' | 'CO2' | 'FOAM' | 'DRY_CHEMICAL';
export type ExtinguisherSize = '2.5lbs' | '5lbs' | '9lbs' | '12lbs';
export type ExtinguisherStatus = 'ACTIVE' | 'EXPIRED' | 'MAINTENANCE_REQUIRED' | 'OUT_OF_SERVICE';

export interface Extinguisher {
  id: string;
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type InspectionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface Inspection {
  id: string;
  extinguisherId: string;
  extinguisher?: Extinguisher;
  scheduledDate: string;
  scheduledTime: string;
  inspectorId: string;
  inspector?: User;
  status: InspectionStatus;
  result?: string;
  notes?: string;
  notified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Maintenance {
  id: string;
  extinguisherId: string;
  extinguisher?: Extinguisher;
  inspectorId: string;
  inspector?: User;
  actionsTaken: string;
  dateOfAction: string;
  conditionsNoted?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalExtinguishers: number;
  activeExtinguishers: number;
  expiredExtinguishers: number;
  maintenanceRequired: number;
  totalInspections: number;
  completedInspections: number;
  scheduledInspections: number;
  totalMaintenance: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}
