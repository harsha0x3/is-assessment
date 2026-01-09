export interface AppStatusStats {
  in_progress: number;
  not_yet_started: number;
  pending: number;
  closed: number;
  new_request: number;
  cancelled: number;
  completed: number;
  reopen: number;
}

export interface DashboardStats {
  total_apps: number;
  app_statuses: AppStatusStats;
}

export interface DonutData {
  name: keyof AppStatusStats;
  value: number; // percentage
  count: number; // raw count
  [key: string]: number | string;
}
