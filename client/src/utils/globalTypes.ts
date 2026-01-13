export type AppStatuses =
  | "new_request"
  | "in_progress"
  | "pending"
  | "not_yet_started"
  | "completed"
  | "reopen"
  | "closed"
  | "cancelled";

export type DeptStatuses =
  | "yet_to_connect"
  | "in_progress"
  | "cleared"
  | "closed"
  | "cancelled";

export type AppStatusOption = {
  value: AppStatuses;
  label: string;
};

export type DeptStatusOption = {
  value: DeptStatuses;
  label: string;
};
