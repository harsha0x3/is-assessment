import React, { useEffect, useMemo, useRef, useState } from "react";
import ExecSummaryItem from "./ExecSummaryItem";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Loader, PlusIcon } from "lucide-react";
import Hint from "@/components/ui/hint";
import { useSelector } from "react-redux";

import { PageLoader } from "@/components/loaders/PageLoader";
import type { ExecSummaryOut } from "../types";
import {
  useCreateDeptExecSummaryMutation,
  useCreateExecSummaryMutation,
  useGetExecSummariesByAppQuery,
} from "../store/execSummaryApiSlice";
import { selectAuth } from "@/features/auth/store/authSlice";

// ✅ shadcn accordion
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const ExecSummaryList: React.FC<{
  appId?: string;
  deptId?: number;
  defaultOpen?: boolean;
  execSummaryData?: ExecSummaryOut[];
}> = ({ appId, deptId, execSummaryData = undefined, defaultOpen = false }) => {
  const [isNewExecSummary, setIsNewExecSummary] = useState(false);
  const [newExecSummary, setNewExecSummary] = useState("");
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    defaultOpen ? "all" : undefined,
  );

  const { data: execSummary, isLoading: isLoadingExecSummary } =
    useGetExecSummariesByAppQuery(appId || "", {
      skip: execSummaryData !== undefined || !appId,
    });

  const [addNewExecSummary, { isLoading: isCreating }] =
    useCreateExecSummaryMutation();

  const [addNewDeptExecSummary, { isLoading: isCreatingDeptExec }] =
    useCreateDeptExecSummaryMutation();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentUser = useSelector(selectAuth);

  useEffect(() => {
    if (isNewExecSummary && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isNewExecSummary]);

  const canAdd = useMemo(
    () => ["admin", "manager", "moderator"].includes(currentUser.role),
    [currentUser],
  );
  const userDepts = currentUser.departments.map((dept) => dept.department_id);
  const canAddDeptExec = useMemo(
    () =>
      ["admin", "manager", "moderator"].includes(currentUser.role) &&
      userDepts.includes(deptId || -1),
    [currentUser],
  );

  const isApp = appId && !deptId;
  const isDept = appId && deptId;
  const handleAddNewExecSummary = async () => {
    try {
      if (isApp) {
        await addNewExecSummary({
          appId,
          body: { content: newExecSummary },
        }).unwrap();
      }
      if (isDept) {
        await addNewDeptExecSummary({
          appId,
          deptId,
          body: { content: newExecSummary },
        }).unwrap();
      }

      setIsNewExecSummary(false);
      setNewExecSummary("");
    } catch (err) {
      const errMsg = getApiErrorMessage(err) ?? "Error adding new execSummary";
      toast.error(errMsg);
    }
  };

  if (isLoadingExecSummary) {
    return <PageLoader label="Loading executive Summary" />;
  }

  const execSummaryToShow = execSummaryData ?? execSummary;

  const firstItem = execSummaryToShow?.[0];
  const remainingItems = execSummaryToShow?.slice(1);

  return (
    <div>
      <div className="flex w-full items-center gap-2 pb-2">
        <h2 className="text-lg font-semibold px-3">Executive Summary</h2>

        {isApp && canAdd && !isNewExecSummary && (
          <Hint label="New ExecSummary">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewExecSummary(true)}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </Hint>
        )}
        {isDept && canAddDeptExec && !isNewExecSummary && (
          <Hint label="New ExecSummary">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewExecSummary(true)}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </Hint>
        )}

        {isNewExecSummary && (
          <div className="space-x-2 flex gap-2 items-center">
            <Button
              variant="secondary"
              onClick={() => {
                setIsNewExecSummary(false);
                setNewExecSummary("");
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAddNewExecSummary}
              disabled={isCreating || isCreatingDeptExec}
            >
              {isCreating || isCreatingDeptExec ? (
                <span className="flex gap-2 items-center">
                  <Loader className="animate-spin" />
                  Adding..
                </span>
              ) : (
                "Add"
              )}
            </Button>
          </div>
        )}
      </div>
      <Separator />

      {isNewExecSummary && (
        <Textarea
          ref={textareaRef}
          value={newExecSummary}
          onChange={(e) => setNewExecSummary(e.target.value)}
          className="my-2 max-h-120"
        />
      )}

      {(!execSummaryToShow || execSummaryToShow.length === 0) && (
        <p className="text-sm text-muted-foreground">
          No Executive Summary added yet.
        </p>
      )}

      {/* ✅ First item always visible */}
      {firstItem && (
        <div className="space-y-2">
          <ExecSummaryItem key={firstItem.id} execSummary={firstItem} />
        </div>
      )}

      {/* ✅ Remaining items inside accordion */}
      {remainingItems && remainingItems.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="mt-2"
        >
          <AccordionItem value="all">
            <AccordionTrigger>
              {accordionValue === "all"
                ? "Show less"
                : `Show all (${remainingItems.length} more)`}
            </AccordionTrigger>

            <AccordionContent className="max-h-100 overflow-auto">
              <div className="space-y-2 pt-2">
                {remainingItems.map((item) => (
                  <ExecSummaryItem key={item.id} execSummary={item} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default ExecSummaryList;
