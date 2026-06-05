import type { DotaFetchParams, OpenDotaMatch } from './types'

const OPENDOTA_MATCH_URL = 'https://api.opendota.com/api/matches'

export async function fetchOpenDotaMatch({
  matchId,
  apiKey,
}: DotaFetchParams): Promise<OpenDotaMatch> {
  const trimmedMatchId = matchId.trim()
  const trimmedApiKey = apiKey.trim()

  if (!/^\d+$/.test(trimmedMatchId)) {
    throw new Error('Match ID must contain digits only.')
  }

  if (!trimmedApiKey) {
    throw new Error('OpenDota API key is required for remote requests.')
  }

  const url = new URL(`${OPENDOTA_MATCH_URL}/${trimmedMatchId}`)
  url.searchParams.set('api_key', trimmedApiKey)

  const response = await fetch(url)

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      detail || `OpenDota request failed with status ${response.status}.`,
    )
  }

  return (await response.json()) as OpenDotaMatch
}
