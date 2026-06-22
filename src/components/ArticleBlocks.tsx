import { attachmentUrl } from '@/api/attachments'
import { BlockType, type ArticleBlockDto } from '@/types/api'

export function ArticleBlocks({ blocks }: { blocks: ArticleBlockDto[] }) {
  const ordered = [...blocks].sort((a, b) => a.order - b.order)

  return (
      <div className="article-body">
        {ordered.map((block) =>
            block.type === BlockType.Image ? (
                <figure key={block.id}>
                  <img src={attachmentUrl(block.attachmentId)} alt={block.text ?? ''} loading="lazy" />
                  {block.text && <figcaption>{block.text}</figcaption>}
                </figure>
            ) : (
                <p key={block.id}>{block.text}</p>
            ),
        )}
      </div>
  )
}