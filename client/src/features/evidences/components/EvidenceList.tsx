import React, { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getApiErrorMessage } from "@/utils/handleApiError";
import {
  useGetAppEvidencesQuery,
  useGetDepartmentEvidencesQuery,
} from "../store/evidencesApiSlice";
import EvidenceItem from "./EvidenceItem";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  appId: string;
  deptId?: string;
}

const EvidenceList: React.FC<Props> = ({ appId, deptId }) => {
  const {
    data: appEvidences,
    isLoading: isLoadingAppEvidences,
    error: appEvidencesErr,
  } = useGetAppEvidencesQuery({ appId }, { skip: !!deptId });
  const {
    data: deptEvidences,
    isLoading: isLoadingDeptEvidences,
    error: deptEvidencesErr,
  } = useGetDepartmentEvidencesQuery(
    { appId, deptId: deptId! },
    { skip: !deptId },
  );

  const evidences = useMemo(() => {
    if (appEvidences && appEvidences?.data) {
      return appEvidences.data;
    }
    if (deptEvidences && deptEvidences?.data) {
      return deptEvidences.data;
    }
    return [];
  }, [appEvidences, deptEvidences]);

  if (isLoadingAppEvidences || isLoadingDeptEvidences) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="p-3 space-y-2 border rounded">
          <Skeleton className="h-5 w-full rounded-md mx-5" />
          <Skeleton className="h-5 w-48 rounded-md mx-5" />
        </div>
        <div className="p-3 space-y-2 border rounded">
          <Skeleton className="h-5 w-full rounded-md mx-5" />
          <Skeleton className="h-5 w-48 rounded-md mx-5" />
        </div>
        <div className="p-3 space-y-2 border rounded">
          <Skeleton className="h-5 w-full rounded-md mx-5" />
          <Skeleton className="h-5 w-48 rounded-md mx-5" />
        </div>
      </div>
    );
  }

  if (appEvidencesErr) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(appEvidencesErr) ?? "Failed to load evidences"}
      </p>
    );
  }
  if (deptEvidencesErr) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(deptEvidencesErr) ?? "Failed to load evidences"}
      </p>
    );
  }

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
        {evidences.map((evidence) => (
          <EvidenceItem evidence={evidence} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default EvidenceList;
