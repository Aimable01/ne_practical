import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Card, CardHeader } from "./Card";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader title={title} subtitle={message} />
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={isDangerous ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <div className="flex gap-1 items-center">
              {isDangerous && <AlertTriangle className="w-4 h-4 mr-2" />}
              {confirmText}
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
