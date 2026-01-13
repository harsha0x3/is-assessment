import type {
  AppStatuses,
  AppStatusOption,
  DeptStatusOption,
} from "./globalTypes";

export const AppStatusValues: AppStatuses[] = [
  "completed",
  "in_progress",
  "new_request",
  "not_yet_started",
  "pending",
  "reopen",
  "closed",
  "cancelled",
];

export const AppStatusOptions: AppStatusOption[] = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "new_request", label: "New Request" },
  { value: "not_yet_started", label: "Not Yet Started" },
  { value: "pending", label: "Pending" },
  { value: "reopen", label: "Reopen" },
  { value: "closed", label: "Closed" },
];

export const DeptStatusOptions: DeptStatusOption[] = [
  { value: "yet_to_connect", label: "Yet to connect" },
  { value: "in_progress", label: "In Progress" },
  { value: "cleared", label: "Cleared" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export const STATUS_COLOR_MAP_FG: Record<
  AppStatuses | "yet_to_connect" | "cleared",
  string
> = {
  new_request: "var(--status-new-request-fg)",
  not_yet_started: "var(--status-not-yet-started-fg)",
  pending: "var(--status-pending-fg)",
  in_progress: "var(--status-in-progress-fg)",
  completed: "var(--status-completed-fg)",
  closed: "var(--status-closed-fg)",
  reopen: "var(--status-reopen-fg)",
  cancelled: "var(--status-cancelled-fg)",
  yet_to_connect: "var(--status-not-yet-started-fg)",
  cleared: "var(--status-completed-fg)",
};

export const STATUS_COLOR_MAP_BG: Record<
  AppStatuses | "yet_to_connect" | "cleared",
  string
> = {
  new_request: "var(--status-new-request-bg)",
  not_yet_started: "var(--status-not-yet-started-bg)",
  pending: "var(--status-pending-bg)",
  in_progress: "var(--status-in-progress-bg)",
  completed: "var(--status-completed-bg)",
  closed: "var(--status-closed-bg)",
  reopen: "var(--status-reopen-bg)",
  cancelled: "var(--status-cancelled-bg)", // fallback
  yet_to_connect: "var(--status-not-yet-started-bg)",
  cleared: "var(--status-completed-bg)",
};
