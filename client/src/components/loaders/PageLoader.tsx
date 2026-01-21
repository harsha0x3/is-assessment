import { Loader } from "lucide-react";

export const PageLoader = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center h-[60vh] gap-2 text-muted-foreground">
    <Loader className="h-5 w-5 animate-spin" />
    {label ?? "Loading…"}
  </div>
);
