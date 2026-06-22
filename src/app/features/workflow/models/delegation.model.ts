export interface DelegationUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface TaskDelegation {
  id: string;
  tenantId: string;
  delegator: DelegationUser;
  delegate: DelegationUser;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateDelegationRequest {
  delegateId: string;
  startDate: string;
  endDate?: string;
}
