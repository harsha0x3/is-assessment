import React, { useEffect, useState } from "react";
import {
  useGetDepartmentInfoQuery,
  useUpdateDepartmentStatusMutation,
} from "../store/departmentsApiSlice";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommentList from "@/features/comments/components/CommentsList";
import Hint from "@/components/ui/hint";

const DepartmentInfo: React.FC<{ deptId: number; appId: string }> = ({
  deptId,
  appId,
}) => {
  const { data, isLoading } = useGetDepartmentInfoQuery(
    { appId, deptId },
    { skip: !(!!deptId && !!appId) || appId.trim() === "" }
  );
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [prevStatus, setPrevStatusVal] = useState<string>("");

  useEffect(() => {
    if (data?.data?.status) {
      setStatusValue(data.data.status);
    }
  }, [data]);

  const [updateDepartmentStatus, { isLoading: isUpdatingStatus }] =
    useUpdateDepartmentStatusMutation();

  const handleStatusSave = async () => {
    if (statusValue === data?.data.status) {
      setIsEditingStatus(false);
      return;
    }

    try {
      await updateDepartmentStatus({
        appId,
        deptId,
        payload: { status_val: statusValue },
      }).unwrap();

      setIsEditingStatus(false);
    } catch (err) {
      const errMsg: string = getApiErrorMessage(err) ?? "Error updating status";
      toast.error(errMsg);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="gap-2 pt-4">
      <CardHeader>
        <div className="flex flex-row w-full gap-10 items-center justify-between py-">
          <CardTitle className="text-center w-full text-lg">
            {data?.data.name}
          </CardTitle>
          <div className="text-sm w-full flex items-center gap-2">
            <span>Status:</span>

            {!isEditingStatus ? (
              <>
                <Badge
                  variant="outline"
                  className={`${
                    data?.data.status === "pending"
                      ? "bg-amber-200/35 text-amber-500"
                      : data?.data.status === "in-progress"
                      ? "bg-blue-300/35 text-blue-600"
                      : data?.data.status === "completed"
                      ? "bg-green-300/35 text-green-600"
                      : data?.data.status === "cancelled"
                      ? "bg-red-300/35 text-red-600"
                      : ""
                  }`}
                >
                  {data?.data.status}
                </Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditingStatus(true);
                    setPrevStatusVal(statusValue);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Select value={statusValue} onValueChange={setStatusValue}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Hint label="Save status">
                  <Button
                    size="sm"
                    onClick={handleStatusSave}
                    disabled={isUpdatingStatus}
                    variant="ghost"
                    className="text-blue-500"
                  >
                    <Save />
                  </Button>
                </Hint>

                <Hint label="Cancel">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingStatus(false);
                      setStatusValue(prevStatus);
                    }}
                    className="text-red-500"
                  >
                    <X />
                  </Button>
                </Hint>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-96 overflow-auto">
        <CommentList
          appId={appId}
          deptId={deptId}
          commentsData={data?.data.comments}
        />
      </CardContent>
    </Card>
  );
};

export default DepartmentInfo;
