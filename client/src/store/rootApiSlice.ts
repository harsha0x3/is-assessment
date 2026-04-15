import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
const isProd = import.meta.env.VITE_PROD_ENV === "true";
import { getCSRFToken } from "../utils/csrf";
import { toast } from "sonner";

getCSRFToken();

const apiBaseUrl = isProd ? "/api/v1.0" : "/api/v1.0";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers: Headers) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }

    return headers;
  },
});

const baseQueryWith401Handler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  if (
    result?.error &&
    result.error.status === 401 &&
    window.location.pathname !== "/login"
  ) {
    toast.error("Session expired. Please log in again.", {
      position: "top-center",
    });
    api.dispatch({ type: "auth/logout" });
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }
  return result;
};

export const rootApiSlice = createApi({
  baseQuery: baseQueryWith401Handler,
  tagTypes: [
    "User",
    "Apps",
    "AppDetails",
    "Checklists",
    "Controls",
    "Assignments",
    "AllUsers",
    "TrashedApps",
    "TrashedChecklists",
    "PreAssessment",
    "PreAssessmentResponses",
    "drafts",
    "Departments",
    "Comments",
    "DepartmentInfo",
    "Evidences",
    "DeptQuestionnaire",
    "AppQuestionnaire",
    "DepartmentControl",
    "Verticals",
    "ExecSummary",
    "DeptExecSummary",
  ],

  endpoints: () => ({}),
});
