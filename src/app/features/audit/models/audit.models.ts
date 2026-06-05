export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestBody?: Record<string, unknown>;
  changesBefore?: Record<string, unknown>;
  changesAfter?: Record<string, unknown>;
  responseStatus?: number;
  errorMessage?: string;
  integrityHash?: string;
  createdAt: string;
  clientTime?: string;
  sessionId?: string;
  severity?: string;
  executionTimeMs?: number;
  valid: boolean;
}

export interface AuditPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditFilters {
  tenantId?: string;
  userIdentifier?: string;
  actionType?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
}

export interface IntegrityCheckResult {
  id: string;
  valid: boolean;
  message: string;
}
