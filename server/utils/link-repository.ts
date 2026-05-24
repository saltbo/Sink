import type { Link } from '#shared/schemas/link'
import type { H3Event } from 'h3'
import { LinkSchema } from '#shared/schemas/link'

export const DEFAULT_LINK_OWNER_ID = 'site-token'

interface LinkRow {
  id: string
  owner_id: string
  slug: string
  url: string
  status: 'active' | 'deleted'
  comment: string | null
  expiration: number | null
  title: string | null
  description: string | null
  image: string | null
  apple: string | null
  google: string | null
  cloaking: number | null
  redirect_with_query: number | null
  password: string | null
  unsafe: number | null
  geo_json: string | null
  created_at: number
  updated_at: number
  deleted_at: number | null
}

interface ListOwnerLinksOptions {
  limit: number
  cursor?: string
}

interface ListOwnerLinksResult {
  links: Link[]
  list_complete: boolean
  cursor?: string
}

export interface SearchOwnerLinkResult {
  slug: string
  url: string
  comment?: string
}

function getDb(event: H3Event): D1Database {
  return event.context.cloudflare.env.DB
}

export function getCurrentLinkOwnerId(event: H3Event): string {
  return event.context.auth?.user.id ?? DEFAULT_LINK_OWNER_ID
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

async function retireExpiredLinkBySlug(event: H3Event, slug: string): Promise<void> {
  const now = nowInSeconds()
  await getDb(event)
    .prepare(`
      UPDATE links
      SET status = 'deleted', updated_at = ?, deleted_at = ?
      WHERE slug = ? AND status = 'active' AND deleted_at IS NULL AND expiration IS NOT NULL AND expiration <= ?
    `)
    .bind(now, now, slug, now)
    .run()
}

async function ensureLinkOwner(event: H3Event, ownerId: string): Promise<void> {
  const now = nowInSeconds()
  await getDb(event)
    .prepare(`
      INSERT INTO users (id, created_at, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at
    `)
    .bind(ownerId, now, now)
    .run()
}

function optional<T>(value: T | null): T | undefined {
  return value === null ? undefined : value
}

function optionalBoolean(value: number | null): boolean | undefined {
  return value === null ? undefined : Boolean(value)
}

function parseGeo(geoJson: string | null): Link['geo'] {
  if (geoJson === null)
    return undefined

  return JSON.parse(geoJson) as Link['geo']
}

function rowToLink(row: LinkRow): Link {
  return LinkSchema.parse({
    id: row.id,
    ownerId: row.owner_id,
    url: row.url,
    slug: row.slug,
    status: row.status,
    comment: optional(row.comment),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: optional(row.deleted_at),
    expiration: optional(row.expiration),
    title: optional(row.title),
    description: optional(row.description),
    image: optional(row.image),
    apple: optional(row.apple),
    google: optional(row.google),
    cloaking: optionalBoolean(row.cloaking),
    redirectWithQuery: optionalBoolean(row.redirect_with_query),
    password: optional(row.password),
    unsafe: optionalBoolean(row.unsafe),
    geo: parseGeo(row.geo_json),
  })
}

function parseListOffset(cursor?: string): number {
  if (!cursor)
    return 0

  const offset = Number.parseInt(cursor, 10)
  return Number.isFinite(offset) ? offset : 0
}

function linkBindValues(ownerId: string, link: Link): unknown[] {
  return [
    link.id,
    ownerId,
    link.slug,
    link.url,
    link.status,
    link.comment ?? null,
    link.expiration ?? null,
    link.title ?? null,
    link.description ?? null,
    link.image ?? null,
    link.apple ?? null,
    link.google ?? null,
    link.cloaking === undefined ? null : Number(link.cloaking),
    link.redirectWithQuery === undefined ? null : Number(link.redirectWithQuery),
    link.password ?? null,
    link.unsafe === undefined ? null : Number(link.unsafe),
    link.geo ? JSON.stringify(link.geo) : null,
    link.createdAt,
    link.updatedAt,
    link.deletedAt ?? null,
  ]
}

async function insertLink(event: H3Event, ownerId: string, link: Link): Promise<void> {
  await getDb(event)
    .prepare(`
      INSERT INTO links (
        id, owner_id, slug, url, status, comment, expiration, title, description,
        image, apple, google, cloaking, redirect_with_query, password, unsafe,
        geo_json, created_at, updated_at, deleted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(...linkBindValues(ownerId, link))
    .run()
}

export async function createOwnerLink(event: H3Event, ownerId: string, link: Link): Promise<Link> {
  const authoritativeLink = LinkSchema.parse({
    ...link,
    ownerId,
    status: 'active',
    deletedAt: undefined,
  })

  await ensureLinkOwner(event, ownerId)
  await insertLink(event, ownerId, authoritativeLink)
  await projectLinkToKv(event, authoritativeLink)

  return authoritativeLink
}

async function getStoredOwnerLink(event: H3Event, ownerId: string, slug: string): Promise<Link | null> {
  const row = await getDb(event)
    .prepare(`
      SELECT *
      FROM links
      WHERE owner_id = ? AND slug = ? AND status = 'active' AND deleted_at IS NULL AND (expiration IS NULL OR expiration > ?)
    `)
    .bind(ownerId, slug, nowInSeconds())
    .first<LinkRow>()

  return row ? rowToLink(row) : null
}

export async function getOwnerLink(event: H3Event, ownerId: string, slug: string): Promise<Link | null> {
  return await getStoredOwnerLink(event, ownerId, slug) ?? await migrateProjectedLinkToD1(event, ownerId, slug)
}

export async function getActiveLinkBySlug(event: H3Event, slug: string): Promise<Link | null> {
  const row = await getDb(event)
    .prepare(`
      SELECT *
      FROM links
      WHERE slug = ? AND status = 'active' AND deleted_at IS NULL AND (expiration IS NULL OR expiration > ?)
    `)
    .bind(slug, nowInSeconds())
    .first<LinkRow>()

  return row ? rowToLink(row) : null
}

export async function activeSlugExists(event: H3Event, slug: string): Promise<boolean> {
  await retireExpiredLinkBySlug(event, slug)

  const row = await getDb(event)
    .prepare(`
      SELECT id
      FROM links
      WHERE slug = ? AND status = 'active' AND deleted_at IS NULL
    `)
    .bind(slug)
    .first<{ id: string }>()

  return row !== null
}

export async function migrateProjectedLinkToD1(event: H3Event, ownerId: string, slug: string): Promise<Link | null> {
  await retireExpiredLinkBySlug(event, slug)

  const existingLink = await getStoredOwnerLink(event, ownerId, slug)
  if (existingLink)
    return existingLink

  if (await activeSlugExists(event, slug))
    return null

  const projectedLink = await getProjectedLink(event, slug)
  if (!projectedLink)
    return null

  const authoritativeLink = LinkSchema.parse({
    ...projectedLink,
    ownerId,
    slug,
    status: 'active',
    deletedAt: undefined,
  })

  await ensureLinkOwner(event, ownerId)
  await insertLink(event, ownerId, authoritativeLink)
  return authoritativeLink
}

export async function updateOwnerLink(event: H3Event, ownerId: string, link: Link): Promise<Link> {
  const authoritativeLink = LinkSchema.parse({
    ...link,
    ownerId,
    status: 'active',
    deletedAt: undefined,
  })

  await getDb(event)
    .prepare(`
      UPDATE links
      SET
        url = ?,
        status = ?,
        comment = ?,
        expiration = ?,
        title = ?,
        description = ?,
        image = ?,
        apple = ?,
        google = ?,
        cloaking = ?,
        redirect_with_query = ?,
        password = ?,
        unsafe = ?,
        geo_json = ?,
        updated_at = ?,
        deleted_at = ?
      WHERE owner_id = ? AND slug = ? AND status = 'active' AND deleted_at IS NULL
    `)
    .bind(
      authoritativeLink.url,
      authoritativeLink.status,
      authoritativeLink.comment ?? null,
      authoritativeLink.expiration ?? null,
      authoritativeLink.title ?? null,
      authoritativeLink.description ?? null,
      authoritativeLink.image ?? null,
      authoritativeLink.apple ?? null,
      authoritativeLink.google ?? null,
      authoritativeLink.cloaking === undefined ? null : Number(authoritativeLink.cloaking),
      authoritativeLink.redirectWithQuery === undefined ? null : Number(authoritativeLink.redirectWithQuery),
      authoritativeLink.password ?? null,
      authoritativeLink.unsafe === undefined ? null : Number(authoritativeLink.unsafe),
      authoritativeLink.geo ? JSON.stringify(authoritativeLink.geo) : null,
      authoritativeLink.updatedAt,
      authoritativeLink.deletedAt ?? null,
      ownerId,
      authoritativeLink.slug,
    )
    .run()

  await projectLinkToKv(event, authoritativeLink)
  return authoritativeLink
}

export async function deleteOwnerLink(event: H3Event, ownerId: string, slug: string): Promise<void> {
  const now = nowInSeconds()
  await getDb(event)
    .prepare(`
      UPDATE links
      SET status = 'deleted', updated_at = ?, deleted_at = ?
      WHERE owner_id = ? AND slug = ? AND status = 'active' AND deleted_at IS NULL
    `)
    .bind(now, now, ownerId, slug)
    .run()

  await deleteKvProjection(event, slug)
}

function bindInValues(values: string[]): string {
  return values.map(() => '?').join(', ')
}

export async function listOwnerActiveLinkIds(event: H3Event, ownerId: string): Promise<string[]> {
  const result = await getDb(event)
    .prepare(`
      SELECT id
      FROM links
      WHERE owner_id = ? AND status = 'active' AND deleted_at IS NULL AND (expiration IS NULL OR expiration > ?)
      ORDER BY updated_at DESC, id DESC
    `)
    .bind(ownerId, nowInSeconds())
    .all<{ id: string }>()

  return (result.results ?? []).map(link => link.id)
}

export async function listOwnerActiveLinkIdsByIds(event: H3Event, ownerId: string, ids: string[]): Promise<string[]> {
  if (ids.length === 0)
    return []

  const result = await getDb(event)
    .prepare(`
      SELECT id
      FROM links
      WHERE owner_id = ? AND id IN (${bindInValues(ids)}) AND status = 'active' AND deleted_at IS NULL AND (expiration IS NULL OR expiration > ?)
    `)
    .bind(ownerId, ...ids, nowInSeconds())
    .all<{ id: string }>()

  return (result.results ?? []).map(link => link.id)
}

export async function listOwnerLinks(event: H3Event, ownerId: string, options: ListOwnerLinksOptions): Promise<ListOwnerLinksResult> {
  const offset = parseListOffset(options.cursor)
  const now = nowInSeconds()
  const result = await getDb(event)
    .prepare(`
      SELECT *
      FROM links
      WHERE owner_id = ? AND status = 'active' AND deleted_at IS NULL AND (expiration IS NULL OR expiration > ?)
      ORDER BY updated_at DESC, id DESC
      LIMIT ? OFFSET ?
    `)
    .bind(ownerId, now, options.limit + 1, offset)
    .all<LinkRow>()

  const rows = result.results ?? []
  const visibleRows = rows.slice(0, options.limit)
  const hasMore = rows.length > options.limit

  return {
    links: visibleRows.map(rowToLink),
    list_complete: !hasMore,
    cursor: hasMore ? String(offset + options.limit) : undefined,
  }
}

export async function searchOwnerLinks(event: H3Event, ownerId: string): Promise<SearchOwnerLinkResult[]> {
  const result = await getDb(event)
    .prepare(`
      SELECT slug, url, comment
      FROM links
      WHERE owner_id = ? AND status = 'active' AND deleted_at IS NULL AND (expiration IS NULL OR expiration > ?)
      ORDER BY updated_at DESC, id DESC
    `)
    .bind(ownerId, nowInSeconds())
    .all<{ slug: string, url: string, comment: string | null }>()

  return (result.results ?? []).map(link => ({
    slug: link.slug,
    url: withoutQuery(link.url),
    comment: link.comment ?? undefined,
  }))
}
