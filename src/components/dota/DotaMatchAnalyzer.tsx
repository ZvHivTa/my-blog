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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  getItemName,
  getLobbyTypeName,
  getRegionName,
} from '@/lib/dota/constants'
import { fetchOpenDotaMatch } from '@/lib/dota/open-dota'
import type {
  OpenDotaMatch,
  OpenDotaPlayer,
  OpenDotaTeamfight,
} from '@/lib/dota/types'
import {
  formatClock,
  formatDuration,
  formatNumber,
  formatPercent,
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
            <TabsTrigger value="graphs">Graphs</TabsTrigger>
            <TabsTrigger value="teamfights">Teamfights</TabsTrigger>
            <TabsTrigger value="json">Raw JSON</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="players">
          <PlayerStatsTable players={players} />
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
        detail={`Patch ${match.patch ?? '-'} · ${getRegionName(match.region)}`}
      />

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Radiant
          </CardTitle>
          <CardDescription>
            {match.radiant_win ? 'Winner' : 'Lost'} · score{' '}
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
            {match.radiant_win === false ? 'Winner' : 'Lost'} · score{' '}
            {match.dire_score ?? '-'} · XP {getAdvantageLabel(latestXpAdv)}
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

function PlayerStatsTable({ players }: { players: OpenDotaPlayer[] }) {
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
          Core scoreboard fields extracted from the OpenDota match response.
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
              <TableHead>Damage</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Lane</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
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
                <TableCell>{formatNumber(player.hero_damage)}</TableCell>
                <TableCell>
                  <ItemList player={player} />
                </TableCell>
                <TableCell>
                  {formatPercent(player.lane_efficiency_pct)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ItemList({ player }: { player: OpenDotaPlayer }) {
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
