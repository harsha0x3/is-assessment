import { rootApiSlice } from "@/store/rootApiSlice";
import type { ApiResponse } from "@/store/rootTypes";
import type {
  DepartmentCreate,
  DepartmentInfo,
  DepartmentOut,
  NewUserDepartmentAssign,
} from "../types";

const departmentsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDepartment: builder.mutation<
      ApiResponse<DepartmentOut>,
      DepartmentCreate
    >({
      query: (payload) => ({
        url: `/departments`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Departments", id: "LIST" }],
    }),

    // Add Departments to Application
    addDepartmentsToApplication: builder.mutation({
      query: ({ appId, department_ids }) => ({
        url: `/departments/application/${appId}/add`,
        method: "POST",
        body: department_ids,
      }),
      invalidatesTags: [{ type: "Departments", id: "LIST" }],
    }),

    // Add User to Department
    addUserToDepartment: builder.mutation<
      ApiResponse<unknown>,
      { departmentId: string; payload: NewUserDepartmentAssign }
    >({
      query: ({ departmentId, payload }) => ({
        url: `/departments/${departmentId}/add_user`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { departmentId }) => [
        { type: "Departments", id: departmentId },
        { type: "Departments", id: "LIST" },
      ],
    }),

    // Get All Departments
    getAllDepartments: builder.query<ApiResponse<DepartmentOut[]>, void>({
      query: () => `/departments/all`,
      providesTags: ["Departments"],
    }),

    // Get Departments by Application ID
    getDepartmentsByApplication: builder.query<
      ApiResponse<DepartmentOut[]>,
      string
    >({
      query: (appId) => `/departments/application/${appId}`,
      providesTags: (result) =>
        result
          ? result.data.map((dept) => ({ type: "Departments", id: dept.id }))
          : [{ type: "Departments", id: "LIST" }],
    }),

    getDepartmentInfo: builder.query<
      ApiResponse<DepartmentInfo>,
      { appId: string; deptId: number }
    >({
      query: ({ appId, deptId }) =>
        `/departments/${deptId}/application/${appId}/info`,
      providesTags: (_result, _error, { appId, deptId }) => [
        { type: "DepartmentInfo", id: `appId_${appId}-deptId_${deptId}` },
      ],
    }),
    updateDepartmentStatus: builder.mutation<
      ApiResponse<null>,
      { appId: string; deptId: number; payload: { status_val: string } }
    >({
      query: ({ appId, deptId, payload }) => ({
        url: `/departments/${deptId}/application/${appId}/status`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { appId, deptId }) => [
        { type: "Apps", id: appId },
        { type: "Departments", id: deptId },
        { type: "DepartmentInfo", id: `appId_${appId}-deptId_${deptId}` },
      ],
    }),
  }),
});

export const {
  useAddDepartmentsToApplicationMutation,
  useUpdateDepartmentStatusMutation,
  useAddUserToDepartmentMutation,
  useCreateDepartmentMutation,
  useGetAllDepartmentsQuery,
  useGetDepartmentInfoQuery,
  useGetDepartmentsByApplicationQuery,
} = departmentsApiSlice;
