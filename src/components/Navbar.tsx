import { useState, type FormEvent } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    navigate(`/?${params.toString()}`)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
      <header className="nav">
        <div className="container nav__row">
          <NavLink to="/" className="nav__brand">
            <span className="nav__brand-mark" aria-hidden="true" />
            آلیا آرتیکل
          </NavLink>

          <nav className="nav__links">
            <NavLink to="/" end className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
              خانه
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
              دسته‌بندی‌ها
            </NavLink>
            <NavLink to="/tags" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
              برچسب‌ها
            </NavLink>
            {isAuthenticated && (
                <NavLink to="/my-articles" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
                  مقاله‌های من
                </NavLink>
            )}
          </nav>

          <form className="nav__search" onSubmit={handleSearch} role="search">
            <input
                className="input input--search"
                type="search"
                placeholder="جستجوی مقالات..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="جستجوی مقالات"
            />
          </form>

          <div className="nav__right">
            {isAuthenticated ? (
                <>
                  <NavLink to="/write" className="btn btn--accent btn--sm">
                    نوشتن
                  </NavLink>
                  <div className="nav__user">
                <span className="nav__avatar" aria-hidden="true">
                  {initials(user?.fullName || user?.username || '?')}
                </span>
                    <span>{user?.username}</span>
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                    خروج
                  </button>
                </>
            ) : (
                <>
                  <NavLink to="/login" className="btn btn--ghost btn--sm">
                    ورود
                  </NavLink>
                  <NavLink to="/register" className="btn btn--primary btn--sm">
                    ثبت‌نام
                  </NavLink>
                </>
            )}
          </div>
        </div>
      </header>
  )
}