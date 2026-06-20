export type ReviewTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReviewTaskOutcome = 'APPROVED' | 'REJECTED';
export type WorkflowEventType =
  | 'DOCUMENT_CREATED' | 'SENT_TO_REVIEW' | 'TASK_ASSIGNED' | 'TASK_CLAIMED'
  | 'COMMENT_ADDED' | 'TASK_APPROVED' | 'TASK_REJECTED' | 'TASK_CANCELLED'
  | 'TASK_OVERDUE' | 'DOCUMENT_FINALIZED' | 'DOCUMENT_REJECTED' | 'DOCUMENT_CORRECTED';

export interface ReviewTask {
  id: string;
  documentId: string;
  assignedToId: string;
  assignedToName: string;
  status: ReviewTaskStatus;
  outcome?: ReviewTaskOutcome;
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
  reviewTaskId?: string;
}
