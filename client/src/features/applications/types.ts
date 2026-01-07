import type { AppDepartmentOut } from "../departments/types";

// app_schemas.ts
export interface ApplicationCreate {
  name: string;
  description?: string | null;
  environment?: string | null;
  region?: string | null;
  owner_name?: string | null;
  vendor_company?: string | null;
  infra_host?: string | null;
  app_tech?: string | null;
  app_priority?: number;
  priority?: number;
  vertical?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
}

export interface ApplicationOut {
  id: string;
  name: string;
  description?: string | null;
  environment?: string | null;
  region?: string | null;
  owner_name?: string | null;
  vendor_company?: string | null;
  infra_host?: string | null;
  app_tech?: string | null;
  priority?: number;
  vertical?: string | null;
  is_active: boolean;
  is_completed: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  owner_id?: string | null;
  ticket_id?: string | null;
  status?: string;
  app_priority?: number;
  started_at?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
}

export interface ApplicationUpdate {
  name?: string | null;
  description?: string | null;
  environment?: string | null;
  region?: string | null;
  owner_name?: string | null;
  vendor_company?: string | null;
  infra_host?: string | null;
  app_tech?: string | null;
  priority?: number | null;
  vertical?: string | null;
  app_priority?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
}

export interface NewAppListOut {
  id: string;
  name: string;
  ticket_id?: string | null;
  vertical?: string | null;
  imitra_ticket_id?: string | null;
  is_completed: boolean;
  status: string;
  priority?: number;
  app_priority?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
  departments?: AppDepartmentOut[] | null;
}

export interface AppQueryParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string | null;
  search_by?:
    | "name"
    | "environment"
    | "region"
    | "owner_name"
    | "vendor_company"
    | "vertical"
    | "ticket_id";
  page?: number;
  page_size?: number;
}

// ---------- OLD -----------

// export interface ListApplicationsOut {
//   id: string;
//   name: string;
//   description?: string | null;
//   ticket_id?: string | null;
//   is_completed: boolean;
//   status: string;
//   priority?: number;
//   app_priority?: number | null;
//   started_at?: string | null;
//   completed_at?: string | null;
//   due_date?: string | null;
//   checklists?: ChecklistOut[] | null;
// }
