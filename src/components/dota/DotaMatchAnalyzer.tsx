import { useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Clock,
  Eye,
  FileJson,
  KeyRound,
  Loader2,
  RotateCcw,
  Search,
  Shield,
  Swords,
  Trophy,
  Users,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getGameModeName,
  getHeroImage,
  getItemImage,
  getItemImageByKey,
  getItemName,
  getItemNameByKey,
  getLobbyTypeName,
  getRegionName,
} from '@/lib/dota/constants'
import { fetchOpenDotaMatch } from '@/lib/dota/open-dota'
import {
  getSupportUtilityPurchases,
  getSupportUtilityTotal,
  getUpgradeFlags,
} from '@/lib/dota/snapshots'
import type {
  OpenDotaLogEntry,
  OpenDotaMatch,
  OpenDotaPlayer,
  OpenDotaTeamfight,
} from '@/lib/dota/types'
import {
  formatClock,
  formatDuration,
  formatNumber,
  getAdvantageLabel,
  getHeroLabel,
  getKda,
  getMaxAbs,
  getPlayerName,
  getTeamPlayers,
  getWinner,
} from '@/lib/dota/format'

type QueryState = 'idle' | 'loading' | 'success' | 'error'

const DEMO_MATCH_ID = '8837083407'
const PURCHASE_BUCKET_SECONDS = 300
const CONSUMABLE_ITEM_KEYS = new Set([
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
])

