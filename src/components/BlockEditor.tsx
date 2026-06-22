import { useRef } from 'react'
import { BlockType } from '@/types/api'
import { type EditableBlock, newImageBlock, newTextBlock } from './editableBlock'
import { useToast } from '@/context/ToastContext'

interface BlockEditorProps {
  blocks: EditableBlock[]
  onChange: (blocks: EditableBlock[]) => void
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB — keep base64 payloads reasonable

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const { showToast } = useToast()

  function addBlock(block: EditableBlock) {
    onChange([...blocks, block])
  }

  function updateBlock(key: string, patch: Partial<EditableBlock>) {
    onChange(blocks.map((b) => (b.key === key ? { ...b, ...patch } : b)))
  }

  function removeBlock(key: string) {
    onChange(blocks.filter((b) => b.key !== key))
  }

  function moveBlock(key: string, direction: -1 | 1) {
    const index = blocks.findIndex((b) => b.key === key)
    const target = index + direction
    if (index === -1 || target < 0 || target >= blocks.length) return
    const next = [...blocks]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  function handleFile(key: string, file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('لطفاً یک فایل تصویری انتخاب کنید.', 'error')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast('حجم تصویر بیش از ۵ مگابایت است — لطفاً فایل کوچکتری انتخاب کنید.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateBlock(key, { base64File: reader.result as string, imageName: file.name })
    }
    reader.onerror = () => showToast('امکان خواندن تصویر وجود نداشت. لطفاً فایل دیگری را امتحان کنید.', 'error')
    reader.readAsDataURL(file)
  }

  return (
      <div className="block-list">
        {blocks.map((block, index) => (
            <BlockItem
                key={block.key}
                block={block}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
                onTextChange={(text) => updateBlock(block.key, { text })}
                onFile={(file) => handleFile(block.key, file)}
                onRemove={() => removeBlock(block.key)}
                onMoveUp={() => moveBlock(block.key, -1)}
                onMoveDown={() => moveBlock(block.key, 1)}
            />
        ))}

        <div className="add-block-row">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => addBlock(newTextBlock())}>
            + بلوک متنی
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => addBlock(newImageBlock())}>
            + بلوک تصویر
          </button>
        </div>
      </div>
  )
}

interface BlockItemProps {
  block: EditableBlock
  isFirst: boolean
  isLast: boolean
  onTextChange: (text: string) => void
  onFile: (file: File | undefined) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function BlockItem({ block, isFirst, isLast, onTextChange, onFile, onRemove, onMoveUp, onMoveDown }: BlockItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
      <div className="block">
        <div className="block__toolbar">
          <span className="block__kind">{block.type === BlockType.Text ? 'متن' : 'تصویر'}</span>
          <span className="block__spacer" />
          <button type="button" className="btn btn--ghost btn--icon" onClick={onMoveUp} disabled={isFirst} aria-label="انتقال بلوک به بالا">
            ↑
          </button>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onMoveDown} disabled={isLast} aria-label="انتقال بلوک به پایین">
            ↓
          </button>
          <button type="button" className="btn btn--danger btn--sm" onClick={onRemove}>
            حذف
          </button>
        </div>

        {block.type === BlockType.Text ? (
            <textarea
                className="block__text"
                placeholder="یک پاراگراف بنویسید..."
                value={block.text}
                onChange={(e) => onTextChange(e.target.value)}
            />
        ) : block.base64File ? (
            <div>
              <img className="block__image-preview" src={block.base64File} alt={block.imageName ?? 'تصویر بارگذاری‌شده'} />
              <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileInputRef.current?.click()}>
                  تغییر تصویر
                </button>
              </div>
            </div>
        ) : (
            <div className="block__image-drop" onClick={() => fileInputRef.current?.click()}>
              برای بارگذاری تصویر کلیک کنید
            </div>
        )}

        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
  )
}