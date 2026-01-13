// src\features\auth\store\authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, UserWithDepartmentInfo } from "../types";
import type { RootState } from "@/store/rootStore";

const initialState: AuthState = {
  id: "",
  full_name: "",
  email: "",
  role: "",
  created_at: null,
  updated_at: null,
  departments: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<UserWithDepartmentInfo>) => {
      console.log("LOGIN SUCCESS PAYLOAD", action.payload);
      state.id = action.payload.id;
      state.full_name = action.payload.full_name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.created_at = action.payload.created_at;
      state.updated_at = action.payload.updated_at;
      state.departments = action.payload.departments;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<UserWithDepartmentInfo>) => {
      state.id = action.payload.id;
      state.full_name = action.payload.full_name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.created_at = action.payload.created_at;
      state.updated_at = action.payload.updated_at;
      state.departments = action.payload.departments;
      state.isAuthenticated = true;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userLogout: (_state) => {
      return { ...initialState };
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {
  loginSuccess,
  userLogout,
  setIsLoading,
  setError,
  updateUser,
  setIsAuthenticated,
} = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectError = (state: RootState) => state.auth.error;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export default authSlice.reducer;
