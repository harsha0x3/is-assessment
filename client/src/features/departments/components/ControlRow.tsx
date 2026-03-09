import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { useUpdateControlResultMutation } from "../store/departmentsApiSlice";
import { InlineLoader } from "@/components/loaders/InlineLoader";

interface Props {
  control: {
    id: number;
    name: string;
    status: string;
  };
  appId: string;
  deptId: number;
}

const ControlRow = ({ control, appId, deptId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(control.status);

  const [updateControl, { isLoading }] = useUpdateControlResultMutation();

  const handleSave = async () => {
    await updateControl({
      appId,
      controlId: control.id,
      status: value,
      deptId: deptId,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between border p-2 rounded">
      <p>{control.name}</p>

      {!isEditing ? (
        <div className="space-x-4">
          <Badge>{control.status}</Badge>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="pending_review">Pending Review</SelectItem>

              <SelectItem value="compliant">Compliant</SelectItem>

              <SelectItem value="remediation_required">
                Remediation Required
              </SelectItem>

              <SelectItem value="risk_accepted">Risk Accepted</SelectItem>

              <SelectItem value="not_applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>

          <Button size="icon" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <InlineLoader /> : <Save size={14} />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ControlRow;
