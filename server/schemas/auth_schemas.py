from enum import Enum

from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class AllUsersOut(BaseModel):
    id: str
    username: str
    first_name: str | None
    last_name: str | None
    role: str
    mfa_secret: str | None
    mfa_recovery_codes: list[str] | None
    department_ids: list[int] | None


class DepartmentInAuth(BaseModel):
    user_dept_id: str
    department_role: str | None
    department_id: int
    department_name: str
    department_description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CompleteUserOut(BaseModel):
    id: str
    username: str
    email: str
    first_name: str | None
    last_name: str | None
    role: str
    mfa_secret: str | None
    mfa_recovery_codes: list[str] | None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class AllUsersWithDepartments(BaseModel):
    user: CompleteUserOut
    departments: list[DepartmentInAuth] | list


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str | None = None
    role: str

    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Automatically convert UTC -> Asia/Kolkata

    model_config = ConfigDict(from_attributes=True)


class UserWithDepartmentInfo(BaseModel):
    departments: list[DepartmentInAuth] | list
    user: UserOut


class UserWithDepartments(UserOut, BaseModel):
    department_ids: list[int] = []


class RoleEnum(str, Enum):
    admin = "admin"
    moderator = "moderator"
    user = "user"


class RegisterPayload(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str | None
    last_name: str | None
    role: RoleEnum = RoleEnum.user
    enable_mfa: bool = False


class RegisterRequest(RegisterPayload, BaseModel):
    department_ids: list[int]


class RegisterResponse(BaseModel):
    user: CompleteUserOut
    departments: list[DepartmentInAuth] | list


class UserUpdateRequest(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    role: RoleEnum | None = RoleEnum.user
    enable_mfa: bool = True
    department_ids: list[int] | None = None


class LoginRequest(BaseModel):
    email_or_username: EmailStr | str
    password: str
    mfa_code: str | None = None


class Tokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class LoginResponse(BaseModel):
    requires_mfa: bool
    challenge_token: str | None = None
    tokens: Tokens | None | None


class MFAVerifyRequest(BaseModel):
    otpauth_uri: str
    qr_png_base64: str


class MFARecoveryVerifyRequest(BaseModel):
    recovery_code: str


class MFASetupVerifyResponse(BaseModel):
    enabled: bool
    recovery_codes: list[str]
