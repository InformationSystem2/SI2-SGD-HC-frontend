export interface TenantRegisterRequestDto {
  tenantName: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone?: string;
  adminDocumentType: string;
  adminDocumentNumber: string;
  adminGender: string;
  selectedPlan: string;
}

export interface TenantRegisterResponseDto {
  tenantId: string;
  adminUsername: string;
  message: string;
}

export interface TenantPaymentRequestDto {
  tenantId: string;
}
