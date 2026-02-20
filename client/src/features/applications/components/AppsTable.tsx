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
import {
  daysBetweenDateAndToday,
  parseDate,
  parseStatus,
} from "@/utils/helpers";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
import type { AppDepartmentOut } from "@/features/departments/types";
import Hint from "@/components/ui/hint";
import { ClockAlert, Dot, FlagTriangleRight, Info, Loader } from "lucide-react";
import { useApplicationsContext } from "../context/ApplicationsContext";
import { createDepartmentStatusColumn } from "./DepartmentColumnFactory";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import AppTypeFilter from "./tableHeaders/AppTypeFilter";
const VerticalSearchFilter = lazy(
  () => import("../components/tableHeaders/VerticalSearchFilter"),
);
const AppStatusHeaderFilter = lazy(
  () => import("../components/tableHeaders/AppStatusHeaderFilter"),
);

const SLAFilterHeader = lazy(() => import("./tableHeaders/SLAFilterHeader"));
// import { useGetAllDepartmentsQuery } from "@/features/departments/store/departmentsApiSlice";

// type Props = {
//   data:
// }

const AppsTable: React.FC = () => {
  const {
    data: appsData,
    isLoading: isAppsLoading,
    appStatus,
  } = useApplicationsContext();
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

  const DepartmentsStatusCol: React.FC<{
    depts: AppDepartmentOut[];
    appId: string;
  }> = ({ depts, appId }) => {
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
                  <p className="capitalize">{parseStatus(d.status)}</p>
                </div>
              }
            >
              <div className="flex flex-col items-center cursor-default">
                {appStatus === "go_live" ? (
                  <FlagTriangleRight
                    className="w-4 h-4"
                    fill={
                      d.status === "go_live"
                        ? STATUS_COLOR_MAP_FG[d.status]
                        : "none"
                    }
                  />
                ) : (
                  <Dot
                    key={d.id}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: STATUS_COLOR_MAP_FG[d.status],
                    }}
                  />
                )}
                <span
                  className="hover:underline hover:text-ring hover:cursor-pointer transition-all"
                  onClick={() =>
                    navigate(
                      `details/${appId}/departments/${d.id}/comments?${searchParams.toString()}`,
                    )
                  }
                >
                  {shortenDept(d.name.toLowerCase())}
                </span>
              </div>
            </Hint>
          ))}
        </div>
      </div>
    );
  };

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
      // colHelper.accessor("vendor_company", {
      //   header: "Vendor",
      //   cell: (info) => {
      //     return info.getValue();
      //   },
      // }),
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

  const baseColumns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    return [
      colHelper.accessor("name", {
        header: () => <AppTypeFilter />,
        minSize: 280,
        maxSize: 550,
        cell: ({ row, getValue }) => {
          const dueDays = daysBetweenDateAndToday(row.original.due_date);

          return (
            <Button
              variant="link"
              className="p-0 h-auto text-left text-primary"
              onClick={() => {
                navigate(
                  `details/${row.original.id}/overview?${searchParams.toString()}`,
                );
              }}
            >
              <span className="whitespace-normal wrap-break-word">
                {Number(dueDays) > 0 && (
                  <Hint label={`Overdue by ${dueDays} days`}>
                    <span className="cursor-default">
                      <ClockAlert className="inline mr-1 text-amber-500" />
                    </span>
                  </Hint>
                )}
                {getValue()}
              </span>
              <HoverCard openDelay={10} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span className="">
                    <Info className="text-blue-500" />
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit" side="top" align="start">
                  {row.original.departments ? (
                    <DepartmentsStatusCol
                      depts={row.original.departments}
                      appId={row.original.id}
                    />
                  ) : (
                    <p>No Data to be shown</p>
                  )}
                </HoverCardContent>
              </HoverCard>
            </Button>
          );
        },
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
              header: () => (
                <Suspense fallback="Duration">
                  <SLAFilterHeader />
                </Suspense>
              ),
              maxSize: 150,
              minSize: 120,
              cell: (info) => {
                const rawDate = info.getValue(); // "2026-01-11"

                return rawDate ? (
                  <div className="w-full">
                    <p>Started: {parseDate(rawDate)}</p>
                    <p className="text-muted-foreground">
                      {daysBetweenDateAndToday(rawDate)} Days ago
                    </p>
                  </div>
                ) : (
                  "-"
                );
              },
            }),
          ]
        : []),
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
                className={`capitalize ${status === "go_live" ? "border-2 border-gray-500 rounded-xl" : ""}`}
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
      colHelper.accessor("environment", {
        header: "Environment",
        minSize: 120,
        maxSize: 160,
        cell: (info) => {
          return info.getValue();
        },
      }),
      colHelper.accessor("vendor_company", {
        header: "Vendor Company",
        minSize: 120,
        maxSize: 160,
        cell: (info) => {
          return info.getValue();
        },
      }),
      colHelper.accessor("imitra_ticket_id", {
        header: "iMitra Ticket ID",
        minSize: 90,
        maxSize: 120,
        cell: (info) => {
          return info.getValue();
        },
      }),
    ];
  }, [departmentView, searchParams]);

  const departmentColumns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (!departmentView)
      return [
        colHelper.accessor("departments", {
          header: "Departments",
          minSize: 220,
          cell: ({ getValue, row }) => (
            <DepartmentsStatusCol depts={getValue()} appId={row.original.id} />
          ),
        }),
      ];
    return DEPARTMENT_COLUMNS[departmentView as DeptKey] ?? [];
  }, [departmentView, appStatus, searchParams]);

  const columns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (!isAppsLoading) {
      return [
        ...baseColumns,
        // colHelper.accessor("environment", {
        //   header: "Environment",
        //   maxSize: 100,
        //   minSize: 80,
        //   cell: (info) => {
        //     return <div className=" w-full">{info.getValue()}</div>;
        //   },
        // }),
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
  }, [appsData, isAppsLoading, searchParams]);
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
