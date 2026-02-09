'use client';

import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="rounded-xl bg-priority-alta px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Excluir
        </button>
      </div>
    </Modal>
  );
}
