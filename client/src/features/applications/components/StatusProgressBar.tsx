import React, { useMemo, useState } from "react";
import type { AppStatusStats } from "@/features/applications/types";
import clsx from "clsx";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import Hint from "@/components/ui/hint";
import { parseStatus } from "@/utils/helpers";
import type { AppStatuses } from "@/utils/globalTypes";

interface Props {
  stats?: AppStatusStats;
  onStatusClick?: (status: string) => void;
}

const StatusProgressBar: React.FC<Props> = ({ stats, onStatusClick }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = useMemo(() => {
    if (!stats) return 0;
    return Object.values(stats).reduce((a, b) => a + b, 0);
  }, [stats]);

  if (!stats || total === 0) return null;

  return (
    <div className="relative w-full h-3 flex rounded overflow-hidden items-center">
      {Object.entries(stats).map(([status, count]) => {
        if (count === 0) return null;

        const percent = (count / total) * 100;

        return (
          <Hint
            label={
              <div className="capitalize">
                {parseStatus(status)}: {count}
              </div>
            }
          >
            <div
              key={status}
              onMouseEnter={() => setHovered(status)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStatusClick?.(status)}
              className={clsx(
                "transition-all h-2 duration-200 cursor-pointer hover:h-3",
                hovered === status ? "scale-y-150 z-10" : "scale-y-100"
              )}
              style={{
                width: `${percent}%`,
                backgroundColor: STATUS_COLOR_MAP_FG[status as AppStatuses],
              }}
            ></div>
          </Hint>
        );
      })}
    </div>
  );
};

export default StatusProgressBar;
