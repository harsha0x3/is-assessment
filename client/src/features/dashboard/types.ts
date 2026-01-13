// types.ts

export interface StatusCountItem {
  status: string;
  count: number;
}

export interface ApplicationStats {
  total_apps: number;
  status_chart: StatusCountItem[];
}

export interface DepartmentStatusItem {
  status: string;
  count: number;
}

export interface DepartmentStatsItem {
  department: string; // "finance"
  statuses: DepartmentStatusItem[];
}

export interface DashboardStatsResponse {
  application_stats: ApplicationStats;
  department_stats: {
    departments: DepartmentStatsItem[];
  };
}

export interface DonutData {
  name: string;
  value: number; // percentage
  count: number; // raw count
}
