// src\features\applications\components\NewAppDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import AppOverview from "./AppOverview";

const NewAppDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: () => void;
}> = ({ isOpen, onOpenChange }) => {
  const [open, setOpen] = useState<boolean>(isOpen);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        onOpenChange();
      }}
    >
      <DialogContent className="h-full overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center">New Application</DialogTitle>
        </DialogHeader>
        <AppOverview
          onNewAppSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewAppDialog;
