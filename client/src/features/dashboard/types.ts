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
