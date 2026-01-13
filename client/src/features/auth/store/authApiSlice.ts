import type {
  LoginRequest,
  RegisterRequest,
  UserUpdateRequest,
  UserWithDepartmentInfo,
  RegisterResponse,
} from "../types";
import type { ApiResponse } from "@/store/rootTypes";
import {
  loginSuccess,
  setIsAuthenticated,
  updateUser,
  userLogout,
} from "../store/authSlice";
import { rootApiSlice } from "@/store/rootApiSlice";

export const authApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------- REGISTER ----------------
    register: builder.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (payload) => ({
        url: "auth/register",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result) => [{ type: "AllUsers", id: result?.data.id }],
    }),

    // ---------------- LOGIN ----------------
    login: builder.mutation<ApiResponse<UserWithDepartmentInfo>, LoginRequest>({
      query: (payload) => ({
        url: "auth/login",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(loginSuccess(data.data));
        } catch {
          // ignore
        }
      },
    }),

    // ---------------- REFRESH TOKEN ----------------
    refreshToken: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "auth/refresh",
        method: "POST",
      }),
    }),

    // ---------------- GET ME ----------------
    getMe: builder.query<ApiResponse<UserWithDepartmentInfo>, void>({
      query: () => ({
        url: "auth/me",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data?.data));
        } catch {
          dispatch(setIsAuthenticated(false));
          // ignore errors
        }
      },
      providesTags: ["User"],
    }),

    // ---------------- UPDATE PROFILE ----------------
    updateProfile: builder.mutation<
      ApiResponse<UserWithDepartmentInfo>,
      { userId: string; body: UserUpdateRequest }
    >({
      query: ({ userId, body }) => ({
        url: `/profile/${userId}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data.data));
        } catch {
          // ignore
        }
      },
    }),

    // ---------------- LOGOUT ----------------
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(userLogout());
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApiSlice;
