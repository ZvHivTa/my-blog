import { xp_level as xpLevels } from 'dotaconstants'

import type { OpenDotaLogEntry, OpenDotaMatch, OpenDotaPlayer } from './types'

export type PlayerSnapshot = {
  timeIndex: number
  seconds: number
  gold: number | null
  xp: number | null
  lastHits: number | null
  denies: number | null
  approximateGpm: number | null
  approximateXpm: number | null
  level: number | null
  kills: number
  buybacks: number
  observerWards: number
  sentryWards: number
  runes: number
  inventoryItems: string[]
  utilityPurchases: SupportUtilityPurchases
  upgrades: PlayerUpgradeFlags
}

export type SupportUtilityPurchases = {
  observerWards: number
  sentryWards: number
  dust: number
  smoke: number
}

export type PlayerUpgradeFlags = {
  shard: boolean
  scepter: boolean
  blessing: boolean
}

type SeriesKey = 'gold_t' | 'xp_t' | 'lh_t' | 'dn_t'

const xpByLevel = xpLevels as unknown as number[]

export function getMatchTimeline(match: OpenDotaMatch) {
  const sampleCount = getMaxSampleCount(match.players ?? [])
  const duration = Math.max(0, match.duration ?? 0)

  if (sampleCount <= 1) {
    return {
      sampleCount: Math.max(sampleCount, 1),
      duration,
      intervalSeconds: duration,
      maxIndex: 0,
    }
  }

  return {
    sampleCount,
    duration,
    intervalSeconds: duration / (sampleCount - 1),
    maxIndex: sampleCount - 1,
  }
}

export function getSnapshotSeconds(match: OpenDotaMatch, timeIndex: number) {
  const timeline = getMatchTimeline(match)
  if (timeline.maxIndex === 0) return 0
  if (timeIndex >= timeline.maxIndex) return timeline.duration
  return Math.round(timeIndex * timeline.intervalSeconds)
}

export function getNearestTimeIndex(match: OpenDotaMatch, seconds: number) {
  const timeline = getMatchTimeline(match)
  if (timeline.maxIndex === 0 || timeline.intervalSeconds <= 0) return 0
  return clampIndex(
    Math.round(seconds / timeline.intervalSeconds),
    timeline.maxIndex,
  )
}

export function buildPlayerSnapshot(
  player: OpenDotaPlayer,
  match: OpenDotaMatch,
  timeIndex: number,
): PlayerSnapshot {
  const timeline = getMatchTimeline(match)
  const safeIndex = clampIndex(timeIndex, timeline.maxIndex)
  const seconds = getSnapshotSeconds(match, safeIndex)
  const gold = getSeriesValue(player, 'gold_t', safeIndex)
  const xp = getSeriesValue(player, 'xp_t', safeIndex)

  return {
    timeIndex: safeIndex,
    seconds,
    gold,
    xp,
    lastHits: getSeriesValue(player, 'lh_t', safeIndex),
    denies: getSeriesValue(player, 'dn_t', safeIndex),
    approximateGpm: getRatePerMinute(gold, seconds),
    approximateXpm: getRatePerMinute(xp, seconds),
    level: getLevelFromXp(xp),
    kills: countLogsBefore(player.kills_log, seconds),
    buybacks: countLogsBefore(player.buyback_log, seconds),
    observerWards: countLogsBefore(player.obs_log, seconds),
    sentryWards: countLogsBefore(player.sen_log, seconds),
    runes: countLogsBefore(player.runes_log, seconds),
    inventoryItems: getInventoryItemsBefore(player.purchase_log, seconds),
    utilityPurchases: getSupportUtilityPurchases(player.purchase_log, seconds),
    upgrades: getUpgradeFlags(player.purchase_log, seconds),
  }
}

export function getSupportUtilityTotal(
  utilityPurchases: SupportUtilityPurchases,
) {
  return (
    utilityPurchases.observerWards +
    utilityPurchases.sentryWards +
    utilityPurchases.dust +
    utilityPurchases.smoke
  )
}

