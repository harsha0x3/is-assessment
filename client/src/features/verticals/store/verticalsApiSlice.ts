import { rootApiSlice } from "@/store/rootApiSlice";
import type { ApiResponse } from "@/store/rootTypes";
import type {
  CreateVerticalPayload,
  UpdateVerticalPayload,
  VerticalItem,
} from "../types";

export const verticalsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // -------- GET ALL --------
    getAllVerticals: builder.query<VerticalItem[], void>({
      query: () => ({
        url: "/verticals/",
        method: "GET",
      }),
      providesTags: ["Verticals"],
    }),

    // -------- CREATE --------
    createVertical: builder.mutation<VerticalItem, CreateVerticalPayload>({
      query: (body) => ({
        url: "/verticals/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Verticals"],
    }),

    // -------- UPDATE --------
    updateVertical: builder.mutation<
      VerticalItem,
      { id: number; body: UpdateVerticalPayload }
    >({
      query: ({ id, body }) => ({
        url: `/verticals/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Verticals"],
    }),

    // -------- DELETE --------
    deleteVertical: builder.mutation<ApiResponse<{ msg: string }>, number>({
      query: (id) => ({
        url: `/verticals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Verticals"],
    }),
  }),
});

export const {
  useGetAllVerticalsQuery,
  useCreateVerticalMutation,
  useUpdateVerticalMutation,
  useDeleteVerticalMutation,
} = verticalsApiSlice;
