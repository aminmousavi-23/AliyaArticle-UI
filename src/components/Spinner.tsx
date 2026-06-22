export function Spinner({ label = 'در حال بارگذاری...' }: { label?: string }) {
    return (
        <div className="spinner-row" role="status" aria-live="polite">
            <div className="spinner" />
            <span className="visually-hidden">{label}</span>
        </div>
    )
}