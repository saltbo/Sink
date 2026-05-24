import type { Query } from '#shared/schemas/query'
import type { H3Event } from 'h3'
import type { SelectStatement } from 'sql-bricks'
import type { BlobsKey } from './access-log'

const { in: $in, and } = SqlBricks

export type { Query }

interface ScopedAnalyticsQuery<T extends Query> {
  query: T
  ownerLinkIds: string[]
}

function splitQueryValues(value?: string): string[] {
  return [...new Set(value?.split(',').map(item => item.trim()).filter(Boolean) ?? [])]
}

export async function scopeAnalyticsQuery<T extends Query>(event: H3Event, query: T): Promise<ScopedAnalyticsQuery<T>> {
  const ownerId = getCurrentLinkOwnerId(event)
  const ids = splitQueryValues(query.id)
  const slugs = [...new Set(splitQueryValues(query.slug).map(slug => normalizeSlug(event, slug)))]

  if (ids.length > 0) {
    const ownerIds = await listOwnerActiveLinkIdsByIds(event, ownerId, ids)
    if (ownerIds.length !== ids.length) {
      throw createError({
        status: 404,
        statusText: 'Link not found',
      })
    }
  }

  if (slugs.length > 0) {
    const ownerLinks = await Promise.all(slugs.map(slug => getOwnerLink(event, ownerId, slug)))
    if (ownerLinks.includes(null)) {
      throw createError({
        status: 404,
        statusText: 'Link not found',
      })
    }

    return {
      query: { ...query, slug: slugs.join(',') } as T,
      ownerLinkIds: ids.length > 0 ? ids : ownerLinks.map(link => link!.id),
    }
  }

  return {
    query,
    ownerLinkIds: ids.length > 0 ? ids : await listOwnerActiveLinkIds(event, ownerId),
  }
}

export function query2filter(query: Query, ownerLinkIds?: string[]) {
  const filter = []
  if (ownerLinkIds) {
    filter.push(ownerLinkIds.length > 0 ? $in('index1', ownerLinkIds) : SqlBricks('0 = 1'))
  }

  if (!ownerLinkIds && query.id)
    filter.push($in('index1', query.id.split(',').filter(Boolean)))

  const blobKeys = Object.keys(blobsMap) as BlobsKey[]
  for (const blobKey of blobKeys) {
    const queryKey = blobsMap[blobKey] as keyof Query
    const value = query[queryKey]
    if (typeof value === 'string' && value) {
      filter.push($in(blobKey, value.split(',')))
    }
  }

  return filter.length ? and(...filter) : []
}

export function appendTimeFilter(sql: SelectStatement, query: Query): SelectStatement {
  if (query.startAt) {
    const startTimestamp = Math.floor(Number(query.startAt))
    sql.where(SqlBricks.gte('timestamp', SqlBricks(`toDateTime(${startTimestamp})`)))
  }

  if (query.endAt) {
    const endTimestamp = Math.floor(Number(query.endAt))
    sql.where(SqlBricks.lte('timestamp', SqlBricks(`toDateTime(${endTimestamp})`)))
  }

  return sql
}
