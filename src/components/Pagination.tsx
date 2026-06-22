interface PaginationProps {
    pageNumber: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
    onChange: (page: number) => void
}

export function Pagination({ pageNumber, totalPages, hasPreviousPage, hasNextPage, onChange }: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <nav className="pagination" aria-label="ناوبری صفحه">
            <button className="btn btn--ghost btn--sm" disabled={!hasPreviousPage} onClick={() => onChange(pageNumber - 1)}>
                قبلی →
            </button>
            <span className="pagination__status">
        صفحه {pageNumber} از {totalPages}
      </span>
            <button className="btn btn--ghost btn--sm" disabled={!hasNextPage} onClick={() => onChange(pageNumber + 1)}>
                ← بعدی
            </button>
        </nav>
    )
}