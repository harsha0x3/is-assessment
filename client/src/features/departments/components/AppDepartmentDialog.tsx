import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import DepartmentInfo from "./DepartmentInfo";

export type AppDeptData = {
  deptId: number;
  appId: string;
  appName: string;
  deptName: string;
};

type AppDepartmentDialogProps = {
  data: AppDeptData;
  isOpen: boolean;
  onOpenChange: () => void;
};

const AppDepartmentDialog: React.FC<AppDepartmentDialogProps> = ({
  data,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onOpenChange()}>
      <DialogContent className="max-w-1/3">
        <DialogHeader>
          <DialogTitle className="text-center">{data.appName}</DialogTitle>
        </DialogHeader>
        <div>
          <DepartmentInfo appId={data.appId} deptId={data.deptId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppDepartmentDialog;
