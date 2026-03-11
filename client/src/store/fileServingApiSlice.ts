import { rootApiSlice } from "./rootApiSlice";

const fileServingApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSecuredFile: builder.mutation<{ url: string }, { path: string }>({
      query: ({ path }) => ({
        url: "/secured_file",
        params: { path },
      }),
    }),
  }),
});

export const { useGetSecuredFileMutation } = fileServingApiSlice;
