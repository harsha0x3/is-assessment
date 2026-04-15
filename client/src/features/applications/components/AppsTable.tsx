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
  daysBetweenDates,
  getSeverityLabel,
  parseDate,
  parseStatus,
  shortenDept,
} from "@/utils/helpers";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
import type {
  AppDeptOutWithLatestComment,
  AppDeptWithLatestExecSummary,
} from "@/features/departments/types";
import Hint from "@/components/ui/hint";
import {
  Bot,
  ClockAlert,
  FlagTriangleRight,
  Info,
  InfoIcon,
  Loader,
  ShieldPlus,
} from "lucide-react";
import { useApplicationsContext } from "../context/ApplicationsContext";
import { createDepartmentStatusColumn } from "./DepartmentColumnFactory";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import AppTypeFilter from "./tableHeaders/AppTypeFilter";
import AppSeverityHeaderFilter from "./tableHeaders/AppSeverityHeaderFilter";
import { Separator } from "@/components/ui/separator";
import ExecSummaryItem from "@/features/exec_sumary/components/ExecSummaryItem";
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
    filteredAppsSummary,
  } = useApplicationsContext();
  // const { data: departments, isLoading: isLoadingDepts } =
  //   useGetAllDepartmentsQuery();
  const navigate = useNavigate();
  const colHelper = createColumnHelper<NewAppListOut>();
  const [searchParams] = useSearchParams();
  const departmentView = searchParams.get("view");
  type DeptKey =
    | "web_vapt"
    | "tprm"
    | "security_controls"
    | "iam"
    | "soc_integration"
    | "ai_security"
    | "mobile_vapt"
    | "privacy";

  const DepartmentsStatusCol: React.FC<{
    depts: AppDeptOutWithLatestComment[] | AppDeptWithLatestExecSummary[];
    appId: string;
  }> = ({ depts, appId }) => {
    return (
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {depts.map((d) => (
            <HoverCard key={d.name} openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <div className="flex flex-col items-center cursor-default">
                  {appStatus === "go_live" ? (
                    <FlagTriangleRight
                      className="w-3 h-3"
                      fill={
                        d.status === "go_live"
                          ? STATUS_COLOR_MAP_FG[d.status as AppStatuses]
                          : "none"
                      }
                    />
                  ) : (
                    <span
                      key={d.id}
                      className="h-3 w-3 rounded-md"
                      style={{
                        backgroundColor:
                          STATUS_COLOR_MAP_FG[d.status as AppStatuses],
                      }}
                    />
                  )}
                  <span
                    className="hover:underline hover:text-ring hover:cursor-pointer transition-all whitespace-nowrap"
                    onClick={() =>
                      navigate(
                        `details/${appId}/departments/${d.id}/comments?${searchParams.toString()}`,
                      )
                    }
                  >
                    {shortenDept(d.name.toLowerCase())}
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-lg p-4 text-black" side="top">
                <div className="flex flex-col gap-2">
                  {/* Department Name and Status */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{d.name}</h3>
                    <Badge
                      className={`capitalize ${d.status === "go_live" ? "border-2 border-gray-500 rounded-xl" : ""}`}
                      style={{
                        backgroundColor:
                          STATUS_COLOR_MAP_BG[d.status as AppStatuses],
                        color: STATUS_COLOR_MAP_FG[d.status as AppStatuses],
                      }}
                    >
                      {parseStatus(d.status)}
                    </Badge>
                  </div>

                  {/* Dates Section */}
                  <div className="text-sm space-y-1">
                    {d?.started_at && (
                      <div>
                        <span className="font-medium">Started:</span>{" "}
                        {parseDate(d.started_at)}
                      </div>
                    )}
                    {d?.ended_at && (
                      <div>
                        <span className="font-medium">Ended:</span>{" "}
                        {parseDate(d.ended_at)}
                      </div>
                    )}
                    {d?.go_live_at && (
                      <div>
                        <span className="font-medium">Go Live:</span>{" "}
                        {parseDate(d.go_live_at)}
                      </div>
                    )}
                  </div>

                  {"latest_comment" in d && d.latest_comment && (
                    <>
                      <Separator />
                      {/* Latest Comment Section */}
                      <div className="space-y-1">
                        <div className="text-[14px]">
                          <p className="font-bold">Comment: </p>{" "}
                          <p className="text-[13px] whitespace-pre-line">
                            {d.latest_comment.content}
                          </p>
                        </div>
                        {d.latest_comment.author && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Author:</span>{" "}
                            {d.latest_comment.author.full_name}
                          </div>
                        )}
                        {d.latest_comment.updated_at && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Updated:</span>{" "}
                            {parseDate(d.latest_comment.updated_at)}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    );
  };

  const DEPARTMENT_COLUMNS: Record<DeptKey, ColumnDef<NewAppListOut, any>[]> = {
    web_vapt: [
      ...createDepartmentStatusColumn("web vapt", "Web VAPT"),
      colHelper.accessor("app_url", {
        header: "App URL",
        cell: (info) => {
          return info.getValue();
        },
      }),
    ],
    mobile_vapt: [
      ...createDepartmentStatusColumn("mobile vapt", "Mobile VAPT"),
      colHelper.accessor("app_url", {
        header: "App URL",
        cell: (info) => {
          return info.getValue();
        },
      }),
    ],

    tprm: [
      colHelper.accessor("vendor_company", {
        header: "Vendor",
        cell: (info) => {
          return info.getValue();
        },
      }),

      ...createDepartmentStatusColumn("tprm", "TPRM"),
    ],

    security_controls: [
      ...createDepartmentStatusColumn("security controls", "Security Controls"),
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
    ],
    iam: [
      ...createDepartmentStatusColumn("iam", "IAM"),
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
    ],
    soc_integration: [
      ...createDepartmentStatusColumn("soc integration", "SOC Integration"),
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
    ],
    ai_security: [
      ...createDepartmentStatusColumn("ai security", "AI Security"),
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
    ],

    privacy: [
      ...createDepartmentStatusColumn("privacy", "Privacy"),
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
          const isAppAi = row.original.is_app_ai;
          const isAppPrivacy = row.original.is_privacy_applicable;

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
                {isAppAi && (
                  <Hint label={`AI Application`}>
                    <span className="cursor-default">
                      <Bot
                        strokeWidth={3}
                        className="inline mr-1 text-purple-500"
                      />
                    </span>
                  </Hint>
                )}
                {isAppPrivacy && (
                  <Hint label={`Privacy Application`}>
                    <span className="cursor-default">
                      <ShieldPlus
                        strokeWidth={4}
                        className="inline mr-1 text-indigo-400"
                      />
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
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <span className="w-fit">
                  <Badge
                    className={`capitalize ${status === "go_live" ? "border-2 border-gray-500 rounded-xl" : ""}`}
                    style={{
                      backgroundColor: STATUS_COLOR_MAP_BG[status],
                      color: STATUS_COLOR_MAP_FG[status],
                    }}
                  >
                    {parseStatus(status)}
                  </Badge>
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-lg space-y-2" side="top">
                <h2 className="test-lg font-bold">Executive Summary</h2>
                <Separator />
                {info.row.original?.latest_executive_summary ? (
                  <ExecSummaryItem
                    execSummary={info.row.original.latest_executive_summary}
                  />
                ) : (
                  "No Data Added"
                )}
              </HoverCardContent>
            </HoverCard>
          );
        },
      }),
      colHelper.accessor("started_at", {
        header: () => (
          <Suspense fallback="Duration">
            <SLAFilterHeader />
          </Suspense>
        ),
        maxSize: 150,
        minSize: 120,
        cell: ({ row }) => {
          const rawStartDate = row.original.started_at; // "2026-01-11"
          const rawEndDate = row.original.completed_at;

          if (rawStartDate && !rawEndDate) {
            return (
              <div className="w-full">
                <p>Started: {parseDate(rawStartDate)}</p>
                <p className="text-muted-foreground">
                  {daysBetweenDateAndToday(rawStartDate)} Days ago
                </p>
              </div>
            );
          } else if (rawStartDate && rawEndDate) {
            const duration = daysBetweenDates(rawStartDate, rawEndDate);
            return (
              <div className="w-full">
                <p>
                  {parseDate(rawStartDate)} - {parseDate(rawEndDate)}
                </p>
                <p className="text-muted-foreground">{duration} Days</p>
              </div>
            );
          } else {
            return <span>-</span>;
          }
        },
      }),
      colHelper.accessor("severity", {
        header: () => <AppSeverityHeaderFilter />,
        minSize: 90,
        maxSize: 120,
        cell: (info) => {
          const val = info.getValue();

          return (
            <Badge
              className={`${val && val === 1 ? "bg-indigo-300" : val === 2 ? "bg-blue-400" : val === 3 ? "bg-red-300" : val === 4 ? "bg-amber-600" : "bg-muted"}`}
            >
              {val ? getSeverityLabel(val) : "-"}
            </Badge>
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

      colHelper.accessor("environment", {
        header: () => (
          <div className="flex items-center w-full space-x-2 gap-2">
            <p className="m-0">Environment</p>
            <Hint
              label={
                <div className="text-[12px]">
                  <p className="m-0">
                    <span>External Hosted: </span>
                    {filteredAppsSummary?.external_environment_count}
                  </p>
                  <p className="m-0">
                    <span>Internal Hosted: </span>
                    {filteredAppsSummary?.internal_environment_count}
                  </p>
                </div>
              }
            >
              <InfoIcon className="w-4 h-4" />
            </Hint>
          </div>
        ),
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

      colHelper.accessor("app_vertical.name", {
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

      colHelper.accessor("imitra_ticket_id", {
        header: "iMitra Ticket ID",
        minSize: 90,
        maxSize: 120,
        cell: (info) => {
          return info.getValue();
        },
      }),
    ];
  }, [departmentView, searchParams, filteredAppsSummary]);

  const departmentColumns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (!departmentView)
      return [
        colHelper.accessor("departments", {
          header: "Departments",
          minSize: 300,
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
                  className="text-center py-6 capitalize"
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
                  className="text-center py-6 capitalize"
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
                    className={`whitespace-normal wrap-break-word capitalize`}
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
