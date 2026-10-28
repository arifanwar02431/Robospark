"use client";

import { Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui";

export function ConfirmDelete({
  open,
  title,
  description,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      icon={Trash2}
      iconColor="error"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} className="sm:flex-1" data-autofocus>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={pending} className="sm:flex-1">
            Hapus
          </Button>
        </>
      }
    />
  );
}
