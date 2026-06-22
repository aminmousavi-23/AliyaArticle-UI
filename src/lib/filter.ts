import { FilterOperation, type FilterDto, type FilterItemDto } from '@/types/api'

/** Builds a flat, AND-combined FilterDto from a list of [field, op, value] triples, skipping empty values. */
export function buildFilter(
  items: Array<{ field: string; operation?: FilterOperation; value: unknown }>,
  options?: { orderBy?: string; isAscending?: boolean },
): FilterDto | undefined {
  const cleaned: FilterItemDto[] = items
    .filter((i) => i.value !== undefined && i.value !== null && i.value !== '')
    .map((i) => ({ field: i.field, operation: i.operation ?? FilterOperation.Equals, value: i.value }))

  if (cleaned.length === 0 && !options?.orderBy) return undefined

  return {
    items: cleaned,
    isAnd: true,
    orderBy: options?.orderBy ?? null,
    isAscending: options?.isAscending ?? false,
  }
}
