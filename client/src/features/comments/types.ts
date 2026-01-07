// models/schemas/commentSchemas.ts

import type { UserOut } from "@/features/auth/types";
import type { DepartmentOut } from "@/features/departments/types";

/**
 * NewCommentRequest
 */
export interface NewCommentRequest {
  content: string;
}

/**
 * CommentInput
 * Extends NewCommentRequest
 */
export interface CommentInput extends NewCommentRequest {
  author_id: string;
  application_id: string;
  department_id: number;
}

/**
 * CommentOut
 */
export interface CommentOut {
  id: string;
  content: string;
  author_id: string;
  application_id: string;
  department_id: number;

  department: DepartmentOut;
  author: UserOut;

  created_at?: string; // ISO datetime string
  updated_at?: string; // ISO datetime string
}
