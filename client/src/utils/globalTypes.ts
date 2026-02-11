export type AppStatuses =
  | "new_request"
  | "in_progress"
  | "not_yet_started"
  | "completed"
  | "reopen"
  | "closed"
  | "cancelled"
  | "go_live"
  | "hold";

export type DeptStatuses =
  | "yet_to_connect"
  | "in_progress"
  | "cleared"
  | "closed"
  | "hold"
  | "go_live";

export type AppStatusOption = {
  value: AppStatuses;
  label: string;
};

export type SelectItemType = {
  value: string;
  label: string;
};

export type DeptStatusOption = {
  value: DeptStatuses;
  label: string;
};
