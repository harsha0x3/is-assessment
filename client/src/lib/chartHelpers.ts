// src\lib\chartHelpers.ts

import type {
  CategoryStatusItem,
  PriorityCountItem,
} from "@/features/dashboard/types";

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

interface CategoryDonutData {
  name: string;
  value: number; // percentage
  count: number;
}

export const buildCategoryDonutData = (
  statuses: CategoryStatusItem[],
  total: number,
): CategoryDonutData[] => {
  return statuses.map((s) => ({
    name: s.cat_status,
    count: s.count,
    value: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }));
};
