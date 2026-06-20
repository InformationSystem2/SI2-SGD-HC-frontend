export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';
export type NotificationType =
  | 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'TASK_APPROVED' | 'TASK_REJECTED'
  | 'TASK_OVERDUE'  | 'DOC_REVIEW'     | 'DOC_FINALIZED' | 'DOC_REJECTED';

export interface Notification {
  id: string;
  channel: NotificationChannel;
  type: NotificationType;
  title?: string;
  message?: string;
  documentId?: string;
  reviewTaskId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface RegisterPushTokenRequest {
  token: string;
  platform: 'WEB' | 'ANDROID';
}
