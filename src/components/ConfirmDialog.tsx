interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  isBusy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
                                title,
                                description,
                                confirmLabel = 'حذف',
                                isBusy = false,
                                onConfirm,
                                onCancel,
                              }: ConfirmDialogProps) {
  return (
      <div className="dialog-backdrop" onClick={onCancel}>
        <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
          <h3 id="confirm-title">{title}</h3>
          <p>{description}</p>
          <div className="dialog__actions">
            <button className="btn btn--ghost btn--sm" onClick={onCancel} disabled={isBusy}>
              لغو
            </button>
            <button className="btn btn--danger btn--sm" onClick={onConfirm} disabled={isBusy}>
              {isBusy ? 'در حال انجام...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
  )
}