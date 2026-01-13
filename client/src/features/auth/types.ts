// src\features\auth\types.ts

export type RoleEnum = "admin" | "moderator" | "user";

// ---------- BASE MODELS ----------
export interface AllUsersOut {
  id: string;
  full_name: string;
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
  department_description: string | null;
}

export interface CompleteUserOut {
  id: string;
  full_name: string;
  email: string;
  role: string;
  mfa_secret: string | null;
  mfa_recovery_codes: string[] | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface AllUsersWithDepartments extends CompleteUserOut {
  departments: DepartmentInAuth[];
}

export interface UserOut {
  id: string;
  full_name: string;
  email: string;
  role: string;

  created_at: string | null;
  updated_at: string | null;
}

export interface UserWithDepartmentInfo extends UserOut {
  departments: DepartmentInAuth[];
}

export interface AuthState extends UserWithDepartmentInfo {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
export interface UserWithDepartments extends UserOut {
  department_ids: number[];
}

export interface AuthState extends UserWithDepartmentInfo {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ---------- REGISTER & UPDATE ----------
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;

  role?: RoleEnum;
  enable_mfa?: boolean;
}

export interface RegisterRequest extends RegisterPayload {
  department_ids: number[];
}

export interface RegisterResponse extends CompleteUserOut {
  departments: DepartmentInAuth[];
}

export interface UserUpdateRequest {
  full_name?: string | null;
  email?: string | null;
  role?: RoleEnum | null;
  enable_mfa?: boolean;
  department_ids?: number[] | null;
}

// ---------- AUTH ----------
export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string | null;
}

export interface LoginResponse {
  requires_mfa: boolean;
  challenge_token?: string | null;
  tokens?: Tokens | null;
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
