// department_schemas.ts
import type { DeptStatuses } from "@/utils/globalTypes";
import type { UserOut } from "../auth/types";

export interface ControlResultOut {
  id: number;
  name: string;
  status: string;
}
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
  status: DeptStatuses;
  started_at?: string;
  ended_at?: string;
  app_category?: string;
  category_status?: string;
  controls: ControlResultOut[];
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

  created_at?: string;
  updated_at?: string;
}

export interface DepartmentInfo extends DepartmentOut {
  status: DeptStatuses;
  started_at?: string;
  ended_at?: string;
  controls: ControlResultOut[];
  comments: CommentOut[];
  can_go_live: boolean;
  app_category?: string;
  category_status?: string;
}

export interface DepartmentStatusPayload {
  status?: string;
  app_category?: string;
  category_status?: string;
  started_at?: string;
}
