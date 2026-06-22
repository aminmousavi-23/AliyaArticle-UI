import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

interface CommentFormProps {
    isSubmitting: boolean
    onSubmit: (values: { authorName: string; authorEmail: string; content: string }) => void
}

export function CommentForm({ isSubmitting, onSubmit }: CommentFormProps) {
    const { user } = useAuth()
    const [authorName, setAuthorName] = useState(user?.fullName || user?.username || '')
    const [authorEmail, setAuthorEmail] = useState(user?.email || '')
    const [content, setContent] = useState('')

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!authorName.trim() || !authorEmail.trim() || !content.trim()) return
        onSubmit({ authorName: authorName.trim(), authorEmail: authorEmail.trim(), content: content.trim() })
        setContent('')
    }

    return (
        <form className="comment-form" onSubmit={handleSubmit}>
            <div className="field">
                <label className="field__label" htmlFor="comment-name">
                    نام
                </label>
                <input
                    id="comment-name"
                    className="input"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                />
            </div>
            <div className="field">
                <label className="field__label" htmlFor="comment-email">
                    ایمیل
                </label>
                <input
                    id="comment-email"
                    className="input"
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    required
                />
            </div>
            <div className="field comment-form__content">
                <label className="field__label" htmlFor="comment-content">
                    دیدگاه
                </label>
                <textarea
                    id="comment-content"
                    className="textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="دیدگاه خود را بنویسید..."
                    required
                />
            </div>
            <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ارسال...' : 'ثبت دیدگاه'}
            </button>
        </form>
    )
}