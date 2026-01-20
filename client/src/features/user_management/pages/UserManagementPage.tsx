import React, { useState } from "react";
import { UsersTable } from "../components/UsersTable";
import { useGetAllUsersQuery } from "../store/userManagementApiSlice";
import { Button } from "@/components/ui/button";
import UserDetailsDialog from "../components/UserDetailsDialog";

const UserManagementPage: React.FC = () => {
  const { data } = useGetAllUsersQuery();
  const [newUser, setNewUser] = useState<boolean>(false);
  return (
    <div className="h-full flex flex-col w-full space-y-2 overflow-hidden px-2">
      <div className="space-y-2">
        <Button onClick={() => setNewUser(true)}>New User</Button>
      </div>
      {newUser && (
        <UserDetailsDialog
          user={null}
          open={newUser}
          onOpenChange={setNewUser}
        />
      )}
      <div className="flex-1 overflow-auto">
        {data?.data && <UsersTable users={data?.data.users} />}
      </div>
    </div>
  );
};

export default UserManagementPage;
