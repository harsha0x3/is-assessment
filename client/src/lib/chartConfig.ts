// chartConfig.ts
import type { ChartConfig } from "@/components/ui/chart";

export const donutChartConfig: ChartConfig = {
  new_request: {
    label: "New Request",
    color: "var(--status-new-request-fg)",
  },
  not_yet_started: {
    label: "Not Yet Started",
    color: "var(--status-not-yet-started-fg)",
  },
  in_progress: {
    label: "In Progress",
    color: "var(--status-in-progress-fg)",
  },

  completed: {
    label: "Completed",
    color: "var(--status-completed-fg)",
  },
  reopen: {
    label: "Reopen",
    color: "var(--status-reopen-fg)",
  },
  closed: {
    label: "Closed",
    color: "var(--status-closed-fg)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--status-cancelled-fg)",
  },
  go_live: {
    label: "Go Live",
    color: "var(--status-go-live-fg)",
  },
  hold: {
    label: "Hold",
    color: "var(--status-hold-fg)",
  },
};
