import type {
  ApplicationCreate,
  ApplicationOut,
  ApplicationUpdate,
  NewAppListOut,
  AppQueryParams,
  AppStatusSummary,
} from "../types";
import type { ApiResponse } from "@/store/rootTypes";
import { rootApiSlice } from "@/store/rootApiSlice";
import type { EvidenceOut } from "@/features/evidences/types";
import type { AppStatuses } from "@/utils/globalTypes";

export const applicationsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createApplication: builder.mutation<
      ApiResponse<ApplicationOut>,
      ApplicationCreate
    >({
      query: (payload) => ({
        url: "applications",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Apps"],
    }),

    listAllApps: builder.query<
      ApiResponse<{
        apps: NewAppListOut[];
        total_count: number;
        filtered_count: number;
        apps_summary: AppStatusSummary;
        filtered_summary?: AppStatusSummary | null;
      }>,
      AppQueryParams | void
    >({
      query: (params) => ({
        url: "applications/list",
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.apps.map((app) => ({
                type: "Apps" as const,
                id: app.id,
              })),
              { type: "Apps" as const, id: "LIST" },
            ]
          : [{ type: "Apps" as const, id: "LIST" }],
    }),

    getApplicationDetails: builder.query<ApiResponse<ApplicationOut>, string>({
      query: (appId) => ({
        url: `applications/${appId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, appId) => [
        { type: "Apps", id: appId },
        { type: "AppDetails", id: "LIST" },
      ],
    }),

    updateApplication: builder.mutation<
      ApiResponse<ApplicationOut>,
      { appId: string; payload: ApplicationUpdate }
    >({
      query: ({ appId, payload }) => ({
        url: `applications/${appId}`,
        method: "PATCH",
        body: payload,
      }),

      async onQueryStarted({ appId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // ✅ Update getApplicationDetails cache
          dispatch(
            applicationsApiSlice.util.updateQueryData(
              "getApplicationDetails",
              appId,
              (draft) => {
                if (draft?.data) {
                  Object.assign(draft.data, data.data);
                }
              },
            ),
          );
        } catch {}
      },

      invalidatesTags: (_result, _error, arg) => [
        { type: "Apps", id: arg.appId },
        { type: "Apps", id: "LIST" },
        { type: "AppDetails", id: "LIST" },
      ],
    }),

    updateApplicationStatus: builder.mutation<
      ApiResponse<ApplicationOut>,
      {
        appId: string;
        status_val: AppStatuses;
      }
    >({
      query: ({ appId, status_val }) => ({
        url: `applications/update-status/${appId}`,
        method: "PATCH",
        body: { status_val },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Apps", id: arg.appId },
        { type: "Apps", id: "LIST" },
        { type: "AppDetails", id: "LIST" },
      ],
    }),

    addAppEvidence: builder.mutation<
      ApiResponse<unknown>,
      { appId: string; payload: FormData }
    >({
      query: ({ appId, payload }) => ({
        url: `/applications/${appId}/evidences`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Evidences"],
    }),

    getAppEvidences: builder.query<
      ApiResponse<EvidenceOut[]>,
      { appId: string }
    >({
      query: ({ appId }) => `/applications/${appId}/evidences`,
      providesTags: ["Evidences"],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useListAllAppsQuery,
  useGetApplicationDetailsQuery,
  useUpdateApplicationMutation,
  useUpdateApplicationStatusMutation,
  useGetAppEvidencesQuery,
  useAddAppEvidenceMutation,
} = applicationsApiSlice;

export default applicationsApiSlice;
