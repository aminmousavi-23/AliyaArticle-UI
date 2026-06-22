import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page page--narrow">
      <div className="container" style={{ textAlign: 'center' }}>
        <h1>Page not found</h1>
        <p>That page doesn't exist, or has moved.</p>
        <Link className="btn btn--primary" to="/">
          Back to articles
        </Link>
      </div>
    </div>
  )
}
