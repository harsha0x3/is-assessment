import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const isProd = import.meta.env.VITE_PROD_ENV === "true";
import { getCSRFToken } from "../utils/csrf";

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

export const rootApiSlice = createApi({
  baseQuery: baseQueryWithAuth,
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
  ],

  endpoints: () => ({}),
});
