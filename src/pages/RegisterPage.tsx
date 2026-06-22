import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'

export function RegisterPage() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('رمزهای عبور با هم مطابقت ندارند.')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ ...form, email: form.email || null })
      showToast('حساب کاربری ایجاد شد. به Marginalia خوش آمدید.', 'success')
      navigate('/')
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
            <h1>ایجاد حساب کاربری</h1>
            <p className="auth-card__sub">به Marginalia بپیوندید تا مقاله بنویسید و منتشر کنید.</p>

            {error && <div className="alert alert--error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-row">
                <div className="field">
                  <label className="field__label" htmlFor="fullName">
                    نام و نام خانوادگی
                  </label>
                  <input
                      id="fullName"
                      className="input"
                      value={form.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      autoComplete="name"
                      required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="username">
                    نام کاربری
                  </label>
                  <input
                      id="username"
                      className="input"
                      value={form.username}
                      onChange={(e) => update('username', e.target.value)}
                      autoComplete="username"
                      required
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field__label" htmlFor="email">
                    ایمیل
                  </label>
                  <input
                      id="email"
                      className="input"
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      autoComplete="email"
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="phoneNumber">
                    شماره تلفن
                  </label>
                  <input
                      id="phoneNumber"
                      className="input"
                      value={form.phoneNumber}
                      onChange={(e) => update('phoneNumber', e.target.value)}
                      autoComplete="tel"
                      required
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field__label" htmlFor="password">
                    رمز عبور
                  </label>
                  <input
                      id="password"
                      className="input"
                      type="password"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      autoComplete="new-password"
                      required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="confirmPassword">
                    تکرار رمز عبور
                  </label>
                  <input
                      id="confirmPassword"
                      className="input"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      required
                  />
                </div>
              </div>

              <button className="btn btn--primary btn--block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ایجاد حساب…' : 'ایجاد حساب'}
              </button>
            </form>

            <div className="auth-card__footer">
              قبلاً حساب دارید؟ <Link to="/login">وارد شوید</Link>
            </div>
          </div>
        </div>
      </div>
  )
}