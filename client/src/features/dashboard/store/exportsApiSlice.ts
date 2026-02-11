import { rootApiSlice } from "@/store/rootApiSlice";

export const exportsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    exportApplicationsCSV: builder.query<Blob, void>({
      query: () => ({
        url: "/export/applications",
        method: "GET",
        responseHandler: async (response: Response) => {
          return response.blob();
        },
      }),
    }),

    exportVerticalApps: builder.query<Blob, void>({
      query: () => ({
        url: "/export/applications/verticals/csv",
        method: "GET",
        responseHandler: async (response: Response) => {
          return response.blob();
        },
      }),
    }),
  }),
});

export const {
  useLazyExportApplicationsCSVQuery,
  useLazyExportVerticalAppsQuery,
} = exportsApiSlice;
