export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner-row" role="status" aria-live="polite">
      <div className="spinner" />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}
