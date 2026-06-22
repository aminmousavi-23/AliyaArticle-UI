import type { CommentDto } from '@/types/api'
import { formatRelativeTime } from '@/lib/format'

interface CommentListProps {
  comments: CommentDto[]
  canModerate: boolean
  onDelete: (id: string) => void
}

export function CommentList({ comments, canModerate, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="meta">هنوز دیدگاهی ثبت نشده است — اولین نفری باشید که دیدگاه خود را ثبت می‌کند.</p>
  }

  return (
      <ul className="comment-list">
        {comments.map((comment) => (
            <li key={comment.id} className="comment">
              <div className="comment__head">
                <span className="comment__author">{comment.authorName}</span>
                <div className="meta">
                  <span>{formatRelativeTime(comment.createdAt)}</span>
                  {canModerate && (
                      <button className="btn btn--danger btn--sm" onClick={() => onDelete(comment.id)}>
                        حذف
                      </button>
                  )}
                </div>
              </div>
              <p className="comment__body">{comment.content}</p>
            </li>
        ))}
      </ul>
  )
}