import { Button } from "@/components/ui/button";
import type { AppStatuses } from "@/utils/globalTypes";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import { parseStatus } from "@/utils/helpers";
import { ArrowRight, FlagTriangleRight } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppStatusCard: React.FC<{
  data: { name: string; count: number; percent: number };
}> = ({ data }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const all = document.querySelectorAll(".spotlight-card");
    const handleMouseMove = (ev: MouseEvent) => {
      all.forEach((e) => {
        const blob = e.querySelector(".blob") as HTMLElement;
        const fblob = e.querySelector(".fake-blob") as HTMLElement;

        if (!blob || !fblob) return;

        const rec = fblob.getBoundingClientRect();

        blob.style.opacity = "1";

        blob.animate(
          [
            {
              transform: `translate(${ev.clientX - rec.left - rec.width / 2}px,  ${ev.clientY - rec.top - rec.height / 2}px)`,
            },
          ],
          {
            duration: 300,
            fill: "forwards",
          },
        );
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <div
      className="spotlight-card relative overflow-hidden group/status  
          border rounded-md
          shadow-card
          transition-all
          duration-300
          ease-in-out
          hover:shadow-md hover:-translate-y-0.5
          focus-visible:ring-2 focus-visible:ring-primary bg-border/30"
    >
      <div
        tabIndex={0}
        className="flex z-10 flex-col gap-1 px-3 py-2 group-hover:bg-card/90 border-none transition-all duration-300 ease-in-out group-hover:backdrop-blur-[20px]"
      >
        {/* Title */}
        <p className="font-medium capitalize flex items-center gap-2">
          {parseStatus(data.name)}
          {data.name === "go_live" ? (
            <FlagTriangleRight
              fill={STATUS_COLOR_MAP_FG[data.name as AppStatuses]}
              className="w-5 h-5"
            />
          ) : (
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: STATUS_COLOR_MAP_FG[data.name as AppStatuses],
              }}
            />
          )}
        </p>

        {/* Count + Action */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">{data.count}</span>

          <Button
            onClick={() => navigate(`/applications?appStatus=${data.name}`)}
            variant="link"
            className="
            items-center
            group/view_button
            opacity-100
              md:opacity-0
              md:hidden
              md:group-hover/status:opacity-100
              md:group-hover/status:flex
              md:group-hover/status:pointer-events-auto
              md:group-focus-visible/status:opacity-100
              md:group-focus-visible/status:pointer-events-auto
              transition-opacity
              text-sm
              p-0 h-auto
            "
          >
            <p>View details</p>{" "}
            <ArrowRight className="opacity-0 group-hover/view_button:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
      <div className="blob pointer-events-none absolute top-0 left-0 size-10 rounded-full bg-primary/60 opacity-0 blur-lg transition-all duration-300 ease-in-out dark:primary/60" />
      <div className="fake-blob absolute top-0 pointer-events-none left-0 size-10 rounded-full" />
    </div>
  );
};

export default AppStatusCard;
