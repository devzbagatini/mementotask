'use client';

import type { Item, ItemCreate } from '@/lib/types';
import { TIPO_LABELS } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { ItemForm } from './ItemForm';
import { useMementotask } from '@/lib/context';

export function ItemFormModal() {
  const { modalState, closeModal, addItem, editItem } = useMementotask();

  if (!modalState.isOpen) return null;

  const { mode, item, tipo, parentId } = modalState;
  const resolvedTipo = item?.tipo ?? tipo ?? 'projeto';

  const title = mode === 'edit'
    ? `Editar ${TIPO_LABELS[resolvedTipo]}`
    : `${TIPO_LABELS[resolvedTipo] === 'Projeto' ? 'Novo' : 'Nova'} ${TIPO_LABELS[resolvedTipo]}`;

  function handleSubmit(data: ItemCreate | { id: string; changes: Partial<Item> }) {
    if ('id' in data) {
      editItem(data.id, data.changes);
    } else {
      addItem(data);
    }
    closeModal();
  }

  return (
    <Modal isOpen={modalState.isOpen} onClose={closeModal} title={title}>
      <ItemForm
        tipo={resolvedTipo}
        parentId={parentId}
        item={mode === 'edit' ? item : undefined}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </Modal>
  );
}
