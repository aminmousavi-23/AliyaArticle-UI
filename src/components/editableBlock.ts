import {BlockType_Enum} from "@/enums/BlockType_Enum.ts";


/** Local editor representation of a block — a `key` is added for React lists
 * and stable identity since the API only assigns real ids after creation. */
export interface EditableBlock {
  key: string
  type: BlockType_Enum
  text: string
  base64File: string | null
  imageName: string | null
  contentType?: string
}

export function newTextBlock(): EditableBlock {
  return { key: crypto.randomUUID(), type: BlockType_Enum.Paragraph, text: '', base64File: null, imageName: null }
}

export function newImageBlock(): EditableBlock {
  return { key: crypto.randomUUID(), type: BlockType_Enum.Attachment, text: '', base64File: null, imageName: null }
}
