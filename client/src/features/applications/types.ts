import type { AppStatuses } from "@/utils/globalTypes";
import type {
  AppDeptOutWithLatestComment,
  DepartmentOut,
} from "../departments/types";
import type { CommentOut } from "../comments/types";
import type { VerticalItem } from "../verticals/types";

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
  imitra_ticket_id?: string | null;
  titan_spoc?: string | null;

  app_url?: string | null;
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
  status?: AppStatuses;
  app_priority?: number;
  started_at?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
  requested_date?: string | null;

  imitra_ticket_id?: string | null;
  titan_spoc?: string | null;
  app_url?: string | null;

  user_type?: string | null;
  data_type?: string | null;

  app_type?: string | null;
  is_app_ai?: boolean;
  is_privacy_applicable?: boolean;

  app_vertical?: VerticalItem;
  vertical_id?: number | null;

  severity?: number;

  scope?: string | null;

  departments?: DepartmentOut[];
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
  app_priority?: number;
  priority?: number;
  vertical?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  due_date?: string | null;
  imitra_ticket_id?: string | null;
  titan_spoc?: string | null;

  app_url?: string | null;

  user_type?: string | null;
  data_type?: string | null;

  app_type?: string | null;
  is_app_ai?: boolean | null;
  is_privacy_applicable?: boolean;
  vertical_id?: number | null;
}

export interface NewAppListOut {
  id: string;
  name: string;
  description?: string;
  ticket_id?: string | null;
  vertical?: string | null;
  imitra_ticket_id?: string | null;
  status: AppStatuses;
  app_priority?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  app_url?: string;
  vendor_company?: string;
  departments?: AppDeptOutWithLatestComment[] | null;
  latest_comment?: CommentOut;
  titan_spoc?: string | null;
  environment?: string;
  due_date?: string | null;

  is_app_ai?: boolean;
  is_privacy_applicable?: boolean;
  app_type?: string;
  severity?: number;

  app_vertical?: VerticalItem;
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
  status?: string[];
  dept_filter_id?: string;
  dept_status?: string;
  app_priority?: string[];
  vertical?: string;
  severity?: string;
  app_type?: string;
  app_features?: string;

  app_age_from?: string;
  app_age_to?: string;
  scope?: string;

  environment?: "internal" | "external" | string;

  vertical_ids?: string;
}

export interface AppStatusSummary {
  in_progress: number;
  not_yet_started: number;
  closed: number;
  new_request: number;
  cancelled: number;
  completed: number;
  reopen: number;
  go_live: number;
  hold: number;
}

export interface PriorityCounts {
  "1": string;
  "2": string;
  "3": string;
  "0": string;
}

export interface AppsSummary {
  app_statuses: AppStatusSummary;
  priority_counts: PriorityCounts;
  total_apps: number;
  ai_app_count: number;
  privacy_app_count: number;
  mobile_app_count: number;
  web_app_count: number;
  mobile_web_app_count: number;
  internal_environment_count: number;
  external_environment_count: number;
}
