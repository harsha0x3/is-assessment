import React, { useEffect, useState } from "react";
import {
  useGetDepartmentInfoQuery,
  useUpdateDepartmentStatusMutation,
} from "../store/departmentsApiSlice";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader, Pencil, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CommentList from "@/features/comments/components/CommentsList";
import Hint from "@/components/ui/hint";
import {
  DeptStatusOptions,
  STATUS_COLOR_MAP_BG,
  STATUS_COLOR_MAP_FG,
} from "@/utils/globalValues";
import { Separator } from "@/components/ui/separator";
import type { DeptStatuses } from "@/utils/globalTypes";
import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";
import { useParams } from "react-router-dom";
import { parseStatus } from "@/utils/helpers";

const DepartmentInfo: React.FC = () => {
  const { appId, deptId } = useParams<{ appId: string; deptId: string }>();
  const deptIdNumber = Number(deptId);

  const { data, isLoading, error } = useGetDepartmentInfoQuery(
    { appId: appId!, deptId: deptIdNumber },
    { skip: !(!!deptId && !!appId) || appId?.trim() === "" },
  );
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState<DeptStatuses>();
  const [prevStatus, setPrevStatusVal] = useState<DeptStatuses>();
  const userDepts = useSelector(selectUserDepts);

  useEffect(() => {
    if (data?.data?.status) {
      setStatusValue(data.data.status);
    }
  }, [data]);

  const [updateDepartmentStatus, { isLoading: isUpdatingStatus }] =
    useUpdateDepartmentStatusMutation();

  if (!appId || !deptId) {
    return (
      <div className="border rounded p-3">
        <p>Application Id and Department Id Not found.</p>
      </div>
    );
  }

  const handleStatusSave = async () => {
    if (statusValue === data?.data.status) {
      setIsEditingStatus(false);
      return;
    }

    try {
      await updateDepartmentStatus({
        appId,
        deptId: deptIdNumber,
        payload: { status_val: statusValue ?? "" },
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
        {isLoading ? (
          <div>
            <Loader className="animate-spin" />
            <p>Loading...</p>
          </div>
        ) : error ? (
          <p>{getApiErrorMessage(error) ?? "Error getting Department Info"}</p>
        ) : data?.data ? (
          <div className="flex flex-row w-full gap-10 items-center justify-between">
            {/* <CardTitle className="text-center w-full text-lg">
            {data?.data.name}
          </CardTitle> */}
            <div className="text-sm w-full flex items-center gap-2">
              <span>Status:</span>

              {!isEditingStatus ? (
                <>
                  <Badge
                    variant="outline"
                    style={{
                      color: STATUS_COLOR_MAP_FG[data.data.status],
                      backgroundColor: STATUS_COLOR_MAP_BG[data.data.status],
                    }}
                    className="capitalize"
                  >
                    {parseStatus(data.data.status)}
                  </Badge>

                  {userDepts.includes(deptIdNumber) && (
                    <Hint label="Update status">
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
                    </Hint>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Select
                    value={statusValue}
                    onValueChange={(value) =>
                      setStatusValue(value as DeptStatuses)
                    }
                  >
                    <SelectTrigger
                      className="w-40"
                      style={{
                        backgroundColor: statusValue
                          ? STATUS_COLOR_MAP_BG[statusValue]
                          : "",
                        color: statusValue
                          ? STATUS_COLOR_MAP_FG[statusValue]
                          : "",
                      }}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {DeptStatusOptions.map((s, idx) => {
                        return (
                          <>
                            <SelectItem
                              value={s.value}
                              style={{
                                color: STATUS_COLOR_MAP_FG[s.value],
                              }}
                              className=""
                            >
                              {s.label}
                            </SelectItem>
                            {idx !== DeptStatusOptions.length - 1 && (
                              <Separator />
                            )}
                          </>
                        );
                      })}
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
        ) : (
          <p>Failed to get Department Info</p>
        )}
      </CardHeader>
      <CardContent className="max-h-98 xl:max-h-125 2xl:max-h-135 overflow-auto">
        {isLoading ? (
          <div>
            <Loader className="animate-spin" />
            <p>Loading Comments...</p>
          </div>
        ) : error ? (
          <p>{"Error getting Department Comments"}</p>
        ) : data?.data ? (
          <CommentList
            appId={appId}
            deptId={deptIdNumber}
            commentsData={data.data.comments}
          />
        ) : (
          <p>Failed to get Department Comments</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentInfo;
