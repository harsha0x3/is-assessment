// utils/chartHelpers.ts

export const buildDonutData = (
  items: { status: string; count: number }[],
  total: number
) =>
  items.map(({ status, count }) => ({
    name: status,
    count,
    value: total > 0 ? +((count / total) * 100).toFixed(1) : 0,
  }));
