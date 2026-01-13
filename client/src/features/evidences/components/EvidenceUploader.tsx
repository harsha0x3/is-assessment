import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { useAddAppEvidenceMutation } from "@/features/applications/store/applicationsApiSlice";

interface Props {
  appId: string;
}

const EvidenceUploader: React.FC<Props> = ({ appId }) => {
  const [files, setFiles] = useState<File[]>([]);
  // const [severity, setSeverity] = useState("medium");
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadEvidence, { isLoading }] = useAddAppEvidenceMutation();

  const onFilesAdded = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onFilesAdded(e.dataTransfer.files);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select files to upload");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("evidence_files", file));
    // formData.append("severity", severity);

    try {
      await uploadEvidence({ appId, payload: formData }).unwrap();
      toast.success("Evidence uploaded successfully");
      setFiles([]);
      setOpen(false);
    } catch {
      toast.error("Failed to upload evidences");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud />
          Upload Evidence
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Evidence</DialogTitle>
        </DialogHeader>

        {/* Drag & Drop */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => handleBoxClick()}
          className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary transition"
        >
          <UploadCloud className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag & drop files here, or click to browse
          </p>
          <Input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => onFilesAdded(e.target.files)}
          />
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <ScrollArea className="h-32 rounded-md border p-2">
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-sm border rounded-md"
                >
                  <span className="truncate px-2">{file.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFile(idx)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}

        {/* Severity */}
        {/* <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select> */}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceUploader;
