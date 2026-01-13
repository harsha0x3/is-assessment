import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type ApiErrorDetail =
  | string
  | {
      msg?: string;
      err_stack?: string;
    };

export function getApiErrorMessage(err: unknown): string | null {
  const fetchError = err as FetchBaseQueryError;

  if (
    fetchError?.data &&
    typeof fetchError.data === "object" &&
    "detail" in fetchError.data
  ) {
    const detail = (fetchError.data as { detail?: ApiErrorDetail }).detail;

    // detail is a string
    if (typeof detail === "string") {
      return detail || null;
    }

    // detail is an object
    if (detail && typeof detail === "object") {
      return detail.msg || null;
    }
  }

  return null;
}
