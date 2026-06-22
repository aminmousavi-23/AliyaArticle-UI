import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { articleApi } from '@/api/articles'
import { categoryApi } from '@/api/categories'
import { tagApi } from '@/api/tags'
import { BlockEditor } from '@/components/BlockEditor'
import { type EditableBlock, newTextBlock } from '@/components/editableBlock'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { BlockType, type CategoryDto, type CreateArticleBlockDto, type TagDto } from '@/types/api'

export function WriteArticlePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [blocks, setBlocks] = useState<EditableBlock[]>([newTextBlock()])

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [tags, setTags] = useState<TagDto[]>([])
  const [isSaving, setIsSaving] = useState<'draft' | 'publish' | null>(null)

  useEffect(() => {
    categoryApi
        .search({ pageNumber: 1, pageSize: 100 })
        .then((r) => setCategories(r.data ?? []))
        .catch(() => setCategories([]))
    tagApi
        .search({ pageNumber: 1, pageSize: 100 })
        .then((r) => setTags(r.data ?? []))
        .catch(() => setTags([]))
  }, [])

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function validate(): string | null {
    if (!title.trim()) return 'عنوان مقاله را وارد کنید.'
    if (!summary.trim()) return 'یک خلاصه کوتاه اضافه کنید.'
    if (!categoryId) return 'یک دسته‌بندی انتخاب کنید.'
    const hasContent = blocks.some(
        (b) => (b.type === BlockType.Text && b.text.trim()) || (b.type === BlockType.Image && b.base64File),
    )
    if (!hasContent) return 'حداقل یک بلوک محتوا اضافه کنید.'
    return null
  }

  async function handleSave(publishAfter: boolean) {
    const validationError = validate()
    if (validationError) {
      showToast(validationError, 'error')
      return
    }

    setIsSaving(publishAfter ? 'publish' : 'draft')
    try {
      const payloadBlocks: CreateArticleBlockDto[] = blocks
          .filter((b) => (b.type === BlockType.Text && b.text.trim()) || (b.type === BlockType.Image && b.base64File))
          .map((b, index) => ({
            type: b.type,
            text: b.type === BlockType.Text ? b.text.trim() : b.text.trim() || null,
            base64File: b.type === BlockType.Image ? b.base64File : null,
            order: index,
          }))

      const newId = await articleApi.create({
        title: title.trim(),
        summary: summary.trim(),
        categoryId,
        tagIds: selectedTagIds,
        blocks: payloadBlocks,
      })

      if (publishAfter && newId) {
        await articleApi.publish(newId)
      }

      showToast(publishAfter ? 'مقاله منتشر شد.' : 'پیش‌نویس ذخیره شد.', 'success')
      navigate(newId ? `/article/${newId}` : '/my-articles')
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setIsSaving(null)
    }
  }

  return (
      <div className="page">
        <div className="container">
          <div className="editor-layout">
            <div>
              <input
                  className="editor-title-input"
                  placeholder="عنوان مقاله"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                  className="editor-summary-input"
                  placeholder="یک یا دو جمله که مقاله را خلاصه می‌کند..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
              />
              <hr className="editor-divider" />
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </div>

            <aside className="editor-sidebar">
              <div className="card card--padded">
                <div className="field">
                  <label className="field__label" htmlFor="category">
                    دسته‌بندی
                  </label>
                  <select id="category" className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">انتخاب کنید...</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                    ))}
                  </select>
                  <span className="field__hint">
                  دسته‌بندی مناسب را پیدا نمی‌کنید؟ <a href="/categories">مدیریت دسته‌بندی‌ها</a>.
                </span>
                </div>

                <div className="field">
                  <span className="field__label">برچسب‌ها</span>
                  <div className="tag-picker">
                    {tags.length === 0 && <span className="field__hint">هنوز برچسبی وجود ندارد.</span>}
                    {tags.map((t) => (
                        <button
                            type="button"
                            key={t.id}
                            className={`chip chip--button${selectedTagIds.includes(t.id) ? ' chip--selected' : ''}`}
                            onClick={() => toggleTag(t.id)}
                        >
                          #{t.name}
                        </button>
                    ))}
                  </div>
                  <span className="field__hint">
                  برچسب جدید نیاز دارید؟ <a href="/tags">مدیریت برچسب‌ها</a>.
                </span>
                </div>

                <button className="btn btn--ghost btn--block" onClick={() => handleSave(false)} disabled={isSaving !== null}>
                  {isSaving === 'draft' ? 'در حال ذخیره…' : 'ذخیره به عنوان پیش‌نویس'}
                </button>
                <button className="btn btn--accent btn--block" onClick={() => handleSave(true)} disabled={isSaving !== null}>
                  {isSaving === 'publish' ? 'در حال انتشار…' : 'انتشار'}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
  )
}