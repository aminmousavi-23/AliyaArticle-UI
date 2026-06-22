const SPINE_COUNT = 6

/** Picks one of the spine colors deterministically from an id/name, so the
 * same category always gets the same color without needing it stored anywhere. */
export function spineColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return `var(--spine-${hash % SPINE_COUNT})`
}
