import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'

export function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login({ username, password })
      showToast('خوش برگشتید.', 'success')
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from !== '/login' ? from : '/')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="page page--narrow">
        <div className="container">
          <div className="card card--padded auth-card">
            <h1>ورود</h1>

            {error && <div className="alert alert--error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label" htmlFor="username">
                  نام کاربری
                </label>
                <input
                    id="username"
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="password">
                  رمز عبور
                </label>
                <input
                    id="password"
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />
              </div>
              <button className="btn btn--primary btn--block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ورود…' : 'ورود'}
              </button>
            </form>

            <div className="auth-card__footer">
              تازه اینجایید؟ <Link to="/register">ایجاد حساب کاربری</Link>
            </div>
          </div>
        </div>
      </div>
  )
}
