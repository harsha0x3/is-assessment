import React, { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth, selectUserDepts } from "@/features/auth/store/authSlice";
import { Skeleton } from "@/components/ui/skeleton";

const EvidenceUploader = lazy(() => import("../components/EvidenceUploader"));
const EvidenceList = lazy(() => import("../components/EvidenceList"));

const EvidencesTab: React.FC = () => {
  const { appId, deptId } = useParams<{
    appId: string;
    deptId?: string;
  }>();
  const curretUserInfo = useSelector(selectAuth);
  const userDepts = useSelector(selectUserDepts);

  if (!appId) return null;

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <Suspense
        fallback={
          <div className="w-full flex flex-col gap-3">
            <Skeleton className="h-15 w-full rounded-md" />
            <Skeleton className="h-15 w-full rounded-md" />
            <Skeleton className="h-15 w-full rounded-md" />
          </div>
        }
      >
        <EvidenceList appId={appId} deptId={deptId} />
      </Suspense>
      {!!deptId
        ? userDepts.includes(Number(deptId)) && (
            <Suspense
              fallback={<Skeleton className="h-10 w-full rounded-md" />}
            >
              <EvidenceUploader appId={appId} deptId={deptId} />
            </Suspense>
          )
        : ["super_admin", "admin", "manager"].includes(curretUserInfo.role) && (
            <Suspense
              fallback={<Skeleton className="h-10 w-full rounded-md" />}
            >
              <EvidenceUploader appId={appId} />
            </Suspense>
          )}
    </div>
  );
};

export default EvidencesTab;
