import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";

export const SectionLoader = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
    <Loader className="h-4 w-4 animate-spin" />
    {label ?? "Loading..."}
  </div>
);

export const CardLoader = () => (
  <Card className="h-72 w-95 flex items-center justify-center">
    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
  </Card>
);
