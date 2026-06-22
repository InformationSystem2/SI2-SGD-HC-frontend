export type ReviewTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReviewTaskOutcome = 'APPROVED' | 'REJECTED';
export type WorkflowStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type WorkflowEventType =
  | 'DOCUMENT_CREATED' | 'SENT_TO_REVIEW' | 'TASK_ASSIGNED' | 'TASK_CLAIMED'
  | 'COMMENT_ADDED' | 'TASK_APPROVED' | 'TASK_REJECTED' | 'TASK_CANCELLED'
  | 'TASK_OVERDUE' | 'DOCUMENT_FINALIZED' | 'DOCUMENT_REJECTED' | 'DOCUMENT_CORRECTED';

export interface ReviewTask {
  id: string;
  workflowId?: string;
  documentId: string;
  assignedToId: string;
  assignedToName: string;
  status: ReviewTaskStatus;
  outcome?: ReviewTaskOutcome;
  documentVersion?: number;
  priority: number;
  dueDate?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  completedById?: string;
  completedByName?: string;
}

export interface WorkflowEvent {
  id: string;
  eventType: WorkflowEventType;
  performedById?: string;
  performedByName?: string;
  performedAt: string;
  detailsJson?: Record<string, unknown>;
  result?: string;
  comment?: string;
  documentId?: string;
  documentName?: string;
}

export interface WorkflowComment {
  id: string;
  authorId: string;
  authorName: string;
  reviewTaskId?: string;
  commentText: string;
  createdAt: string;
}

export interface StartReviewRequest {
  documentId: string;
  reviewerIds: string[];
  priority?: number;
  dueDate?: string;
}

export interface CompleteTaskRequest {
  outcome: ReviewTaskOutcome;
  comment?: string;
}

export interface AddCommentRequest {
  commentText: string;
  documentId?: string;
  workflowId?: string;
  reviewTaskId?: string;
}

export interface WorkflowStats {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  overdueCount: number;
  completedLast30Days: number;
  avgHoursToComplete: number;
}

export interface WorkflowDocumentDto {
  id: string;
  documentId: string;
  documentName: string;
  documentStatus: string;
  addedAt: string;
}

export interface WorkflowTaskDto {
  id: string;
  documentId: string;
  documentName: string;
  assignedToId: string;
  assignedToName: string;
  status: ReviewTaskStatus;
  outcome?: ReviewTaskOutcome;
  documentVersion?: number;
  priority: number;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  completedById?: string;
  completedByName?: string;
}

export interface Workflow {
  id: string;
  title: string;
  message?: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  assigneeId: string;
  assigneeName: string;
  status: WorkflowStatus;
  priority: number;
  dueDate?: string;
  sendEmailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
  documents: WorkflowDocumentDto[];
  tasks: WorkflowTaskDto[];
  pendingTaskCount: number;
  completedTaskCount: number;
}

export interface WorkflowListStats {
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface TaskAssignmentDto {
  documentId: string;
  reviewerIds: string[];
}

export interface WorkflowCreateRequest {
  title: string;
  message?: string;
  assigneeId: string;
  priority?: number;
  dueDate?: string;
  documentIds?: string[];
  taskAssignments?: TaskAssignmentDto[];
  sendEmailNotifications?: boolean;
}
