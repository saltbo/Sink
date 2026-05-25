import type { H3Event } from 'h3'
import { QuerySchema } from '#shared/schemas/query'

defineRouteMeta({
  openAPI: {
    security: [{ bearerAuth: [] }],
  },
})

const { select } = SqlBricks

function query2sql(query: Query, event: H3Event, ownerLinkIds: string[]): string {
  const filter = query2filter(query, ownerLinkIds)
  const { dataset } = useRuntimeConfig(event)
  // Weighted distinct count: COUNT(DISTINCT col) * SUM(_sample_interval) / COUNT() ≈ actual distinct count
  const weightedDistinct = (col: string) => `ROUND(COUNT(DISTINCT ${col}) * SUM(_sample_interval) / COUNT())`
  const columns = [
    query.id && 'index1 as id',
    'SUM(_sample_interval) as visits',
    `${weightedDistinct(logsMap.ip!)} as visitors`,
    `${weightedDistinct(logsMap.referer!)} as referers`,
  ].filter(Boolean).join(', ')
  const sql = select(columns).from(dataset).where(filter)
  if (query.id)
    sql.groupBy('index1')
  appendTimeFilter(sql, query)
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, QuerySchema.parse)
  const scopedQuery = await scopeAnalyticsQuery(event, query)
  const sql = query2sql(scopedQuery.query, event, scopedQuery.ownerLinkIds)
  return useWAE(event, sql)
})
