import React, { useMemo } from "react";
import type { AppStatusSummary } from "@/features/applications/types";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import Hint from "@/components/ui/hint";
import { parseStatus } from "@/utils/helpers";
import type { AppStatuses } from "@/utils/globalTypes";
import { Button } from "@/components/ui/button";

interface Props {
  summary?: AppStatusSummary;
  onStatusClick?: (status: string) => void;
}

const StatusProgressBar: React.FC<Props> = ({ summary, onStatusClick }) => {
  const total = useMemo(() => {
    if (!summary) return 0;
    return Object.values(summary).reduce((a, b) => a + b, 0);
  }, [summary]);

  if (!summary || total === 0) return null;

  return (
    <div className="relative w-full h-8 sm:pr-10 gap-1 flex rounded overflow-hidden items-center">
      {Object.entries(summary).map(([status, count]) => {
        if (count === 0) return null;

        const percent = (count / total) * 100;

        return (
          <Hint
            key={status}
            label={
              <div className="capitalize">
                {parseStatus(status)}: {count}
              </div>
            }
          >
            <Button
              key={status}
              onClick={() => onStatusClick?.(status)}
              className="focus:outline-none h-5 hover:shadow-md hover:-translate-y-0.5 rounded"
              style={{
                width: `${percent}%`,
                backgroundColor: STATUS_COLOR_MAP_FG[status as AppStatuses],
              }}
            >
              <p className="truncate capitalize text-xs">
                {count} {parseStatus(status)}
              </p>
            </Button>
          </Hint>
        );
      })}
    </div>
  );
};

export default StatusProgressBar;
