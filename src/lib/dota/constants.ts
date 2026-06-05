import {
  game_mode as gameModes,
  heroes,
  items,
  lobby_type as lobbyTypes,
  region as regions,
} from 'dotaconstants'

const STEAM_ASSET_BASE = 'https://cdn.cloudflare.steamstatic.com'

type DotaHero = {
  id: number
  name: string
  localized_name?: string
  img?: string
  icon?: string
  primary_attr?: string
  attack_type?: string
  roles?: string[]
}

type DotaItem = {
  id: number
  dname?: string
  img?: string
  qual?: string
  cost?: number | null
}

type NamedConstant = {
  id?: number
  name?: string
}

const heroMap = heroes as unknown as Record<string, DotaHero>
const itemMap = items as unknown as Record<string, DotaItem>
const gameModeMap = gameModes as unknown as Record<string, NamedConstant>
const lobbyTypeMap = lobbyTypes as unknown as Record<string, NamedConstant>
const regionMap = regions as unknown as Record<string, string>

const itemById = Object.values(itemMap).reduce<Record<number, DotaItem>>(
  (acc, item) => {
    if (typeof item.id === 'number') {
      acc[item.id] = item
    }
    return acc
  },
  {},
)

export function getHeroById(heroId?: number): DotaHero | null {
  if (!heroId) return null
  return heroMap[String(heroId)] ?? null
}

export function getHeroName(heroId?: number): string {
  const hero = getHeroById(heroId)
  return hero?.localized_name ?? (heroId ? `Hero ${heroId}` : 'Unknown hero')
}

export function getHeroImage(heroId?: number, variant: 'img' | 'icon' = 'img') {
  return getAssetUrl(getHeroById(heroId)?.[variant])
}

export function getItemById(itemId?: number): DotaItem | null {
  if (!itemId) return null
  return itemById[itemId] ?? null
}

export function getItemName(itemId?: number): string {
  const item = getItemById(itemId)
  return item?.dname ?? (itemId ? `Item ${itemId}` : 'Empty slot')
}

export function getItemImage(itemId?: number) {
  return getAssetUrl(getItemById(itemId)?.img)
}

export function getGameModeName(gameModeId?: number): string {
  return getReadableConstantName(gameModeMap, gameModeId, 'Mode')
}

export function getLobbyTypeName(lobbyTypeId?: number): string {
  return getReadableConstantName(lobbyTypeMap, lobbyTypeId, 'Lobby')
}

export function getRegionName(regionId?: number): string {
  if (!regionId) return 'Unknown region'
  return regionMap[String(regionId)] ?? `Region ${regionId}`
}

function getReadableConstantName(
  map: Record<string, NamedConstant>,
  id: number | undefined,
  fallbackPrefix: string,
) {
  if (!id) return `Unknown ${fallbackPrefix.toLowerCase()}`
  const name = map[String(id)]?.name
  if (!name) return `${fallbackPrefix} ${id}`

  return name
    .replace(/^game_mode_/, '')
    .replace(/^lobby_type_/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getAssetUrl(path?: string) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STEAM_ASSET_BASE}${path}`
}
