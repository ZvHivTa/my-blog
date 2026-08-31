export type OpenDotaPlayer = {
  account_id?: number
  personaname?: string | null
  name?: string | null
  hero_id?: number
  hero_variant?: number
  isRadiant?: boolean
  team_slot?: number
  lane?: number
  lane_role?: number
  rank_tier?: number
  level?: number
  kills?: number
  deaths?: number
  assists?: number
  last_hits?: number
  denies?: number
  gold_per_min?: number
  xp_per_min?: number
  net_worth?: number
  hero_damage?: number
  tower_damage?: number
  hero_healing?: number
  obs_placed?: number
  sen_placed?: number
  observer_kills?: number
  sentry_kills?: number
  buyback_count?: number
  rune_pickups?: number
  runes?: Record<string, number>
  item_0?: number
  item_1?: number
  item_2?: number
  item_3?: number
  item_4?: number
  item_5?: number
  backpack_0?: number
  backpack_1?: number
  backpack_2?: number
  item_neutral?: number
  item_neutral2?: number
  neutral_item_history?: OpenDotaNeutralItemHistoryEntry[]
  lane_efficiency_pct?: number
  actions_per_min?: number
  gold_t?: number[]
  xp_t?: number[]
  lh_t?: number[]
  dn_t?: number[]
  purchase_log?: OpenDotaLogEntry[]
  kills_log?: OpenDotaLogEntry[]
  buyback_log?: OpenDotaLogEntry[]
  obs_log?: OpenDotaLogEntry[]
  sen_log?: OpenDotaLogEntry[]
  runes_log?: OpenDotaLogEntry[]
  purchase_time?: Record<string, number>
  benchmarks?: Record<string, { raw?: number; pct?: number }>
}

export type OpenDotaLogEntry = {
  time?: number
  key?: string
}

export type OpenDotaNeutralItemHistoryEntry = {
  time?: number
  item_neutral?: string
  item_neutral_enhancement?: string
}

export type OpenDotaTeamfightPlayer = {
  deaths?: number
  buybacks?: number
  damage?: number
  healing?: number
  gold_delta?: number
  xp_delta?: number
}

export type OpenDotaTeamfight = {
  start?: number
  end?: number
  last_death?: number
  deaths?: number
  players?: OpenDotaTeamfightPlayer[]
}

export type OpenDotaObjective = {
  time?: number
  type?: string
  key?: string
  slot?: number
  player_slot?: number
  unit?: string
}

export type OpenDotaPickBan = {
  is_pick?: boolean
  hero_id?: number
  team?: number
  order?: number
}

export type OpenDotaMatch = {
  match_id?: number
  duration?: number
  start_time?: number
  radiant_win?: boolean
  radiant_score?: number
  dire_score?: number
  game_mode?: number
  lobby_type?: number
  region?: number
  cluster?: number
  patch?: number
  first_blood_time?: number
  comeback?: number
  stomp?: number
  replay_url?: string
  players?: OpenDotaPlayer[]
  teamfights?: OpenDotaTeamfight[]
  objectives?: OpenDotaObjective[]
  picks_bans?: OpenDotaPickBan[]
  radiant_gold_adv?: number[]
  radiant_xp_adv?: number[]
  od_data?: {
    has_api?: boolean
    has_gcdata?: boolean
    has_parsed?: boolean
    has_archive?: boolean
  }
}

export type DotaFetchParams = {
  matchId: string
  apiKey: string
}
