import React from "react";
import type { EvidenceOut } from "../types";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { useGetSecuredFileMutation } from "@/store/fileServingApiSlice";

type Props = {
  evidence: EvidenceOut;
};
const EvidenceItem: React.FC<Props> = ({ evidence }) => {
  const [getFile, { isLoading }] = useGetSecuredFileMutation();

  return (
    <div
      key={evidence.id}
      className="flex items-center justify-between gap-3 rounded-md border p-3"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {evidence.evidence_path.split("/").pop()}
        </span>
        {evidence.department && (
          <span className="text-xs text-muted-foreground">
            Depatment: {evidence.department.name}
          </span>
        )}
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
            const errMsg = getApiErrorMessage(err) ?? "Error getting the file";
            toast.error(errMsg);
          }
        }}
      >
        {isLoading ? (
          <span className="flex gap-1 items-center">
            <Loader2 /> Loading
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </span>
        )}
      </Button>
    </div>
  );
};

export default EvidenceItem;
