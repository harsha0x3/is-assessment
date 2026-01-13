// src\features\user_management\components\UserDetailsDialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DepartmentsMultiSelect } from "@/features/departments/components/DepartmentsMultiSelect";
import { useUpdateUserProfileMutation } from "../store/userManagementApiSlice";
import type { AllUsersWithDepartments } from "@/features/auth/types";
import { useGetAllDepartmentsQuery } from "@/features/departments/store/departmentsApiSlice";

interface Props {
  user: AllUsersWithDepartments | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: Props) {
  const { data: deptData } = useGetAllDepartmentsQuery();
  const [updateUser, { isLoading }] = useUpdateUserProfileMutation();

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [departmentIds, setDepartmentIds] = useState<number[]>(
    user?.departments.map((d) => d.department_id) ?? []
  );

  if (!user) return null;

  const onSave = async () => {
    await updateUser({
      userId: user.id,
      payload: {
        full_name: fullName,
        department_ids: departmentIds,
      },
    }).unwrap();

    setEditMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled />
          </div>

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={fullName}
              disabled={!editMode}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Role</label>
            <Input value={user.role} disabled />
          </div>

          <div>
            <label className="text-sm font-medium">Departments</label>
            {editMode ? (
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

          <div className="flex justify-end gap-2">
            {!editMode ? (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
