import React from "react";
import { UsersTable } from "../components/UsersTable";
import { useGetAllUsersQuery } from "../store/userManagementApiSlice";

const UserManagementPage: React.FC = () => {
  const { data } = useGetAllUsersQuery();
  return (
    <div className="h-full flex flex-col w-full space-y-2 overflow-hidden px-2">
      <div className="space-y-2">Users</div>
      <div className="flex-1 overflow-auto">
        {data?.data && <UsersTable users={data?.data.users} />}
      </div>
    </div>
  );
};

export default UserManagementPage;
