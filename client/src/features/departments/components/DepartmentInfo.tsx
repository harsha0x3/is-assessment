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
  DepartmentCategoryMap,
  DepartmentCategoryStatusMap,
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
import { PageLoader } from "@/components/loaders/PageLoader";
import { ScrollArea } from "@/components/ui/scroll-area";

const DepartmentInfo: React.FC = () => {
  const { appId, deptId } = useParams<{ appId: string; deptId: string }>();
  const deptIdNumber = Number(deptId);

  const { data, isLoading, error } = useGetDepartmentInfoQuery(
    { appId: appId!, deptId: deptIdNumber },
    { skip: !(!!deptId && !!appId) || appId?.trim() === "" },
  );
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingCategoryStatus, setIsEditingCategoryStatus] = useState(false);
  const [statusValue, setStatusValue] = useState<DeptStatuses>();
  const [prevStatus, setPrevStatusVal] = useState<DeptStatuses>();
  const [prevCategory, setPrevCategory] = useState<string>();
  const [categoryVal, setCategoryVal] = useState<string>();
  const [categoryStatus, setCategoryStatus] = useState<string>();
  const [prevCategoryStatus, setPrevCategoryStatus] = useState<string>();

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
    if (
      statusValue === data?.data.status &&
      categoryVal === data?.data.app_category &&
      categoryStatus === data?.data.category_status
    ) {
      setIsEditingStatus(false);
      setIsEditingCategory(false);
      setIsEditingCategoryStatus(false);
      return;
    }

    try {
      await updateDepartmentStatus({
        appId,
        deptId: deptIdNumber,
        payload: {
          status: statusValue,
          app_category: categoryVal,
          category_status: categoryStatus,
        },
      }).unwrap();

      setIsEditingStatus(false);
      setIsEditingCategory(false);
      setIsEditingCategoryStatus(false);
    } catch (err) {
      const errMsg: string = getApiErrorMessage(err) ?? "Error updating status";
      toast.error(errMsg);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading Department Info" />;
  }

  return (
    <Card className="flex flex-col min-h-0 h-full w-full gap-2 pt-4">
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
            {/* App status */}
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
                              disabled={
                                s.value == "go_live" && !data.data.can_go_live
                              }
                              style={{
                                color: STATUS_COLOR_MAP_FG[s.value],
                              }}
                              className="data-disabled:cursor-not-allowed data-disabled:opacity-50"
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
            {/* App Category */}
            <div className="text-sm w-full flex items-center gap-2">
              <span>Category:</span>

              {!isEditingCategory ? (
                <>
                  <Badge variant="outline" className="capitalize">
                    {parseStatus(data.data.app_category ?? "-")}
                  </Badge>

                  {userDepts.includes(deptIdNumber) && (
                    <Hint label="Update applicaiton category">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditingCategory(true);
                          setPrevCategory(categoryVal);
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
                    value={categoryVal}
                    onValueChange={(value) => setCategoryVal(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DepartmentCategoryMap[data.data.name.toLowerCase()]?.map(
                        (s, idx) => {
                          return (
                            <>
                              <SelectItem
                                value={s}
                                className="data-disabled:cursor-not-allowed data-disabled:opacity-50 capitalize"
                              >
                                {s}
                              </SelectItem>
                              {idx !==
                                DepartmentCategoryMap[data.data.name]?.length -
                                  1 && <Separator />}
                            </>
                          );
                        },
                      )}
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
                        setIsEditingCategory(false);
                        setCategoryVal(prevCategory);
                      }}
                      className="text-red-500"
                    >
                      <X />
                    </Button>
                  </Hint>
                </div>
              )}
            </div>
            {/* App Category Status*/}
            <div className="text-sm w-full flex items-center gap-2">
              <span>Category Status:</span>

              {!isEditingCategoryStatus ? (
                <>
                  <Badge variant="outline" className="capitalize">
                    {parseStatus(data.data.category_status ?? "-")}
                  </Badge>

                  {userDepts.includes(deptIdNumber) && (
                    <Hint label="Update applicaiton category status">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsEditingCategoryStatus(true);
                          setPrevCategoryStatus(categoryStatus);
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
                    value={categoryStatus}
                    onValueChange={(value) => setCategoryStatus(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {DepartmentCategoryStatusMap[
                        data.data.name.toLowerCase()
                      ]?.map((s, idx) => {
                        return (
                          <>
                            <SelectItem
                              value={s}
                              className="data-disabled:cursor-not-allowed data-disabled:opacity-50 capitalize"
                            >
                              {s}
                            </SelectItem>
                            {idx !==
                              DepartmentCategoryStatusMap[data.data.name]
                                ?.length -
                                1 && <Separator />}
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
                        setIsEditingCategoryStatus(false);
                        setCategoryStatus(prevCategoryStatus);
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
      <CardContent className="flex-1 px-4 overflow-auto">
        {isLoading ? (
          <div>
            <Loader className="animate-spin" />
            <p>Loading Comments...</p>
          </div>
        ) : error ? (
          <p>{"Error getting Department Comments"}</p>
        ) : data?.data ? (
          <ScrollArea className="min-h-0 px-4 h-full w-full">
            <CommentList
              appId={appId}
              deptId={deptIdNumber}
              commentsData={data.data.comments}
            />
          </ScrollArea>
        ) : (
          <p>Failed to get Department Comments</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentInfo;
