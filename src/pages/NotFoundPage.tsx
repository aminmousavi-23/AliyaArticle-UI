import { Link } from 'react-router-dom'

export function NotFoundPage() {
    return (
        <div className="page page--narrow">
            <div className="container" style={{ textAlign: 'center' }}>
                <h1>صفحه پیدا نشد</h1>
                <p>این صفحه وجود ندارد یا جابه‌جا شده است.</p>
                <Link className="btn btn--primary" to="/">
                    بازگشت به مقالات
                </Link>
            </div>
        </div>
    )
}