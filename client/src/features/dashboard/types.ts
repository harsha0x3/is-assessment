// types.ts

export interface StatusCountItem {
  status: string;
  count: number;
}

export interface PriorityCountItem {
  priority: string;
  total_apps: number;
  statuses: StatusCountItem[];
}

export interface ApplicationStatusSummary {
  total_apps: number;
  status_chart: StatusCountItem[];
}

export interface DepartmentStatusItem {
  status: string;
  count: number;
}

export interface DepartmentSummaryItem {
  department_id: number;
  department: string; // "finance"
  statuses: DepartmentStatusItem[];
}

export interface DepartmentSummaryResponse {
  departments: DepartmentSummaryItem[];
  total_apps: number;
}

export interface DashboardSummaryResponse {
  application_summary: ApplicationStatusSummary;
  department_summary: {
    departments: DepartmentSummaryItem[];
  };
}

export interface VerticalStatusSummary {
  vertical: string;
  total: number;
  statuses: StatusCountItem[];
}

export interface DonutData {
  name: string;
  value: number; // percentage
  count: number; // raw count
}

export interface DeptStatusCount {
  department_id: number;
  department: string;
  count: number;
}

export interface CategoryStatusItem {
  cat_status: string;
  count: number;
}

export interface CategorySummaryItem {
  category: string;
  total: number;
  statuses: CategoryStatusItem[];
}

export interface DepartmentCategorySummaryResponse {
  department_id: number;
  dept_status: string;
  categories: CategorySummaryItem[];
}

export interface DepartmentStatusSummaryParams {
  app_status: string; // e.g. "pending", "approved", "all"
  dept_status: string; // e.g. "active", "inactive"
  department_id: number;
  sla_filter?: number | null; // 30 | 60 | 90 | 91 | null
}
