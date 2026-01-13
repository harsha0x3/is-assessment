import { rootApiSlice } from "./rootApiSlice";

export type SecuredFileResponse = Blob;

const fileServingApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSecuredFile: builder.mutation<SecuredFileResponse, { path: string }>({
      query: ({ path }) => ({
        url: "/secured_file",
        params: { path },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const { useGetSecuredFileMutation } = fileServingApiSlice;
