// src\features\user_management\components\UserDetailsDialog.tsx

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DepartmentsMultiSelect } from "@/features/departments/components/DepartmentsMultiSelect";
import {
  useCreateUserMutation,
  useUpdateUserProfileMutation,
} from "../store/userManagementApiSlice";
import type {
  RoleEnum,
  AllUsersWithDepartments,
  RegisterRequest,
  UserWithDepartmentInfo,
} from "@/features/auth/types";
import { useGetAllDepartmentsQuery } from "@/features/departments/store/departmentsApiSlice";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Loader } from "lucide-react";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";
import { VerticalsMultiSelect } from "@/features/verticals/components/VerticalsMultiSelect";
// import { PasswordInput } from "@/features/auth/components/PasswordInput";
interface Props {
  user: AllUsersWithDepartments | UserWithDepartmentInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsDialog: React.FC<Props> = ({ user, open, onOpenChange }) => {
  const { data: deptData } = useGetAllDepartmentsQuery();
  const [updateUser, { isLoading }] = useUpdateUserProfileMutation();
  const [createNewUser, { isLoading: isCreatingNew }] = useCreateUserMutation();
  const [role, setRole] = useState<RoleEnum>();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const currentUserInfo = useSelector(selectAuth);
  const isAdmin = currentUserInfo.role == "admin";
  const [verticalIds, setVerticalIds] = useState<number[]>([]);

  const isAdminOrManager =
    currentUserInfo.role === "admin" || currentUserInfo.role === "manager";
  // const [password, setPassword] = useState<string>("");
  // const [confirmPassword, setConfirmPassword] = useState<string>("");
  const isNew = !user;
  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setDepartmentIds(user.departments.map((d) => d.department_id) ?? []);
      setRole(user.role as RoleEnum);
      setVerticalIds(user.verticals?.map((v) => v.id) ?? []);
    }
  }, [user]);

  const onSave = async () => {
    try {
      if (editMode && user) {
        await updateUser({
          userId: user.id,
          payload: {
            email: email,
            full_name: fullName,
            department_ids: departmentIds,
            role: role,
            vertical_ids: verticalIds,
          },
        }).unwrap();

        setEditMode(false);
      }
      if (isNew) {
        // if (password !== confirmPassword) {
        //   toast.error("Passwords doesn't match");
        // }
        const payload: RegisterRequest = {
          full_name: fullName ?? "",
          email: email ?? "",
          role: role,
          enable_mfa: false,
          department_ids: departmentIds,
          vertical_ids: verticalIds,
        };
        await createNewUser({
          payload,
        }).unwrap();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              value={email}
              readOnly={!(isNew || editMode)}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Full Name</Label>
            <Input
              value={fullName}
              readOnly={!(isNew || editMode)}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RoleEnum)}
              disabled={!(isNew || editMode)}
            >
              <SelectTrigger disabled={!(isNew || editMode)}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="digital_head">Digital Head</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Departments</Label>
            {editMode || isNew ? (
              <DepartmentsMultiSelect
                value={departmentIds}
                departments={deptData?.data ?? []}
                onChange={setDepartmentIds}
              />
            ) : (
              <ul className="text-sm list-disc ml-5">
                {user.departments.map((d) => (
                  <li key={d.department_id}>{d.department_name}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Verticals</Label>

            {editMode || isNew ? (
              <VerticalsMultiSelect
                value={verticalIds}
                onChange={(val: number[] | number | null) => {
                  setVerticalIds(Array.isArray(val) ? val : val ? [val] : []);
                }}
                canCreate={isAdminOrManager}
              />
            ) : (
              <div>
                {user.verticals && user.verticals.length > 0 && (
                  <ul className="text-sm list-disc ml-5">
                    {user.verticals.map((v) => (
                      <li key={v.id}>{v.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {!isNew && (
            <div className="flex justify-end gap-2">
              {isAdmin && !editMode ? (
                <Button onClick={() => setEditMode(true)}>Edit</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={onSave} disabled={isLoading}>
                    Save
                  </Button>
                </>
              )}
            </div>
          )}
          {/* {isNew && (
            <div className="space-y-6">
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <PasswordInput
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className=""
                  />
                </div>
              </div>
              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <PasswordInput
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-Enter password"
                    className=""
                  />
                </div>
              </div>
            </div>
          )} */}

          {isNew && (
            <div>
              <Button disabled={isCreatingNew} onClick={onSave}>
                {isCreatingNew ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin" />
                    Saving..
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
