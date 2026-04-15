import React from "react";
import { useParams } from "react-router-dom";
import { useGetExecSummariesByDeptQuery } from "../store/execSummaryApiSlice";
import ExecSummaryList from "./ExecSummaryList";

const ExecSummaryinfo: React.FC = () => {
  const { appId, deptId } = useParams();
  const {
    data: execSummary,
    isLoading,
    error,
  } = useGetExecSummariesByDeptQuery(
    { appId: appId || "", deptId: Number(deptId) || 0 },
    { skip: !appId || !deptId },
  );
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading executive summary.</div>;
  }
  return (
    <ExecSummaryList
      defaultOpen={true}
      execSummaryData={execSummary}
      appId={appId}
      deptId={Number(deptId)}
    />
  );
};

export default ExecSummaryinfo;
