import { BlockType, type BlockType as BlockTypeT } from '@/types/api'

/** Local editor representation of a block — a `key` is added for React lists
 * and stable identity since the API only assigns real ids after creation. */
export interface EditableBlock {
  key: string
  type: BlockTypeT
  text: string
  base64File: string | null
  imageName: string | null
}

export function newTextBlock(): EditableBlock {
  return { key: crypto.randomUUID(), type: BlockType.Text, text: '', base64File: null, imageName: null }
}

export function newImageBlock(): EditableBlock {
  return { key: crypto.randomUUID(), type: BlockType.Image, text: '', base64File: null, imageName: null }
}
