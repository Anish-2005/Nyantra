'use client';

import type { LucideIcon } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog. New flows should prefer this over window.confirm;
 * existing alert/confirm call sites are migrated deliberately to keep
 * behaviour identical during the refactor.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  icon: Icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold theme-text-primary">{title}</h3>
            {message && <p className="text-sm theme-text-muted mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
