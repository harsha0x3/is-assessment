import type {
  AppStatuses,
  AppStatusOption,
  DeptStatusOption,
  SelectItemType,
} from "./globalTypes";

export const AppStatusValues: AppStatuses[] = [
  "completed",
  "in_progress",
  "new_request",
  "not_yet_started",
  "reopen",
  "closed",
  "cancelled",
  "go_live",
];

export const AppStatusOptions: AppStatusOption[] = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "new_request", label: "New Request" },
  { value: "not_yet_started", label: "Not Yet Started" },
  { value: "reopen", label: "Reopen" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "go_live", label: "Go Live" },
  { value: "hold", label: "Hold" },
];

export const DeptStatusOptions: DeptStatusOption[] = [
  { value: "yet_to_connect", label: "Yet to connect" },
  { value: "in_progress", label: "In Progress" },
  { value: "cleared", label: "Cleared" },
  { value: "closed", label: "Closed" },
  { value: "hold", label: "Hold" },
  { value: "go_live", label: "Go Live" },
];

export const STATUS_COLOR_MAP_FG: Record<
  AppStatuses | "yet_to_connect" | "cleared" | "hold",
  string
> = {
  new_request: "var(--status-new-request-fg)",
  not_yet_started: "var(--status-not-yet-started-fg)",
  in_progress: "var(--status-in-progress-fg)",
  completed: "var(--status-completed-fg)",
  closed: "var(--status-closed-fg)",
  reopen: "var(--status-reopen-fg)",
  cancelled: "var(--status-cancelled-fg)",
  yet_to_connect: "var(--status-not-yet-started-fg)",
  cleared: "var(--status-completed-fg)",
  hold: "var(--status-hold-fg)",
  go_live: "var(--status-go-live-fg)",
};

export const STATUS_COLOR_MAP_BG: Record<
  AppStatuses | "yet_to_connect" | "cleared" | "hold",
  string
> = {
  new_request: "var(--status-new-request-bg)",
  not_yet_started: "var(--status-not-yet-started-bg)",
  in_progress: "var(--status-in-progress-bg)",
  completed: "var(--status-completed-bg)",
  closed: "var(--status-closed-bg)",
  reopen: "var(--status-reopen-bg)",
  cancelled: "var(--status-cancelled-bg)", // fallback
  yet_to_connect: "var(--status-not-yet-started-bg)",
  cleared: "var(--status-completed-bg)",
  hold: "var(--status-hold-bg)",
  go_live: "var(--status-go-live-bg)",
};

export const PriorityLabelMap: Record<string, string> = {
  1: "low",
  2: "medium",
  3: "high",
};
export const PriorityValueMap: Record<string, string> = {
  low: "1",
  medium: "2",
  high: "3",
};

export const DepartmentCategoryMap: Record<string, SelectItemType[]> = {
  iam: [
    { value: "sso", label: "SSO" },
    { value: "scim", label: "SCIM" },
    { value: "both", label: "Both" },
  ],
  tprm: [
    { value: "privacy", label: "Privacy" },
    { value: "non_privacy", label: "Non Privacy" },
  ],
  vapt: [
    { value: "mobile", label: "Mobile" },
    { value: "web", label: "Web" },
    { value: "ai", label: "AI" },
    { value: "mobile_web", label: "Mobile & Web" },
  ],
  "soc integration": [{ value: "hosting", label: "Hosting" }],
  "security controls": [{ value: "hosting", label: "Hosting" }],
};

export const DepartmentCategoryStatusMap: Record<string, SelectItemType[]> = {
  iam: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ],
  tprm: [
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ],
  vapt: [
    { value: "pending", label: "Pending" },
    { value: "remediation", label: "Remediation" },
    { value: "testing", label: "Testing" },
  ],
  "soc integration": [
    { value: "internal_hosting", label: "Internal Hosting" },
    { value: "external_hosting", label: "External Hosting" },
  ],
  "security controls": [
    { value: "internal_hosting", label: "Internal Hosting" },
    { value: "external_hosting", label: "External Hosting" },
  ],
};
