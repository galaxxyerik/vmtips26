#!/usr/bin/env tsx
// Seed Supabase player_stats table from static data/player-stats.ts.
// Run: npx tsx scripts/seed-player-stats.ts
//
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// (copy from .env.local)

import { createClient } from '@supabase/supabase-js'
import { STATS_LIST } from '../data/player-stats'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

const SEASON = 2025

async function main() {
  console.log(`Seeding ${STATS_LIST.length} player stats for season ${SEASON}…`)

  const rows = STATS_LIST.map(s => ({ ...s, season: SEASON }))

  const { error, count } = await supabase
    .from('player_stats')
    .upsert(rows, { onConflict: 'player_name,season', count: 'exact' })

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`Done — ${count ?? rows.length} rows upserted.`)
}

main()
