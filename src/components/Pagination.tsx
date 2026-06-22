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
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn--ghost btn--sm" disabled={!hasPreviousPage} onClick={() => onChange(pageNumber - 1)}>
        ← Previous
      </button>
      <span className="pagination__status">
        Page {pageNumber} of {totalPages}
      </span>
      <button className="btn btn--ghost btn--sm" disabled={!hasNextPage} onClick={() => onChange(pageNumber + 1)}>
        Next →
      </button>
    </nav>
  )
}
