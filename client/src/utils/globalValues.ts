import type { AppStatusStats } from "@/features/dashboard/types";
import type { AppStatuses } from "./globalTypes";

export const AppStatusValues: AppStatuses[] = [
  "completed",
  "in_progress",
  "new_request",
  "not_yet_started",
  "pending",
  "reopen",
  "closed",
];

export const STATUS_COLOR_MAP_FG: Record<keyof AppStatusStats, string> = {
  new_request: "var(--status-new-request-fg)",
  not_yet_started: "var(--status-not-yet-started-fg)",
  pending: "var(--status-pending-fg)",
  in_progress: "var(--status-in-progress-fg)",
  completed: "var(--status-completed-fg)",
  closed: "var(--status-closed-fg)",
  reopen: "var(--status-reopen-fg)",
  cancelled: "var(--status-cancelled-fg)", // fallback
};
export const STATUS_COLOR_MAP_BG: Record<keyof AppStatusStats, string> = {
  new_request: "var(--status-new-request-bg)",
  not_yet_started: "var(--status-not-yet-started-bg)",
  pending: "var(--status-pending-bg)",
  in_progress: "var(--status-in-progress-bg)",
  completed: "var(--status-completed-bg)",
  closed: "var(--status-closed-bg)",
  reopen: "var(--status-reopen-bg)",
  cancelled: "var(--status-cancelled-bg)", // fallback
};
