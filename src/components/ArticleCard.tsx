import { Link } from 'react-router-dom'
import type { ArticleDto } from '@/types/api'
import { spineColor } from '@/lib/colors'
import { formatRelativeTime } from '@/lib/format'

export function ArticleCard({ article }: { article: ArticleDto }) {
  return (
      <article className="article-card">
        <div className="article-card__spine" style={{ background: spineColor(article.category.id) }} aria-hidden="true" />
        <div className="article-card__body">
          <span className="article-card__category">{article.category.name}</span>
          <h3 className="article-card__title">
            <Link to={`/article/${article.id}`}>{article.title}</Link>
          </h3>
          <p className="article-card__summary">{article.summary}</p>
          <div className="meta">
            {/*<span>{article.author.fullName || article.author.username}</span>*/}
            <span className="meta__dot" />
            <span>{formatRelativeTime(article.publishedAt ?? article.createdAt)}</span>
            {!article.isPublished && (
                <>
                  <span className="meta__dot" />
                  <span className="badge badge--draft">پیش‌نویس</span>
                </>
            )}
          </div>
          {/*{article.tags.length > 0 && (*/}
          {/*    <div className="article-card__tags">*/}
          {/*      {article.tags.slice(0, 4).map((tag) => (*/}
          {/*          <span key={tag.id} className="chip">*/}
          {/*      #{tag.name}*/}
          {/*    </span>*/}
          {/*      ))}*/}
          {/*    </div>*/}
          {/*)}*/}
        </div>
      </article>
  )
}