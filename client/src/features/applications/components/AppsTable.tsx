import React, { lazy, Suspense, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { NewAppListOut } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import DescriptionCell from "@/components/ui/description-cell";
import { parseDate, parseStatus } from "@/utils/helpers";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
import type { AppDepartmentOut } from "@/features/departments/types";
import Hint from "@/components/ui/hint";
import { Dot, Loader } from "lucide-react";
import { useApplicationsContext } from "../context/ApplicationsContext";
import { createDepartmentStatusColumn } from "./DepartmentColumnFactory";
const VerticalSearchFilter = lazy(
  () => import("../components/tableHeaders/VerticalSearchFilter"),
);
const AppStatusHeaderFilter = lazy(
  () => import("../components/tableHeaders/AppStatusHeaderFilter"),
);
// import { useGetAllDepartmentsQuery } from "@/features/departments/store/departmentsApiSlice";

// type Props = {
//   data:
// }

const AppsTable: React.FC = () => {
  const { data: appsData, isLoading: isAppsLoading } = useApplicationsContext();
  // const { data: departments, isLoading: isLoadingDepts } =
  //   useGetAllDepartmentsQuery();
  const navigate = useNavigate();
  const colHelper = createColumnHelper<NewAppListOut>();
  const [searchParams] = useSearchParams();
  const departmentView = searchParams.get("view");
  type DeptKey =
    | "vapt"
    | "tprm"
    | "security_controls"
    | "iam"
    | "soc_integration";

  const DEPARTMENT_COLUMNS: Record<DeptKey, ColumnDef<NewAppListOut, any>[]> = {
    vapt: [
      createDepartmentStatusColumn("vapt", "VAPT"),
      colHelper.accessor("latest_comment", {
        header: "Latest Comment",
        minSize: 300,
        maxSize: 400,
        cell: (info) => {
          const comment = info.getValue();
          return (
            <div>
              <DescriptionCell content={comment?.content ?? ""} />
            </div>
          );
        },
      }),
      colHelper.accessor("titan_spoc", {
        header: "Titan SPOC",
        cell: (info) => {
          return (
            <p className="whitespace-normal wrap-break-word">
              {info.getValue()}
            </p>
          );
        },
      }),
      // colHelper.accessor("app_url", {
      //   header: "App URL",
      //   cell: (info) => {
      //     return info.getValue();
      //   },
      // }),
    ],

    tprm: [
      colHelper.accessor("vendor_company", {
        header: "Vendor",
        cell: (info) => {
          return info.getValue();
        },
      }),
      createDepartmentStatusColumn("tprm", "TPRM"),
      colHelper.accessor("titan_spoc", {
        header: "Titan SPOC",
        cell: (info) => {
          return (
            <p className="whitespace-normal wrap-break-word">
              {info.getValue()}
            </p>
          );
        },
      }),

      colHelper.accessor("latest_comment", {
        header: "Latest Comment",
        minSize: 300,
        maxSize: 400,
        cell: (info) => {
          const comment = info.getValue();
          return (
            <div>
              <DescriptionCell content={comment?.content ?? ""} />
            </div>
          );
        },
      }),
    ],

    security_controls: [
      createDepartmentStatusColumn("security controls", "Security Controls"),
      colHelper.accessor("titan_spoc", {
        header: "Titan SPOC",
        cell: (info) => {
          return (
            <p className="whitespace-normal wrap-break-word">
              {info.getValue()}
            </p>
          );
        },
      }),

      colHelper.accessor("latest_comment", {
        header: "Latest Comment",
        minSize: 300,
        maxSize: 400,
        cell: (info) => {
          const comment = info.getValue();
          return (
            <div>
              <DescriptionCell content={comment?.content ?? ""} />
            </div>
          );
        },
      }),
    ],
    iam: [
      createDepartmentStatusColumn("iam", "IAM"),
      colHelper.accessor("titan_spoc", {
        header: "Titan SPOC",
        cell: (info) => {
          return (
            <p className="whitespace-normal wrap-break-word">
              {info.getValue()}
            </p>
          );
        },
      }),

      colHelper.accessor("latest_comment", {
        header: "Latest Comment",
        minSize: 300,
        maxSize: 400,
        cell: (info) => {
          const comment = info.getValue();
          return (
            <div>
              <DescriptionCell content={comment?.content ?? ""} />
            </div>
          );
        },
      }),
    ],
    soc_integration: [
      createDepartmentStatusColumn("soc integration", "SOC Integration"),
      colHelper.accessor("titan_spoc", {
        header: "Titan SPOC",
        cell: (info) => {
          return (
            <p className="whitespace-normal wrap-break-word">
              {info.getValue()}
            </p>
          );
        },
      }),
      colHelper.accessor("latest_comment", {
        header: "Latest Comment",
        minSize: 300,
        maxSize: 400,
        cell: (info) => {
          const comment = info.getValue();
          return (
            <div>
              <DescriptionCell content={comment?.content ?? ""} />
            </div>
          );
        },
      }),
    ],
  };

  // const deptCols = useMemo<ColumnDef<NewAppListOut, any>[]>(() => {
  //   if (!Array.isArray(departments?.data)) {
  //     return [];
  //   }
  //   if (departments.data && Array.isArray(departments.data)) {
  //     return departments.data.map((dept) =>
  //       colHelper.display({
  //         id: `dept-${dept.name}`,
  //         header: () => <span className="capitalize">{dept.name}</span>,
  //         minSize: 120,
  //         cell: ({ row }) => {
  //           const appDept = row.original.departments?.find(
  //             (d) => d.name === dept.name,
  //           );
  //           if (!appDept) return "-";
  //           return (
  //             <div className="flex items-center">
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 className={`group/dept`}
  //                 asChild
  //               >
  //                 <Badge
  //                   variant="outline"
  //                   className={`relative overflow-hidden text-xs`}
  //                   style={{
  //                     backgroundColor: STATUS_COLOR_MAP_BG[appDept.status],
  //                     color: STATUS_COLOR_MAP_FG[appDept.status],
  //                   }}
  //                 >
  //                   {/* Default text */}
  //                   <span className="block transition-opacity duration-200 group-hover/dept:opacity-0">
  //                     {appDept.status}
  //                   </span>

  //                   {/* Hover text */}
  //                   <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/dept:opacity-100">
  //                     View
  //                   </span>
  //                 </Badge>
  //               </Button>
  //               {/* <Button variant="ghost">View</Button> */}
  //             </div>
  //           );
  //         },
  //       }),
  //     );
  //   }
  //   return [];
  // }, [departments, isLoadingDepts]);

  const baseColumns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    return [
      colHelper.accessor("name", {
        header: "Name",
        minSize: 280,
        maxSize: 550,
        cell: ({ row, getValue }) => (
          <Button
            variant="link"
            className="p-0 h-auto text-left text-primary"
            onClick={() => {
              navigate(
                `/applications/details/${row.original.id}/overview?${searchParams.toString()}`,
                {
                  state: { appName: row.original.name },
                },
              );
            }}
          >
            <span className="whitespace-normal wrap-break-word">
              {getValue()}
            </span>
          </Button>
        ),
      }),
      ...(!departmentView
        ? [
            colHelper.accessor("description", {
              header: "Description",
              maxSize: 400,
              minSize: 220,
              cell: (info) => {
                const content: string = info.getValue() ?? "-";
                return <DescriptionCell content={content} />;
              },
            }),
          ]
        : []),
      colHelper.accessor("vertical", {
        header: () => (
          <Suspense fallback="Vertical">
            <VerticalSearchFilter />
          </Suspense>
        ),
        maxSize: 180,
        minSize: 120,
        cell: (info) => {
          return <span>{info.getValue()}</span>;
        },
      }),

      ...(!departmentView
        ? [
            colHelper.accessor("started_at", {
              header: "Start Date",
              maxSize: 100,
              minSize: 80,
              cell: (info) => {
                const startDate = parseDate(info.getValue());
                return <div className=" w-full">{startDate}</div>;
              },
            }),
            colHelper.accessor("status", {
              header: () => (
                <Suspense fallback={"Status"}>
                  <AppStatusHeaderFilter />
                </Suspense>
              ),
              maxSize: 140,
              minSize: 80,
              cell: (info) => {
                const status: AppStatuses = info.getValue();
                return (
                  <div className=" w-full pl-4">
                    <Badge
                      className="capitalize"
                      style={{
                        backgroundColor: STATUS_COLOR_MAP_BG[status],
                        color: STATUS_COLOR_MAP_FG[status],
                      }}
                    >
                      {parseStatus(status)}
                    </Badge>
                  </div>
                );
              },
            }),
          ]
        : []),

      colHelper.accessor("imitra_ticket_id", {
        header: "iMitra Ticket ID",
        minSize: 90,
        maxSize: 120,
        cell: (info) => {
          return info.getValue();
        },
      }),
    ];
  }, []);

  const departmentColumns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (!departmentView)
      return [
        colHelper.accessor("departments", {
          header: "Departments",
          minSize: 220,
          cell: ({ getValue }) => {
            const depts: AppDepartmentOut[] = getValue();

            const shortenDept = (dept: string) => {
              switch (dept) {
                case "iam":
                  return "IAM";
                case "tprm":
                  return "TPRM";
                case "security controls":
                  return "Sec Controls";
                case "vapt":
                  return "VAPT";
                case "soc integration":
                  return "SOC";
                default:
                  return dept;
              }
            };

            return (
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  {depts.map((d) => (
                    <Hint
                      key={d.id}
                      label={
                        <div>
                          <p>{d.name}</p>
                          <p>{parseStatus(d.status)}</p>
                        </div>
                      }
                    >
                      <div className="flex flex-col items-center cursor-default">
                        <Dot
                          key={d.id}
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: STATUS_COLOR_MAP_FG[d.status],
                          }}
                        />
                        <span>{shortenDept(d.name.toLowerCase())}</span>
                      </div>
                    </Hint>
                  ))}
                </div>
              </div>
            );
          },
        }),
      ];
    return DEPARTMENT_COLUMNS[departmentView as DeptKey] ?? [];
  }, [departmentView]);

  const columns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (!isAppsLoading) {
      return [
        ...baseColumns,
        ...departmentColumns,

        // colHelper.accessor("completed_at", {
        //   header: "End Date",
        //   maxSize: 100,
        //   minSize: 80,
        //   cell: (info) => {
        //     const endDate = parseDate(info.getValue());
        //     return <div className=" w-full">{endDate}</div>;
        //   },
        // }),

        // colHelper.accessor("imitra_ticket_id", {
        //   header: "I Mitra Ticket",
        //   maxSize: 180,
        //   minSize: 120,
        //   cell: (info) => <span>{info.getValue()}</span>,
        // }),
      ];
    }
    return [];
  }, [appsData, isAppsLoading]);
  const table = useReactTable({
    data: appsData?.data.apps ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });
  return (
    <div className="w-full h-full overflow-x-auto overflow-y-auto border rounded-md">
      <Table className="table-fixed">
        <TableHeader className="bg-accent text-accent-foreground sticky">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="text-ring">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="group/head text-md whitespace-normal wrap-break-word group/head relative h-10 select-none last:[&>.cursor-col-resize]:opacity-0 text-ring text-md font-semibold"
                  {...{
                    colSpan: header.colSpan,
                    style: {
                      width: header.getSize(),
                    },
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  {header.column.getCanResize() && (
                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className:
                          "group-last/head:hidden absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:translate-x-px",
                      }}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            isAppsLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  <div>
                    <Loader className="animate-spin w-5 h-5" />
                    <p>Loading..</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  No data found.
                </TableCell>
              </TableRow>
            )
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`max-h-40 whitespace-normal wrap-break-word`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`whitespace-normal wrap-break-word`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppsTable;
