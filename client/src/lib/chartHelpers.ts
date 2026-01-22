// src\lib\chartHelpers.ts

import type { PriorityCountItem } from "@/features/dashboard/types";

export const buildDonutData = (
  items: { status: string; count: number }[],
  total: number,
) =>
  items.map(({ status, count }) => ({
    name: status,
    count,
    value: total > 0 ? +((count / total) * 100).toFixed(1) : 0,
  }));

export const buildPriorityStackedData = (priorities: PriorityCountItem[]) => {
  return priorities.map((p) => {
    const row: Record<string, any> = {
      priority: p.priority,
      total: p.total_apps,
    };

    p.statuses.forEach((s) => {
      row[s.status] = s.count;
    });

    return row;
  });
};
