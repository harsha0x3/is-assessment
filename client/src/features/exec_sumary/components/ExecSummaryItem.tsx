import React, { useMemo } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";
import { Pencil } from "lucide-react";
import type { ExecSummaryOut } from "../types";
import { useUpdateExecSummaryMutation } from "../store/execSummaryApiSlice";

const ExecSummaryItem: React.FC<{ execSummary: ExecSummaryOut }> = ({
  execSummary,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(execSummary.content);
  const [saveEditExecSummary] = useUpdateExecSummaryMutation();
  const currentUser = useSelector(selectAuth);

  const created = new Date(execSummary.created_at + "Z").toLocaleString();
  const updated = execSummary?.updated_at
    ? new Date(execSummary.updated_at + "Z").toLocaleString()
    : undefined;

  const isWithin8Days = (dateString?: string) => {
    if (!dateString) return false;

    const created = new Date(dateString + "Z").getTime();
    const now = Date.now();

    return now - created <= 8 * 24 * 60 * 60 * 1000;
  };

  const canEdit = useMemo(
    () =>
      execSummary?.created_at &&
      ["admin", "manager"].includes(currentUser.role) &&
      isWithin8Days(execSummary?.created_at),
    [currentUser, execSummary],
  );

  const handleEditExecSummary = async (summaryId: string) => {
    try {
      await saveEditExecSummary({
        summaryId,
        body: { content: editContent },
      }).unwrap();
    } catch (err) {
      const errMsg: string = getApiErrorMessage(err) ?? "Error editing summary";
      toast.error(errMsg);
    }
  };

  return (
    <div className="border rounded-lg px-2 py-3 shadow-sm bg-card">
      <div className="flex items-start gap-3">
        {/* <UserCircle size={36} className="text-muted-foreground" /> */}

        <div className="flex-1">
          {/* Header */}

          {/* Content or Edit Mode */}
          {!isEditing ? (
            <div className="mt-2 text-[14px] overflow-auto pr-3">
              <ScrollArea className="max-h-90">
                <p className="whitespace-pre-line">{execSummary.content}</p>
              </ScrollArea>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="max-h-120"
              />

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(execSummary.content);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    setIsEditing(false);
                    handleEditExecSummary(execSummary.id);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center justify-between text-muted-foreground gap-2">
                <p className="">{execSummary.author?.full_name}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {!!updated ? updated : created}
              </p>
            </div>

            {/* Actions */}
            {!isEditing && canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecSummaryItem;
