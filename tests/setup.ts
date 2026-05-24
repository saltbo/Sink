import { applyD1Migrations, env } from 'cloudflare:test'
import { beforeAll } from 'vitest'
import linkOwnershipMigration from '../migrations/0001_link_ownership.sql?raw'
import activeSlugUniqueIndexMigration from '../migrations/0002_active_slug_unique_index.sql?raw'
import linkCreateCountersMigration from '../migrations/0003_link_create_counters.sql?raw'

beforeAll(async () => {
  await applyD1Migrations(env.DB, [
    {
      name: '0001_link_ownership.sql',
      queries: linkOwnershipMigration
        .split(';')
        .map(query => query.trim())
        .filter(Boolean),
    },
    {
      name: '0002_active_slug_unique_index.sql',
      queries: activeSlugUniqueIndexMigration
        .split(';')
        .map(query => query.trim())
        .filter(Boolean),
    },
    {
      name: '0003_link_create_counters.sql',
      queries: linkCreateCountersMigration
        .split(';')
        .map(query => query.trim())
        .filter(Boolean),
    },
  ])
})
