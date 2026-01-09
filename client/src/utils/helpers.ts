import type { AppStatuses } from "./globalTypes";

export const parseStatus = (status: AppStatuses) => {
  return status.replaceAll("_", " ");
};

export const parseDate = (date: string | undefined | null) => {
  if (!date) {
    return "-";
  }
  const parsedDate = new Date(date + "Z").toLocaleDateString();
  return parsedDate;
};
