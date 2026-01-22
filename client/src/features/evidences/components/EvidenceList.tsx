import React from "react";
import { useGetAppEvidencesQuery } from "@/features/applications/store/applicationsApiSlice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useGetSecuredFileMutation } from "@/store/fileServingApiSlice";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/handleApiError";

interface Props {
  appId: string;
}

const EvidenceList: React.FC<Props> = ({ appId }) => {
  const [getFile] = useGetSecuredFileMutation();
  const { data, isLoading, isError } = useGetAppEvidencesQuery({ appId });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading evidences…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load evidences</p>;
  }

  const evidences = data?.data ?? [];

  if (!evidences.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No evidences uploaded yet.
      </p>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0 rounded-md border">
      <div className="p-4 space-y-3">
        {evidences.map((evidence: any) => (
          <div
            key={evidence.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {evidence.evidence_path.split("/").pop()}
              </span>
              {/* <span className="text-xs text-muted-foreground">
                Severity: {evidence.severity}
              </span> */}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-ring"
              onClick={async () => {
                try {
                  const file = await getFile({
                    path: evidence.evidence_path,
                  }).unwrap();

                  const blobUrl = URL.createObjectURL(file);

                  window.open(blobUrl, "_blank");

                  // Optional but recommended cleanup
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
                } catch (err) {
                  const errMsg =
                    getApiErrorMessage(err) ?? "Error getting the file";
                  toast.error(errMsg);
                }
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default EvidenceList;
