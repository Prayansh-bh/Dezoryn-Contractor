"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete permanently",
  cancelText = "Cancel",
  isDestructive = true,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={16} />
        </button>

        <div className="confirm-icon-wrap">
          {isDestructive ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>

        <div className="confirm-content">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>

        <div className="confirm-actions">
          <button type="button" className="btn-confirm-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            type="button"
            className={isDestructive ? "btn-confirm-danger" : "btn-confirm-primary"}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
