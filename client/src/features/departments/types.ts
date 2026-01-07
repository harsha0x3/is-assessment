// department_schemas.ts
import type { UserOut } from "../auth/types";

export interface DepartmentCreate {
  name: string;
  description?: string | null;
}

export interface DepartmentOut {
  id: number;
  name: string;
  description?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface AppDepartmentOut extends DepartmentOut {
  status: string;
}

export interface NewUserDepartmentAssign {
  user_id: string;
  role?: string | null;
}

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

export interface DepartmentInfo extends AppDepartmentOut {
  comments: CommentOut[];
}
