// components/comments/CommentList.jsx

import { useEffect, useRef, useState } from "react";

import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCommentMutation,
  useGetCommentsForDepartmentQuery,
} from "@/features/comments/store/commentsApiSlice";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Loader, PlusIcon } from "lucide-react";
import Hint from "@/components/ui/hint";
import type { CommentOut } from "../types";
import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";
import { PageLoader } from "@/components/loaders/PageLoader";

const CommentList: React.FC<{
  appId: string;
  deptId: number;
  commentsData?: CommentOut[];
}> = ({ appId, deptId, commentsData = undefined }) => {
  const [isNewComment, setIsNewComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { data: deptComments, isLoading: isLoadingDeptComments } =
    useGetCommentsForDepartmentQuery(
      {
        appId,
        deptId,
      },
      { skip: commentsData !== undefined },
    );
  const userDepts = useSelector(selectUserDepts);

  const [addNewComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleAddNewComment = async () => {
    try {
      const payload = new FormData();
      payload.append("content", newComment);
      await addNewComment({ payload, appId, deptId }).unwrap();
      setIsNewComment(false);
      setNewComment("");
    } catch (err) {
      const errMsg: string =
        getApiErrorMessage(err) ?? "Error adding new comment";
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    if (isNewComment && textareaRef.current) {
      textareaRef.current?.focus();
    }
  }, [isNewComment, textareaRef.current]);

  if (isLoadingDeptComments) {
    return <PageLoader label="Loading department comments" />;
  }

  const commentsToShow = commentsData ?? deptComments?.data;

  return (
    <div>
      <div className="flex w-full items-center gap-2 pb-2">
        <h2 className="text-lg font-semibold px-3">Comments</h2>
        {userDepts.includes(deptId) && !isNewComment && (
          <Hint label="New Comment">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewComment(true)}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </Hint>
        )}
        {isNewComment && (
          <div className="space-x-2 flex gap-2 items-center">
            <Button
              variant="secondary"
              onClick={() => {
                setIsNewComment(false);
                setNewComment("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewComment} disabled={isCreating}>
              {isCreating ? (
                <span className="flex gap-2 items-center">
                  <Loader className="animate-spin" />
                  Saving..
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        )}
      </div>
      {isNewComment && (
        <Textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="my-2 max-h-120"
        />
      )}
      {commentsToShow &&
        Array.isArray(commentsToShow) &&
        commentsToShow.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      <div className={`space-y-2`}>
        {commentsToShow &&
          Array.isArray(commentsToShow) &&
          commentsToShow.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
      </div>
    </div>
  );
};

export default CommentList;
