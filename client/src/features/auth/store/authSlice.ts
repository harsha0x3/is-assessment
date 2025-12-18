// src\features\auth\store\authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, UserWithDepartmentInfo } from "../types";
import type { RootState } from "@/store/rootStore";

const initialState: AuthState = {
  user: {
    id: "",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",

    created_at: "",
    updated_at: "",
  },
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
      state.user = action.payload.user;
      state.departments = action.payload.departments;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<UserWithDepartmentInfo>) => {
      state.user = action.payload.user;
      state.departments = action.payload.departments;
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
  },
});

export const { loginSuccess, userLogout, setIsLoading, setError, updateUser } =
  authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectError = (state: RootState) => state.auth.error;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export default authSlice.reducer;
