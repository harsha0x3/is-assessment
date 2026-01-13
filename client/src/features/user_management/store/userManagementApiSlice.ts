// src\features\user_management\store\userManagementApiSlice.ts

import { rootApiSlice } from "@/store/rootApiSlice";
import type { ApiResponse } from "@/store/rootTypes";
import type {
  AllUsersWithDepartments,
  UserWithDepartmentInfo,
  UserUpdateRequest,
} from "@/features/auth/types";

export interface AllUsersResponse {
  users: AllUsersWithDepartments[];
  total_count: number;
}

const userManagementApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ➤ Get all users
    getAllUsers: builder.query<ApiResponse<AllUsersResponse>, void>({
      query: () => "/user-management/all",
      providesTags: ["AllUsers"],
    }),

    // ➤ Get logged-in user (optional reuse)
    getMe: builder.query<ApiResponse<UserWithDepartmentInfo>, void>({
      query: () => "/user-management/me",
      providesTags: ["AllUsers"],
    }),

    // ➤ Update user profile
    updateUserProfile: builder.mutation<
      ApiResponse<UserWithDepartmentInfo>,
      { userId: string; payload: UserUpdateRequest }
    >({
      query: ({ userId, payload }) => ({
        url: `/user-management/profile/${userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["AllUsers"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetMeQuery,
  useUpdateUserProfileMutation,
} = userManagementApiSlice;

export default userManagementApiSlice;
