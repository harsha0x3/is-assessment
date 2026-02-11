import { rootApiSlice } from "./rootApiSlice";

export type SecuredFileResponse = Blob;

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
