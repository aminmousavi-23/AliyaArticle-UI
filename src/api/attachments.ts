const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

/** GET /api/attachment/{id} serves the raw file — point an <img> straight at it. */
export function attachmentUrl(id: string | null | undefined): string {
  if (!id) return ''
  return `${baseURL}/api/attachment/${id}`
}
