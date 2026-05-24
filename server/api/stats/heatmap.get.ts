import type { H3Event } from 'h3'
import { QuerySchema } from '#shared/schemas/query'
import { z } from 'zod'

const { select } = SqlBricks

const HeatmapQuerySchema = QuerySchema.extend({
  clientTimezone: z.string()
    .regex(/^[\w+-]+(?:\/[\w+-]+)*$/)
    .max(64)
    .default('Etc/UTC'),
})

function query2sql(query: z.infer<typeof HeatmapQuerySchema>, event: H3Event, ownerLinkIds: string[]): string {
  const filter = query2filter(query, ownerLinkIds)
  const { dataset } = useRuntimeConfig(event)
  const timezone = getSafeTimezone(query.clientTimezone)
  const tzTimestamp = `toDateTime(toUnixTimestamp(timestamp), '${timezone}')`
  const sql = select(`toDayOfWeek(${tzTimestamp}) as weekday, toHour(${tzTimestamp}) as hour, SUM(_sample_interval) as visits, COUNT(DISTINCT ${logsMap.ip}) as visitors`).from(dataset).where(filter).groupBy('weekday', 'hour').orderBy('weekday', 'hour')
  appendTimeFilter(sql, query)
  return sql.toString()
}

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, HeatmapQuerySchema.parse)
  const scopedQuery = await scopeAnalyticsQuery(event, query)
  const sql = query2sql(scopedQuery.query, event, scopedQuery.ownerLinkIds)
  return useWAE(event, sql)
})
