// src/features/user_management/components/UsersTable.tsx

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { AllUsersWithDepartments } from "@/features/auth/types";
import UserDetailsDialog from "./UserDetailsDialog";

interface Props {
  users: AllUsersWithDepartments[];
}

export function UsersTable({ users }: Props) {
  const [selectedUser, setSelectedUser] =
    useState<AllUsersWithDepartments | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const columns = useMemo<ColumnDef<AllUsersWithDepartments, any>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        minSize: 200,
        maxSize: 350,
        cell: ({ getValue }) => (
          <span className="whitespace-normal wrap-break-word">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        minSize: 250,
        maxSize: 400,
        cell: ({ getValue }) => (
          <span className="whitespace-normal wrap-break-word">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        minSize: 150,
        maxSize: 200,
        cell: ({ getValue }) => (
          <span className="capitalize">{getValue()}</span>
        ),
      },
      {
        id: "departments",
        header: "Departments",
        minSize: 120,
        maxSize: 150,
        cell: ({ row }) => (
          <ul className="text-sm list-disc ml-5">
            {row.original.departments.map((d) => (
              <li key={d.department_id}>{d.department_name}</li>
            ))}
          </ul>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        minSize: 150,
        maxSize: 180,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row.original);
              setIsDialogOpen(true);
            }}
          >
            View Details
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <>
      <div className="w-full h-full overflow-x-auto overflow-y-auto border rounded-md">
        <Table className="table-fixed">
          <TableHeader className="bg-accent text-accent-foreground sticky">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                    className="relative select-none font-semibold whitespace-normal wrap-break-word"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-normal wrap-break-word"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && (
        <UserDetailsDialog
          user={selectedUser}
          open={!!selectedUser && isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
              setIsDialogOpen(true);
            }
          }}
        />
      )}
    </>
  );
}
