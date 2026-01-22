import { useNavigate } from "react-router-dom";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { StatusCountItem } from "../types";
import type { AppStatuses } from "@/utils/globalTypes";
import { Button } from "@/components/ui/button";
import Hint from "@/components/ui/hint";
import { parseStatus } from "@/utils/helpers";

type Props = {
  vertical: string;
  statuses: StatusCountItem[];
  total: number;
};

const VerticalsStatusProgressBar: React.FC<Props> = ({
  vertical,
  statuses,
  total,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-1 w-full overflow-hidden rounded items-center h-8 sm:pr-10 pr-15">
      {statuses.map(({ status, count }) => {
        if (count === 0) return null;

        return (
          <Hint
            key={status}
            label={
              <div>
                <p className="capitalize">{parseStatus(status)}</p>
                <p>{count}</p>
              </div>
            }
          >
            <Button
              key={status}
              className="focus:outline-none h-5 hover:shadow-md hover:-translate-y-0.5 rounded"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: STATUS_COLOR_MAP_FG[status as AppStatuses],
              }}
              onClick={() =>
                navigate(
                  `/applications?appVertical=${vertical}&appStatus=${status}`,
                )
              }
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

export default VerticalsStatusProgressBar;
