import React, { useState } from "react";
import { useLazyExportApplicationsCSVQuery } from "../../store/exportsApiSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Loader } from "lucide-react";

const ExportAllApps: React.FC = () => {
  const [trigger, { isLoading }] = useLazyExportApplicationsCSVQuery();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await trigger().unwrap();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "is_assessment_all_applications.csv";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error downloading the report");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading || isDownloading}>
      {isLoading || isDownloading ? (
        <span className="flex items-center">
          <Loader className="animnate-spin" />
        </span>
      ) : (
        "Export"
      )}
    </Button>
  );
};

export default ExportAllApps;
