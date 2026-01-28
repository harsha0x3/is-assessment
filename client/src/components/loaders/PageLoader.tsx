import { Loader } from "lucide-react";

export const PageLoader = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center min-h-[60vh] h-full gap-2 text-muted-foreground">
    <Loader className="h-5 w-5 animate-spin" />
    {label ?? "Loading…"}
  </div>
);