export default function DotaMatchAnalyzer() {
  const [matchId, setMatchId] = useState(DEMO_MATCH_ID)
  const [apiKey, setApiKey] = useState('')
  const [match, setMatch] = useState<OpenDotaMatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<QueryState>('idle')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('loading')
    setError(null)

    try {
      const result = await fetchOpenDotaMatch({ matchId, apiKey })
      setMatch(result)
      setState('success')
    } catch (err) {
      setMatch(null)
      setError(err instanceof Error ? err.message : 'Unknown request error.')
      setState('error')
    }
  }

  const reset = () => {
    setMatch(null)
    setError(null)
    setState('idle')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="flex items-center gap-2">
                <Swords className="size-4" />
                Dota 2 Match Analyzer
              </CardTitle>
              <CardDescription>
                Query OpenDota by match ID, inspect the raw match response, and
                shape the data model for the future backend.
              </CardDescription>
            </div>
            <Badge variant="outline">Browser request prototype</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Match ID</span>
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  inputMode="numeric"
                  placeholder="8837083407"
                  value={matchId}
                  onChange={(event) => setMatchId(event.target.value)}
                />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">OpenDota API Key</span>
              <div className="relative">
                <KeyRound className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  type="password"
                  placeholder="Paste your key for this browser request"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                />
              </div>
            </label>
            <div className="flex items-end gap-2">
              <Button
                className="w-full lg:w-auto"
                disabled={state === 'loading'}
              >
                {state === 'loading' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Fetch match
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={reset}
                title="Reset"
                aria-label="Reset"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </form>

          <Alert variant="muted" className="mt-4">
            <Eye className="mr-2 inline size-4 align-text-bottom" />
            <span>
              This prototype sends the key from your browser. Production should
              move the OpenDota request behind your own backend proxy.
            </span>
          </Alert>
        </CardContent>
      </Card>

      {state === 'loading' && <LoadingPanel />}

      {state === 'error' && error && (
        <Alert variant="destructive">
          <AlertCircle className="mr-2 inline size-4 align-text-bottom" />
          <AlertTitle>OpenDota request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {state === 'idle' && <EmptyPanel />}

      {match && state === 'success' && <MatchDashboard match={match} />}
    </div>
  )
}

function EmptyPanel() {
  return (
    <Card>
      <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 pt-5 text-center">
        <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
          <BarChart3 className="text-muted-foreground size-5" />
        </div>
        <div className="max-w-md">
          <div className="font-medium">Ready for a match ID</div>
          <p className="text-muted-foreground mt-1 text-sm">
            The first version focuses on remote fetching, readable match
            summaries, player stats, advantage curves, teamfights, and raw JSON.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MatchDashboard({ match }: { match: OpenDotaMatch }) {
  const players = match.players ?? []
  const hasParsedData = Boolean(
    players.length ||
      match.teamfights?.length ||
      match.radiant_gold_adv?.length,
  )

  return (
    <div className="flex flex-col gap-6">
      {!hasParsedData && (
        <Alert>
          <AlertCircle className="mr-2 inline size-4 align-text-bottom" />
          <AlertTitle>Limited parsed data</AlertTitle>
          <AlertDescription>
            OpenDota returned the match, but parsed details are missing. Some
            tabs may be empty until the match is parsed.
          </AlertDescription>
        </Alert>
      )}

      <MatchOverview match={match} />

      <Tabs defaultValue="players">
        <ScrollArea className="w-full">
          <TabsList className="mb-1">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="graphs">Graphs</TabsTrigger>
            <TabsTrigger value="teamfights">Teamfights</TabsTrigger>
            <TabsTrigger value="json">Raw JSON</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="players">
          <PlayerStatsTable match={match} players={players} />
        </TabsContent>
        <TabsContent value="purchases">
          <PurchaseTimeline match={match} players={players} />
        </TabsContent>
        <TabsContent value="graphs">
          <AdvantageCharts match={match} />
        </TabsContent>
        <TabsContent value="teamfights">
          <TeamfightTimeline teamfights={match.teamfights ?? []} />
        </TabsContent>
        <TabsContent value="json">
          <RawJsonPanel match={match} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MatchOverview({ match }: { match: OpenDotaMatch }) {
  const radiantPlayers = getTeamPlayers(match, true)
  const direPlayers = getTeamPlayers(match, false)
  const latestGoldAdv = match.radiant_gold_adv?.at(-1)
  const latestXpAdv = match.radiant_xp_adv?.at(-1)

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <MetricCard
        icon={<Trophy className="size-4" />}
        label="Winner"
        value={getWinner(match)}
        detail={`${match.radiant_score ?? '-'} - ${match.dire_score ?? '-'}`}
      />
      <MetricCard
        icon={<Clock className="size-4" />}
        label="Duration"
        value={formatDuration(match.duration)}
        detail={`First blood ${formatClock(match.first_blood_time)}`}
      />
      <MetricCard
        icon={<BarChart3 className="size-4" />}
        label="Final gold"
        value={getAdvantageLabel(latestGoldAdv)}
        detail={`Max swing ${formatNumber(getMaxAbs(match.radiant_gold_adv))}`}
      />
      <MetricCard
        icon={<Users className="size-4" />}
        label="Players"
        value={`${radiantPlayers.length} vs ${direPlayers.length}`}
        detail={`Patch ${match.patch ?? '-'} 路 ${getRegionName(match.region)}`}
      />

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Radiant
          </CardTitle>
          <CardDescription>
            {match.radiant_win ? 'Winner' : 'Lost'} 路 score{' '}
            {match.radiant_score ?? '-'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroStrip players={radiantPlayers} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Dire
          </CardTitle>
          <CardDescription>
            {match.radiant_win === false ? 'Winner' : 'Lost'} 路 score{' '}
            {match.dire_score ?? '-'} 路 XP {getAdvantageLabel(latestXpAdv)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroStrip players={direPlayers} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle>Match Context</CardTitle>
          <CardDescription>
            Static labels resolved through dotaconstants.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <ContextMetric
            label="Game mode"
            value={getGameModeName(match.game_mode)}
          />
          <ContextMetric
            label="Lobby"
            value={getLobbyTypeName(match.lobby_type)}
          />
          <ContextMetric label="Region" value={getRegionName(match.region)} />
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          {icon}
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-medium">{value}</div>
        <div className="text-muted-foreground mt-1 text-xs">{detail}</div>
      </CardContent>
    </Card>
  )
}

function HeroStrip({ players }: { players: OpenDotaPlayer[] }) {
  if (!players.length) {
    return <div className="text-muted-foreground text-sm">No player data.</div>
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {players.map((player, index) => (
        <div
          key={`${player.account_id ?? 'anon'}-${player.hero_id ?? index}`}
          className="bg-muted/40 flex min-w-0 items-center justify-between gap-3 rounded-md border p-2"
        >
          <div className="flex min-w-0 items-center gap-3">
            <HeroAvatar heroId={player.hero_id} size="md" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {getHeroLabel(player.hero_id)}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {getPlayerName(player, index)}
              </div>
            </div>
          </div>
          <Badge variant="outline">{getKda(player)}</Badge>
        </div>
      ))}
    </div>
  )
}

function HeroAvatar({
  heroId,
  size = 'sm',
}: {
  heroId?: number
  size?: 'sm' | 'md'
}) {
  const image = getHeroImage(heroId, size === 'sm' ? 'icon' : 'img')
  const name = getHeroLabel(heroId)

  return (
    <div
      className={
        size === 'sm'
          ? 'bg-muted h-8 w-8 overflow-hidden rounded-md border'
          : 'bg-muted h-11 w-16 overflow-hidden rounded-md border'
      }
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
          ?
        </div>
      )}
    </div>
  )
}

function ContextMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

function PlayerStatsTable({
  match,
  players,
}: {
  match: OpenDotaMatch
  players: OpenDotaPlayer[]
}) {
  const finalSeconds = match.duration ?? Number.POSITIVE_INFINITY

  if (!players.length) {
    return (
      <EmptyDataCard
        title="No players"
        detail="The response has no players array."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Stats</CardTitle>
        <CardDescription>
          Final scoreboard, final inventory, key upgrades, and support utility
          totals from the parsed match response.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Hero</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>KDA</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>LH/DN</TableHead>
              <TableHead>GPM</TableHead>
              <TableHead>XPM</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Final Items</TableHead>
              <TableHead>Upgrades</TableHead>
              <TableHead>Utility</TableHead>
              <TableHead>Map</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => {
              const utilityPurchases = getSupportUtilityPurchases(
                player.purchase_log,
                finalSeconds,
              )
              const upgrades = getUpgradeFlags(
                player.purchase_log,
                finalSeconds,
              )

              return (
                <TableRow
                  key={`${player.account_id ?? index}-${player.hero_id ?? 'hero'}`}
                >
                  <TableCell>
                    <Badge variant={player.isRadiant ? 'muted' : 'outline'}>
                      {player.isRadiant ? 'Radiant' : 'Dire'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <HeroAvatar heroId={player.hero_id} />
                      <span>{getHeroLabel(player.hero_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-44 truncate">
                    {getPlayerName(player, index)}
                  </TableCell>
                  <TableCell>{getKda(player)}</TableCell>
                  <TableCell>{player.level ?? '-'}</TableCell>
                  <TableCell>
                    {player.last_hits ?? '-'}/{player.denies ?? '-'}
                  </TableCell>
                  <TableCell>{player.gold_per_min ?? '-'}</TableCell>
                  <TableCell>{player.xp_per_min ?? '-'}</TableCell>
                  <TableCell>{formatNumber(player.net_worth)}</TableCell>
                  <TableCell>
                    <FinalItemList player={player} />
                  </TableCell>
                  <TableCell>
                    <UpgradeFlags upgrades={upgrades} />
                  </TableCell>
                  <TableCell>
                    <UtilityPurchases utilityPurchases={utilityPurchases} />
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground text-xs">
                      Placed {player.obs_log?.length ?? 0}O/
                      {player.sen_log?.length ?? 0}S
                      <br />
                      BB {player.buyback_log?.length ?? 0} 路 Rune{' '}
                      {player.runes_log?.length ?? 0}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function FinalItemList({ player }: { player: OpenDotaPlayer }) {
  const items = [
    player.item_0,
    player.item_1,
    player.item_2,
    player.item_3,
    player.item_4,
    player.item_5,
  ].filter((item): item is number => Boolean(item))

  if (!items.length) return <span className="text-muted-foreground">-</span>

  return (
    <div className="flex max-w-64 flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="bg-muted flex size-8 overflow-hidden rounded-sm border"
          title={getItemName(item)}
          aria-label={getItemName(item)}
        >
          {getItemImage(item) ? (
            <img
              src={getItemImage(item) ?? undefined}
              alt={getItemName(item)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-muted-foreground m-auto text-[10px]">
              {item}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

function UtilityPurchases({
  utilityPurchases,
}: {
  utilityPurchases: {
    observerWards: number
    sentryWards: number
    dust: number
    smoke: number
  }
}) {
  const total = getSupportUtilityTotal(utilityPurchases)

  if (!total) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="grid min-w-40 grid-cols-2 gap-1.5 text-xs">
      <UtilityItem
        itemKey="ward_observer"
        label="Obs"
        count={utilityPurchases.observerWards}
      />
      <UtilityItem
        itemKey="ward_sentry"
        label="Sen"
        count={utilityPurchases.sentryWards}
      />
      <UtilityItem itemKey="dust" label="Dust" count={utilityPurchases.dust} />
      <UtilityItem
        itemKey="smoke_of_deceit"
        label="Smoke"
        count={utilityPurchases.smoke}
      />
    </div>
  )
}

function UtilityItem({
  itemKey,
  label,
  count,
}: {
  itemKey: string
  label: string
  count: number
}) {
  const name = getItemNameByKey(itemKey)
  const image = getItemImageByKey(itemKey)

  return (
    <span
      className="bg-muted/30 flex items-center gap-1.5 rounded-sm border px-1.5 py-1"
      title={`${name} purchased`}
      aria-label={`${name} purchased ${count}`}
    >
      <ItemKeyIcon itemKey={itemKey} className="size-5" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{count}</span>
      {!image && <span className="sr-only">{name}</span>}
    </span>
  )
}

function UpgradeFlags({
  upgrades,
}: {
  upgrades: {
    shard: boolean
    scepter: boolean
    blessing: boolean
  }
}) {
  return (
    <div className="grid min-w-44 grid-cols-3 gap-1.5 text-xs">
      <UpgradeFlag
        itemKey="aghanims_shard"
        label="Shard"
        active={upgrades.shard}
      />
      <UpgradeFlag
        itemKey="ultimate_scepter"
        label="Scepter"
        active={upgrades.scepter}
      />
      <UpgradeFlag
        itemKey="ultimate_scepter_2"
        label="Blessing"
        active={upgrades.blessing}
      />
    </div>
  )
}

function UpgradeFlag({
  itemKey,
  label,
  active,
}: {
  itemKey: string
  label: string
  active: boolean
}) {
  const name = getItemNameByKey(itemKey)

  return (
    <span
      className={
        active
          ? 'border-primary/40 bg-primary/10 flex items-center gap-1 rounded-sm border px-1.5 py-1'
          : 'bg-muted/30 text-muted-foreground flex items-center gap-1 rounded-sm border px-1.5 py-1 opacity-70'
      }
      title={name}
      aria-label={`${name} ${active ? 1 : 0}`}
    >
      <ItemKeyIcon itemKey={itemKey} className="size-5" />
      <span className="truncate">{label}</span>
      <span className="font-medium">{active ? 1 : 0}</span>
    </span>
  )
}

function ItemKeyIcon({
  itemKey,
  className,
}: {
  itemKey: string
  className?: string
}) {
  const name = getItemNameByKey(itemKey)
  const image = getItemImageByKey(itemKey)

  return (
    <span
      className={`${className ?? 'size-6'} bg-muted flex shrink-0 overflow-hidden rounded-sm border`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-muted-foreground m-auto text-[9px]">
          {itemKey.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  )
}

type PurchaseEvent = {
  player: OpenDotaPlayer
  playerIndex: number
  time: number
  key: string
}

function PurchaseTimeline({
  match,
  players,
}: {
  match: OpenDotaMatch
  players: OpenDotaPlayer[]
}) {
  const [showConsumables, setShowConsumables] = useState(false)
  const purchaseEvents = useMemo(
    () => getPurchaseEvents(players, showConsumables),
    [players, showConsumables],
  )
  const bucketStarts = useMemo(
    () => getPurchaseBucketStarts(match, purchaseEvents),
    [match, purchaseEvents],
  )

  if (!players.length) {
    return (
      <EmptyDataCard
        title="No players"
        detail="The response has no players array."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Purchase Timeline</CardTitle>
            <CardDescription>
              Parsed purchase_log entries grouped into five-minute columns.
            </CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              className="accent-primary size-4"
              type="checkbox"
              checked={showConsumables}
              onChange={(event) => setShowConsumables(event.target.checked)}
            />
            <span>Show consumables</span>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {!purchaseEvents.length ? (
          <div className="text-muted-foreground flex min-h-32 items-center justify-center rounded-md border text-sm">
            The response has no purchase_log entries for this filter.
          </div>
        ) : (
          <ScrollArea className="w-full rounded-md border">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-background sticky left-0 z-10 min-w-56">
                    Player
                  </TableHead>
                  {bucketStarts.map((bucketStart) => (
                    <TableHead key={bucketStart} className="min-w-44">
                      {Math.floor(bucketStart / 60)}'
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, index) => (
                  <TableRow
                    key={`${player.account_id ?? index}-${player.hero_id ?? 'purchase'}`}
                  >
                    <TableCell className="bg-background sticky left-0 z-10">
                      <div className="flex min-w-0 items-center gap-2">
                        <HeroAvatar heroId={player.hero_id} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {getPlayerName(player, index)}
                          </div>
                          <div className="text-muted-foreground truncate text-xs">
                            {getHeroLabel(player.hero_id)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {bucketStarts.map((bucketStart) => {
                      const bucketEvents = purchaseEvents.filter(
                        (event) =>
                          event.playerIndex === index &&
                          (bucketStart === 0 || event.time >= bucketStart) &&
                          event.time < bucketStart + PURCHASE_BUCKET_SECONDS,
                      )

                      return (
                        <TableCell key={bucketStart} className="align-top">
                          <PurchaseEventList events={bucketEvents} />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function PurchaseEventList({ events }: { events: PurchaseEvent[] }) {
  if (!events.length) {
    return <span className="text-muted-foreground text-xs">-</span>
  }

  return (
    <div className="flex max-w-44 flex-wrap gap-1.5">
      {events.map((event, index) => (
        <span
          key={`${event.key}-${event.time}-${index}`}
          className="relative"
          title={`${getItemNameByKey(event.key)} at ${formatClock(event.time)}`}
        >
          <ItemKeyIcon itemKey={event.key} className="size-9" />
          <span className="absolute right-0 bottom-0 rounded-tl-sm bg-black/75 px-0.5 text-[10px] leading-3 text-white">
            {formatClock(event.time)}
          </span>
        </span>
      ))}
    </div>
  )
}

function getPurchaseEvents(
  players: OpenDotaPlayer[],
  showConsumables: boolean,
) {
  return players
    .flatMap((player, playerIndex) =>
      (player.purchase_log ?? []).map((entry) =>
        toPurchaseEvent(entry, player, playerIndex),
      ),
    )
    .filter((event): event is PurchaseEvent => Boolean(event))
    .filter((event) => showConsumables || !CONSUMABLE_ITEM_KEYS.has(event.key))
    .sort((a, b) => a.time - b.time)
}

function toPurchaseEvent(
  entry: OpenDotaLogEntry,
  player: OpenDotaPlayer,
  playerIndex: number,
): PurchaseEvent | null {
  if (!entry.key || typeof entry.time !== 'number') return null
  return {
    player,
    playerIndex,
    time: entry.time,
    key: entry.key,
  }
}

function getPurchaseBucketStarts(
  match: OpenDotaMatch,
  events: PurchaseEvent[],
) {
  const maxEventTime = events.reduce(
    (max, event) => Math.max(max, event.time),
    0,
  )
  const maxTime = Math.max(match.duration ?? 0, maxEventTime)
  const bucketCount = Math.max(1, Math.ceil(maxTime / PURCHASE_BUCKET_SECONDS))

  return Array.from(
    { length: bucketCount + 1 },
    (_, index) => index * PURCHASE_BUCKET_SECONDS,
  )
}

function AdvantageCharts({ match }: { match: OpenDotaMatch }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdvantageChart
        title="Gold Advantage"
        values={match.radiant_gold_adv ?? []}
      />
      <AdvantageChart
        title="XP Advantage"
        values={match.radiant_xp_adv ?? []}
      />
    </div>
  )
}

function AdvantageChart({
  title,
  values,
}: {
  title: string
  values: number[]
}) {
  const points = useMemo(() => makeChartPoints(values), [values])
  const maxAbs = getMaxAbs(values)
  const finalValue = values.at(-1)

  if (!values.length) {
    return (
      <EmptyDataCard
        title={title}
        detail="No advantage array in this response."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Positive means Radiant leads, negative means Dire leads. Final:{' '}
          {getAdvantageLabel(finalValue)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <svg viewBox="0 0 720 260" className="h-full w-full overflow-visible">
            <line
              x1="0"
              y1="130"
              x2="720"
              y2="130"
              className="stroke-border"
              strokeWidth="1"
            />
            <polyline
              points={points}
              fill="none"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="0" y="20" className="fill-muted-foreground text-xs">
              +{formatNumber(maxAbs)}
            </text>
            <text x="0" y="252" className="fill-muted-foreground text-xs">
              -{formatNumber(maxAbs)}
            </text>
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

function makeChartPoints(values: number[]): string {
  if (!values.length) return ''
  const width = 720
  const height = 260
  const middle = height / 2
  const maxAbs = getMaxAbs(values) || 1

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width
      const y = middle - (value / maxAbs) * (height * 0.43)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

function TeamfightTimeline({
  teamfights,
}: {
  teamfights: OpenDotaTeamfight[]
}) {
  if (!teamfights.length) {
    return (
      <EmptyDataCard
        title="No teamfights"
        detail="The response has no parsed teamfight data."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teamfight Timeline</CardTitle>
        <CardDescription>
          Each row aggregates the 10 player records inside a parsed teamfight.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {teamfights.map((fight, index) => {
            const summary = summarizeTeamfight(fight)
            return (
              <div key={`${fight.start ?? index}-${fight.end ?? index}`}>
                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-[10rem_1fr]">
                  <div>
                    <div className="font-medium">Fight {index + 1}</div>
                    <div className="text-muted-foreground text-sm">
                      {formatClock(fight.start)} - {formatClock(fight.end)}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <FightMetric
                      label="Deaths"
                      value={formatNumber(fight.deaths)}
                    />
                    <FightMetric
                      label="Damage"
                      value={formatNumber(summary.damage)}
                    />
                    <FightMetric
                      label="Gold delta"
                      value={formatNumber(summary.goldDelta)}
                    />
                    <FightMetric
                      label="XP delta"
                      value={formatNumber(summary.xpDelta)}
                    />
                  </div>
                </div>
                {index < teamfights.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function summarizeTeamfight(fight: OpenDotaTeamfight) {
  return (fight.players ?? []).reduce<{
    damage: number
    goldDelta: number
    xpDelta: number
  }>(
    (summary, player) => ({
      damage: summary.damage + (player.damage ?? 0),
      goldDelta: summary.goldDelta + (player.gold_delta ?? 0),
      xpDelta: summary.xpDelta + (player.xp_delta ?? 0),
    }),
    { damage: 0, goldDelta: 0, xpDelta: 0 },
  )
}

function FightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}

function RawJsonPanel({ match }: { match: OpenDotaMatch }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="size-4" />
          Raw JSON
        </CardTitle>
        <CardDescription>
          Useful while deciding the normalized DTO for your Java backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="bg-muted/40 h-[32rem] rounded-lg border p-4">
          <pre className="text-xs leading-5">
            <code>{JSON.stringify(match, null, 2)}</code>
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function EmptyDataCard({ title, detail }: { title: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 pt-5 text-center">
        <div className="font-medium">{title}</div>
        <div className="text-muted-foreground text-sm">{detail}</div>
      </CardContent>
    </Card>
  )
}
