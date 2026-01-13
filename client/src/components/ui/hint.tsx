import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "@/lib/utils";

interface HintProps {
  label: string | React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "left" | "bottom";
  align?: "start" | "center" | "end";
  className?: string;
}

const Hint: React.FC<HintProps> = ({
  label,
  children,
  side,
  align,
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn("font-medium text-xs", className)}
        >
          <p className="">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Hint;
