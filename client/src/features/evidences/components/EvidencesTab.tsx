import React from "react";
import { useParams } from "react-router-dom";
import EvidenceUploader from "./EvidenceUploader";
import EvidenceList from "./EvidenceList";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";

const EvidencesTab: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const curretUserInfo = useSelector(selectAuth);

  if (!appId) return null;

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <EvidenceList appId={appId} />
      {["super_admin", "admin"].includes(curretUserInfo.role) && (
        <EvidenceUploader appId={appId} />
      )}
    </div>
  );
};

export default EvidencesTab;
