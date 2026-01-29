import { useEffect, useState } from "react";

export const parseStatus = (status: string) => {
  return status.replaceAll("_", " ");
};

export const parseDate = (date: string | undefined | null) => {
  if (!date) {
    return "-";
  }
  const parsedDate = new Date(date + "Z").toLocaleDateString();
  return parsedDate;
};

export const daysBetweenDateAndToday = (
  date: string | null | undefined,
): number | "-" => {
  if (!date) return "-";

  const startDate = new Date(date + "Z");
  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const parseDept = (dept: string) => {
  switch (dept.toLowerCase()) {
    case "iam":
      return "IAM";
    case "tprm":
      return "TPRM";

    case "security_controls":
      return "Security Controls";
    case "vapt":
      return "VAPT";
    case "soc_integration":
      return "SOC Integration";
    default:
      return dept;
  }
};

export function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
