// imports assumed to exist

import type { UserOut } from "../auth/types";

/**
 * CreateEvidenceRequest
 */
export interface CreateEvidenceRequest {
  uploader_id: string;
  evidence_path: string;
  severity: string;
}

/**
 * CreateEvidenceSchema
 * Extends CreateEvidenceRequest
 */
export interface CreateEvidenceSchema extends CreateEvidenceRequest {
  application_id: string;
  comment_id?: string | null;
}

/**
 * EvidenceUploader
 */
export interface EvidenceUploader {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name?: string | null;
}

/**
 * EvidenceOut
 */
export interface EvidenceOut {
  id: string;
  application_id: string;
  uploader_id: string;
  evidence_path: string;
  severity: string;
  comment_id: string;
  uploader: EvidenceUploader;
  created_at: string;
}

/**
 * EvidenceResponse
 * Extends EvidenceOut
 */
interface DepartmentOut {
  id: number;
  name: string;
  description?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

interface CommentOut {
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

export interface EvidenceResponse extends EvidenceOut {
  comment: CommentOut;
  uploader: EvidenceUploader;
}