function getMaxSampleCount(players: OpenDotaPlayer[]) {
  return players.reduce((max, player) => {
    return Math.max(
      max,
      player.gold_t?.length ?? 0,
      player.xp_t?.length ?? 0,
      player.lh_t?.length ?? 0,
      player.dn_t?.length ?? 0,
    )
  }, 0)
}

function getSeriesValue(
  player: OpenDotaPlayer,
  seriesKey: SeriesKey,
  timeIndex: number,
) {
  const series = player[seriesKey]
  if (!series?.length) return null
  return series[Math.min(timeIndex, series.length - 1)] ?? null
}

function getRatePerMinute(value: number | null, seconds: number) {
  if (value === null) return null
  if (seconds <= 0) return 0
  return Math.round((value / seconds) * 60)
}

function countLogsBefore(
  logs: OpenDotaLogEntry[] | undefined,
  seconds: number,
) {
  return (logs ?? []).filter(
    (entry) => (entry.time ?? Number.POSITIVE_INFINITY) <= seconds,
  ).length
}

function getInventoryItemsBefore(
  logs: OpenDotaLogEntry[] | undefined,
  seconds: number,
) {
  return (logs ?? [])
    .filter((entry) => (entry.time ?? Number.POSITIVE_INFINITY) <= seconds)
    .map((entry) => entry.key)
    .filter((key): key is string => Boolean(key))
    .filter((key) => !IGNORED_INVENTORY_PURCHASES.has(key))
    .slice(-6)
}

export function getSupportUtilityPurchases(
  logs: OpenDotaLogEntry[] | undefined,
  seconds: number,
): SupportUtilityPurchases {
  return (logs ?? [])
    .filter((entry) => (entry.time ?? Number.POSITIVE_INFINITY) <= seconds)
    .reduce<SupportUtilityPurchases>(
      (summary, entry) => {
        switch (entry.key) {
          case 'ward_observer':
          case 'ward_dispenser':
            summary.observerWards += 1
            break
          case 'ward_sentry':
            summary.sentryWards += 1
            break
          case 'dust':
            summary.dust += 1
            break
          case 'smoke_of_deceit':
            summary.smoke += 1
            break
        }

        return summary
      },
      {
        observerWards: 0,
        sentryWards: 0,
        dust: 0,
        smoke: 0,
      },
    )
}

export function getUpgradeFlags(
  logs: OpenDotaLogEntry[] | undefined,
  seconds: number,
): PlayerUpgradeFlags {
  const purchasedKeys = new Set(
    (logs ?? [])
      .filter((entry) => (entry.time ?? Number.POSITIVE_INFINITY) <= seconds)
      .map((entry) => entry.key)
      .filter((key): key is string => Boolean(key)),
  )

  return {
    shard: purchasedKeys.has('aghanims_shard'),
    scepter: purchasedKeys.has('ultimate_scepter'),
    blessing: purchasedKeys.has('ultimate_scepter_2'),
  }
}

function getLevelFromXp(xp: number | null) {
  if (xp === null) return null
  let level = 1

  for (let index = 1; index < xpByLevel.length; index += 1) {
    const requiredXp = xpByLevel[index]
    if (typeof requiredXp !== 'number' || xp < requiredXp) break
    level = index + 1
  }

  return level
}

function clampIndex(index: number, maxIndex: number) {
  return Math.min(Math.max(index, 0), Math.max(maxIndex, 0))
}

const IGNORED_INVENTORY_PURCHASES = new Set([
  'ward_observer',
  'ward_sentry',
  'ward_dispenser',
  'dust',
  'smoke_of_deceit',
  'tango',
  'tango_single',
  'flask',
  'clarity',
  'enchanted_mango',
  'blood_grenade',
  'faerie_fire',
  'infused_raindrop',
  'tpscroll',
  'aghanims_shard',
  'ultimate_scepter',
  'ultimate_scepter_2',
])
