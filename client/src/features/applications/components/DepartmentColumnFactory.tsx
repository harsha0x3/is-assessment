import { Badge } from "@/components/ui/badge";
import { parseStatus } from "@/utils/helpers";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { NewAppListOut } from "../types";
import { DeptStatusHeaderFilter } from "./AppsTableHeaders";

const colHelper = createColumnHelper<NewAppListOut>();

export const createDepartmentStatusColumn = (
  deptKey: string,
  displayName: string,
): ColumnDef<NewAppListOut> =>
  colHelper.display({
    id: `${deptKey}_status`,
    minSize: 140,
    maxSize: 140,
    header: () => <DeptStatusHeaderFilter deptName={displayName} />,
    cell: ({ row }) => {
      const dept = row.original.departments?.find(
        (d) => d.name.toLowerCase() === deptKey,
      );

      const status = dept?.status ?? "yet_to_connect";

      return (
        <div className="pl-4">
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
  });
