// components/comments/CommentItem.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCommentMutation } from "../store/commentsApiSlice";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/handleApiError";
import type { CommentOut } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";

const CommentItem: React.FC<{ comment: CommentOut }> = ({ comment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saveEditComment] = useUpdateCommentMutation();

  const handleEditComment = async (commentId: string) => {
    try {
      await saveEditComment({
        commentId,
        payload: { content: editContent },
      }).unwrap();
    } catch (err) {
      const errMsg: string = getApiErrorMessage(err) ?? "Error editing comment";
      toast.error(errMsg);
    }
  };

  const created = new Date(comment.created_at + "Z").toLocaleString();

  return (
    <div className="border rounded-lg px-2 py-3 shadow-sm bg-card">
      <div className="flex items-start gap-3">
        {/* <UserCircle size={36} className="text-muted-foreground" /> */}

        <div className="flex-1">
          {/* Header */}

          {/* Content or Edit Mode */}
          {!isEditing ? (
            <div className="mt-2 text-[14px] overflow-auto pr-3">
              <ScrollArea className="max-h-120">
                <p>{comment.content}</p>
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
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={() => {
                    setIsEditing(false);
                    handleEditComment(comment.id);
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
                <p className="">{comment.author?.full_name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{created}</p>
            </div>

            {/* Actions */}
            {/* {!isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
