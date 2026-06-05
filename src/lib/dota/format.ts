import { getHeroName } from './constants'
import type { OpenDotaMatch, OpenDotaPlayer } from './types'

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds < 0) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatClock(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '--:--'
  const sign = seconds < 0 ? '-' : ''
  return `${sign}${formatDuration(Math.abs(seconds))}`
}

export function formatNumber(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-'
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function formatPercent(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-'
  return `${Math.round(value)}%`
}

export function getWinner(
  match: OpenDotaMatch,
): 'Radiant' | 'Dire' | 'Unknown' {
  if (match.radiant_win === true) return 'Radiant'
  if (match.radiant_win === false) return 'Dire'
  return 'Unknown'
}

export function getPlayerName(player: OpenDotaPlayer, index: number): string {
  return player.personaname || player.name || `Player ${index + 1}`
}

export function getKda(player: OpenDotaPlayer): string {
  return `${player.kills ?? 0}/${player.deaths ?? 0}/${player.assists ?? 0}`
}

export function getHeroLabel(heroId?: number): string {
  return getHeroName(heroId)
}

export function getTeamPlayers(match: OpenDotaMatch, isRadiant: boolean) {
  return (match.players ?? []).filter((player, index) => {
    if (typeof player.isRadiant === 'boolean')
      return player.isRadiant === isRadiant
    return isRadiant ? index < 5 : index >= 5
  })
}

export function getMaxAbs(values?: number[]): number {
  if (!values?.length) return 0
  return values.reduce((max, value) => Math.max(max, Math.abs(value)), 0)
}

export function getAdvantageLabel(value?: number): string {
  if (value === undefined || value === null) return '-'
  if (value > 0) return `Radiant +${formatNumber(value)}`
  if (value < 0) return `Dire +${formatNumber(Math.abs(value))}`
  return 'Even'
}
