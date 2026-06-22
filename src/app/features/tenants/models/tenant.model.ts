export interface TenantRegisterRequestDto {
  sessionToken: string;
  tenantName: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone?: string;
  adminDocumentType: string;
  adminDocumentNumber: string;
  adminGender: string;
  selectedPlan?: string;
  validationCode: string;
}

export interface TenantRegisterResponseDto {
  tenantId: string;
  adminUsername: string;
  message: string;
}

export interface TenantPaymentRequestDto {
  sessionToken: string;
  paymentIntentId?: string;
}

export interface TenantInfo {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  billingCycle: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminEmail?: string;
  adminPhone?: string;
  logoUrl?: string;
}

export interface TenantStats {
  userCount: number;
  maxUsers: number;
  storageUsedMB: number;
  maxStorageMB: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  patientCount: number;
  maxPatients: number;
  documentCount: number;
  maxDocuments: number;
  dicomStudyCount: number;
  maxDicomStudies: number;
  roleCount: number;
  maxStaffRoles: number;
}

export interface TenantLimits {
  maxUsers: number;
  maxStorageMB: number;
  maxApiCallsPerMonth: number;
}

export interface TenantRegional {
  timezone: string;
  locale: string;
  dateFormat: string;
  currency: string;
}

export interface TenantNotifications {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export interface TenantSecurity {
  sessionTimeoutMinutes: number;
  passwordExpiryDays: number;
  require2FA: boolean;
}

export interface TenantSettings {
  limits: TenantLimits;
  regional: TenantRegional;
  notifications: TenantNotifications;
  security: TenantSecurity;
}

export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionEndDate: string;
  adminName: string | null;
  adminEmail: string | null;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  billingCycle: string;
  settings: Record<string, unknown> | null;
  admin: TenantAdminInfo | null;
  stats: TenantStats;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInfoDto {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionEndDate: string;
  billingCycle: string;
  adminName: string | null;
  adminEmail: string | null;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAdminInfo {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface TenantUsage {
  currentUsers: number;
  maxUsers: number;
  storageUsedMB: number;
  maxStorageMB: number;
  apiCallsUsed: number;
  maxApiCalls: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TenantStatusUpdate {
  action: 'SUSPEND' | 'REACTIVATE';
}

export interface TenantDeleteRequest {
  confirmText: string;
}

export type TenantFilterStatus = 'ALL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'PAST_DUE' | 'CANCELED';
