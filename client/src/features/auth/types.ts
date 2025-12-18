// src\features\auth\types.ts
// ---------- BASE MODELS ----------
export interface AllUsersOut {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  mfa_secret: string | null;
  mfa_recovery_codes: string[] | null;
  department_ids: number[] | null;
}

export interface DepartmentInAuth {
  user_dept_id: string;
  department_role: string | null;
  department_id: number;
  department_name: string;
  department_description?: string | null;
}

export interface CompleteUserOut {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string | null;
  role: string;
  mfa_secret: string | null;
  mfa_recovery_codes: string[] | null;

  created_at?: string | null; // datetime as ISO string
  updated_at?: string | null;
}

export interface AllUsersWithDepartments {
  user: CompleteUserOut;
  departments: DepartmentInAuth[] | [];
}

export type RegisterResponse = AllUsersWithDepartments;

export interface UserOut {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  role: string;

  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserWithDepartmentInfo {
  departments: DepartmentInAuth[] | [];
  user: UserOut;
}

export interface AuthState extends UserWithDepartmentInfo {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
export interface UserWithDepartments extends UserOut {
  department_ids: number[];
}

// ---------- REGISTER & UPDATE ----------
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  role?: "admin" | "super_admin" | "moderator" | "user" | null;
  enable_mfa?: boolean;
}

export interface RegisterRequest extends RegisterPayload {
  department_ids: number[];
}

export interface UserUpdateRequest {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: "admin" | "super_admin" | "moderator" | "user" | null;
  enable_mfa?: boolean;
  department_ids?: number[] | null;
}

// ---------- AUTH ----------
export interface LoginRequest {
  email_or_username: string;
  password: string;
  mfa_code?: string | null;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MFAVerifyRequest {
  otpauth_uri: string;
  qr_png_base64: string;
}

export interface MFARecoveryVerifyRequest {
  recovery_code: string;
}

export interface MFASetupVerifyResponse {
  enabled: boolean;
  recovery_codes: string[];
}
