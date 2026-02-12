"use client"

import { useMemo, useState, useCallback } from "react"
import { useVoters } from "@/lib/voter-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Users, ChevronRight, ArrowLeft, Eye } from "lucide-react"

interface MunicipalityGeo {
  id: string
  name: string
  shortName: string
  path: string
  labelX: number
  labelY: number
  baseColor: string
  hoverColor: string
}

// SVG paths traced from the actual Kavre-1 constituency map image
// The constituency shape is irregular: wider on the west, narrowing east
const MUNICIPALITY_PATHS: MunicipalityGeo[] = [
  {
    id: "panauti",
    name: "Panauti Municipality",
    shortName: "Panauti",
    // Far west - long horizontal shape, the green elongated strip in the west/southwest
    path: "M 38 248 L 42 232 L 65 215 L 95 205 L 128 198 L 145 210 L 175 208 L 205 200 L 235 195 L 265 196 L 285 210 L 310 220 L 320 240 L 318 260 L 305 278 L 280 290 L 255 295 L 225 292 L 195 285 L 165 275 L 135 268 L 105 262 L 75 258 L 50 255 Z",
    labelX: 178,
    labelY: 245,
    baseColor: "#3a9e5c",
    hoverColor: "#2d8049",
  },
  {
    id: "namobuddha",
    name: "Namobuddha Municipality",
    shortName: "Namobuddha",
    // Center-south - large area, the orange highlighted region
    path: "M 310 220 L 340 200 L 370 192 L 400 188 L 425 195 L 440 210 L 450 235 L 448 260 L 440 285 L 425 305 L 405 318 L 380 325 L 355 322 L 335 310 L 318 295 L 305 278 L 318 260 L 320 240 Z",
    labelX: 378,
    labelY: 260,
    baseColor: "#e87632",
    hoverColor: "#d06020",
  },
  {
    id: "banepa",
    name: "Banepa Municipality",
    shortName: "Banepa",
    // North-center - green area at the top
    path: "M 175 72 L 205 55 L 240 48 L 275 50 L 310 55 L 340 65 L 365 58 L 385 68 L 370 90 L 355 110 L 340 130 L 320 148 L 295 160 L 265 168 L 235 170 L 205 168 L 180 158 L 165 140 L 158 118 L 160 98 Z",
    labelX: 268,
    labelY: 112,
    baseColor: "#3a9e5c",
    hoverColor: "#2d8049",
  },
  {
    id: "dhulikhel",
    name: "Dhulikhel Municipality",
    shortName: "Dhulikhel",
    // North-east area, green at the top right
    path: "M 385 68 L 415 58 L 450 52 L 485 55 L 515 65 L 540 80 L 555 100 L 558 125 L 548 148 L 530 165 L 505 175 L 478 180 L 450 178 L 425 172 L 400 160 L 385 142 L 375 120 L 370 98 Z",
    labelX: 466,
    labelY: 118,
    baseColor: "#3a9e5c",
    hoverColor: "#2d8049",
  },
  {
    id: "panchkhal",
    name: "Panchkhal Municipality",
    shortName: "Panchkhal",
    // East side, connecting to far east, gray/light area
    path: "M 450 178 L 478 180 L 505 175 L 530 165 L 548 148 L 568 155 L 588 170 L 600 192 L 605 218 L 598 245 L 582 268 L 560 285 L 535 295 L 508 298 L 480 292 L 455 278 L 440 260 L 440 235 L 440 210 L 445 195 Z",
    labelX: 525,
    labelY: 225,
    baseColor: "#8b95a5",
    hoverColor: "#6b7585",
  },
]

// Outer boundary of the entire constituency
const BOUNDARY_PATH =
  "M 38 248 L 42 232 L 65 215 L 95 205 L 128 198 L 145 210 L 158 198 L 160 178 L 158 158 L 158 118 L 160 98 L 175 72 L 205 55 L 240 48 L 275 50 L 310 55 L 340 65 L 365 58 L 385 68 L 415 58 L 450 52 L 485 55 L 515 65 L 540 80 L 555 100 L 558 125 L 568 155 L 588 170 L 600 192 L 605 218 L 598 245 L 582 268 L 560 285 L 535 295 L 508 298 L 480 292 L 455 278 L 440 285 L 425 305 L 405 318 L 380 325 L 355 322 L 335 310 L 318 295 L 280 290 L 255 295 L 225 292 L 195 285 L 165 275 L 135 268 L 105 262 L 75 258 L 50 255 Z"

// Decorative neighboring region outlines (faded)
const NEIGHBOR_PATHS = [
  "M 38 248 L 25 235 L 15 210 L 20 185 L 35 165 L 55 155 L 65 170 L 65 215 Z",
  "M 160 98 L 150 80 L 148 58 L 158 42 L 175 35 L 205 38 L 205 55 L 175 72 Z",
  "M 605 218 L 618 210 L 628 225 L 625 250 L 612 268 L 598 275 L 598 245 Z",
]

export function MapSection() {
  const { voters, setSelectedVoter } = useVoters()
  const [hoveredMunicipality, setHoveredMunicipality] = useState<string | null>(null)
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)
  const [selectedWard, setSelectedWard] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const municipalityStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; male: number; female: number; other: number; wards: Set<string>; booths: Set<string> }
    > = {}
    voters.forEach((v) => {
      if (!stats[v.municipality])
        stats[v.municipality] = { total: 0, male: 0, female: 0, other: 0, wards: new Set(), booths: new Set() }
      stats[v.municipality].total++
      if (v.gender === "Male") stats[v.municipality].male++
      else if (v.gender === "Female") stats[v.municipality].female++
      else stats[v.municipality].other++
      stats[v.municipality].wards.add(v.ward)
      stats[v.municipality].booths.add(v.booth)
    })
    return stats
  }, [voters])

  const wardStats = useMemo(() => {
    if (!selectedMunicipality) return []
    const wards: Record<string, { total: number; male: number; female: number; booths: Set<string> }> = {}
    voters
      .filter((v) => v.municipality === selectedMunicipality)
      .forEach((v) => {
        if (!wards[v.ward]) wards[v.ward] = { total: 0, male: 0, female: 0, booths: new Set() }
        wards[v.ward].total++
        if (v.gender === "Male") wards[v.ward].male++
        else wards[v.ward].female++
        wards[v.ward].booths.add(v.booth)
      })
    return Object.entries(wards)
      .sort((a, b) => {
        const numA = parseInt(a[0].replace(/\D/g, ""))
        const numB = parseInt(b[0].replace(/\D/g, ""))
        return numA - numB
      })
      .map(([ward, data]) => ({ ward, ...data, booths: data.booths.size }))
  }, [voters, selectedMunicipality])

  const wardVoters = useMemo(() => {
    if (!selectedMunicipality || !selectedWard) return []
    return voters.filter((v) => v.municipality === selectedMunicipality && v.ward === selectedWard)
  }, [voters, selectedMunicipality, selectedWard])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, id: string) => {
      const rect = e.currentTarget.closest("svg")?.getBoundingClientRect()
      if (rect) {
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 15 })
      }
      setHoveredMunicipality(id)
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredMunicipality(null)
    setTooltipPos(null)
  }, [])

  function handleMunicipalityClick(name: string) {
    setSelectedMunicipality(name)
    setSelectedWard(null)
  }

  const hoveredStats = useMemo(() => {
    if (!hoveredMunicipality) return null
    const mp = MUNICIPALITY_PATHS.find((m) => m.id === hoveredMunicipality)
    if (!mp) return null
    const stat = municipalityStats[mp.name]
    return stat ? { name: mp.shortName, ...stat } : null
  }, [hoveredMunicipality, municipalityStats])

  const selectedMunicipalityColor = useMemo(() => {
    if (!selectedMunicipality) return null
    return MUNICIPALITY_PATHS.find((m) => m.name === selectedMunicipality)?.baseColor || null
  }, [selectedMunicipality])

  return (
    <div className="flex flex-col gap-4">
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {!selectedMunicipality
                ? "Kavre-1 Constituency Map"
                : selectedWard
                  ? `${selectedMunicipality} - ${selectedWard}`
                  : selectedMunicipality}
            </CardTitle>
            {selectedMunicipality && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedWard) {
                    setSelectedWard(null)
                  } else {
                    setSelectedMunicipality(null)
                    setSelectedWard(null)
                  }
                }}
                className="gap-1 h-7 text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                {selectedWard ? "Back to Wards" : "Back to Map"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedMunicipality ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Interactive SVG Map */}
              <div className="flex-1 min-h-[400px] lg:min-h-[520px] relative">
                <svg
                  viewBox="-10 20 650 330"
                  className="w-full h-full"
                  role="img"
                  aria-label="Map of Kavre-1 constituency showing municipalities"
                  style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.08))" }}
                >
                  <defs>
                    <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
                    </filter>
                    <filter id="highlight-glow">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                      <feFlood floodColor="#ffffff" floodOpacity="0.3" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
                    </linearGradient>
                    {/* Pattern for neighboring areas */}
                    <pattern id="neighbor-pattern" patternUnits="userSpaceOnUse" width="6" height="6">
                      <line x1="0" y1="6" x2="6" y2="0" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.4" />
                    </pattern>
                  </defs>

                  {/* Faded neighboring regions */}
                  {NEIGHBOR_PATHS.map((p, i) => (
                    <path
                      key={`neighbor-${i}`}
                      d={p}
                      fill="url(#neighbor-pattern)"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  ))}

                  {/* Constituency boundary (outer border with subtle fill) */}
                  <path
                    d={BOUNDARY_PATH}
                    fill="url(#bg-gradient)"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    opacity="0.25"
                  />

                  {/* Municipality regions */}
                  {MUNICIPALITY_PATHS.map((mp) => {
                    const isHovered = hoveredMunicipality === mp.id
                    const stat = municipalityStats[mp.name]
                    const voterCount = stat?.total || 0

                    return (
                      <g key={mp.id}>
                        {/* Municipality fill area */}
                        <path
                          d={mp.path}
                          fill={isHovered ? mp.hoverColor : mp.baseColor}
                          fillOpacity={isHovered ? 0.85 : 0.65}
                          stroke={isHovered ? mp.hoverColor : mp.baseColor}
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          strokeLinejoin="round"
                          filter={isHovered ? "url(#highlight-glow)" : "url(#map-shadow)"}
                          className="cursor-pointer transition-all duration-200"
                          style={{ transition: "fill-opacity 0.2s, stroke-width 0.2s" }}
                          onClick={() => handleMunicipalityClick(mp.name)}
                          onMouseMove={(e) => handleMouseMove(e, mp.id)}
                          onMouseLeave={handleMouseLeave}
                          role="button"
                          tabIndex={0}
                          aria-label={`${mp.shortName}: ${voterCount} voters. Click to view wards.`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleMunicipalityClick(mp.name)
                          }}
                        />

                        {/* Inner ward boundary lines (decorative) */}
                        {mp.id === "namobuddha" && (
                          <>
                            <line
                              x1={375}
                              y1={200}
                              x2={380}
                              y2={310}
                              stroke={mp.baseColor}
                              strokeWidth="0.5"
                              opacity="0.5"
                              strokeDasharray="3,3"
                              pointerEvents="none"
                            />
                            <line
                              x1={340}
                              y1={240}
                              x2={440}
                              y2={248}
                              stroke={mp.baseColor}
                              strokeWidth="0.5"
                              opacity="0.5"
                              strokeDasharray="3,3"
                              pointerEvents="none"
                            />
                          </>
                        )}
                        {mp.id === "banepa" && (
                          <line
                            x1={268}
                            y1={60}
                            x2={270}
                            y2={160}
                            stroke={mp.baseColor}
                            strokeWidth="0.5"
                            opacity="0.4"
                            strokeDasharray="3,3"
                            pointerEvents="none"
                          />
                        )}
                        {mp.id === "dhulikhel" && (
                          <line
                            x1={465}
                            y1={62}
                            x2={470}
                            y2={172}
                            stroke={mp.baseColor}
                            strokeWidth="0.5"
                            opacity="0.4"
                            strokeDasharray="3,3"
                            pointerEvents="none"
                          />
                        )}
                        {mp.id === "panchkhal" && (
                          <line
                            x1={520}
                            y1={170}
                            x2={530}
                            y2={282}
                            stroke={mp.baseColor}
                            strokeWidth="0.5"
                            opacity="0.4"
                            strokeDasharray="3,3"
                            pointerEvents="none"
                          />
                        )}
                        {mp.id === "panauti" && (
                          <line
                            x1={178}
                            y1={205}
                            x2={178}
                            y2={282}
                            stroke={mp.baseColor}
                            strokeWidth="0.5"
                            opacity="0.4"
                            strokeDasharray="3,3"
                            pointerEvents="none"
                          />
                        )}

                        {/* Label for each municipality */}
                        <text
                          x={mp.labelX}
                          y={mp.labelY - 7}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="700"
                          className="pointer-events-none select-none"
                          style={{
                            textShadow: `0 1px 3px ${mp.baseColor}, 0 0px 6px rgba(0,0,0,0.5)`,
                          }}
                        >
                          {mp.shortName}
                        </text>
                        <text
                          x={mp.labelX}
                          y={mp.labelY + 7}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="500"
                          className="pointer-events-none select-none"
                          opacity="0.9"
                          style={{
                            textShadow: `0 1px 2px ${mp.baseColor}, 0 0px 4px rgba(0,0,0,0.5)`,
                          }}
                        >
                          {voterCount.toLocaleString()} voters
                        </text>
                      </g>
                    )
                  })}

                  {/* Constituency boundary (outer crisp border, drawn on top) */}
                  <path
                    d={BOUNDARY_PATH}
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    opacity="0.4"
                    className="pointer-events-none"
                  />

                  {/* Map title */}
                  <text
                    x="310"
                    y="345"
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="9"
                    fontWeight="500"
                    className="pointer-events-none select-none"
                  >
                    Kavrepalanchok District - Constituency No. 1
                  </text>

                  {/* Compass rose */}
                  <g transform="translate(595, 60)" className="pointer-events-none" opacity="0.5">
                    <circle r="12" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
                    <text x="0" y="-15" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="600">
                      N
                    </text>
                    <line x1="0" y1="-10" x2="0" y2="-4" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                    <line x1="0" y1="4" x2="0" y2="10" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
                    <line x1="-10" y1="0" x2="-4" y2="0" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
                    <line x1="4" y1="0" x2="10" y2="0" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
                  </g>
                </svg>

                {/* Floating Tooltip */}
                {hoveredStats && tooltipPos && (
                  <div
                    className="absolute pointer-events-none z-20 bg-popover border border-border rounded-lg px-3 py-2 shadow-lg"
                    style={{
                      left: tooltipPos.x,
                      top: tooltipPos.y,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <p className="text-xs font-semibold text-popover-foreground">{hoveredStats.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{hoveredStats.total} total</span>
                      <span className="text-primary">{hoveredStats.male} M</span>
                      <span className="text-accent">{hoveredStats.female} F</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {hoveredStats.wards.size} wards | {hoveredStats.booths.size} booths
                    </p>
                  </div>
                )}

                {/* Reference image overlay toggle */}
                <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
                  Click a municipality to explore wards
                </div>
              </div>

              {/* Summary sidebar */}
              <div className="w-full lg:w-72 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Municipalities
                </h3>
                <p className="text-xs text-muted-foreground -mt-1">
                  Click a municipality on the map or below to view ward details
                </p>
                {MUNICIPALITY_PATHS.map((mp) => {
                  const stat = municipalityStats[mp.name]
                  if (!stat) return null
                  const pct = ((stat.total / voters.length) * 100).toFixed(1)
                  return (
                    <button
                      key={mp.id}
                      onClick={() => handleMunicipalityClick(mp.name)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all text-left group"
                    >
                      <div
                        className="w-4 h-4 rounded shrink-0"
                        style={{ backgroundColor: mp.baseColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{mp.shortName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{stat.total} voters</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{stat.wards.size} wards</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>{pct}%</span>
                        </div>
                        {/* Mini gender bar */}
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden flex">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${(stat.male / stat.total) * 100}%`,
                              backgroundColor: "hsl(var(--primary))",
                            }}
                          />
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${(stat.female / stat.total) * 100}%`,
                              backgroundColor: "hsl(var(--accent))",
                            }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                    </button>
                  )
                })}

                {/* Legend */}
                <div className="border-t border-border pt-3 mt-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Gender Legend
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-primary inline-block" />
                      Male
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-accent inline-block" />
                      Female
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                      Other
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : !selectedWard ? (
            /* Ward Detail View */
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: selectedMunicipalityColor || "hsl(var(--primary))" }}
                />
                <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
                  {selectedMunicipality}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {wardStats.length} wards |{" "}
                  {wardStats.reduce((a, w) => a + w.total, 0)} total voters
                </span>
              </div>

              {/* Ward grid with mini-visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wardStats.map((ws) => {
                  const malePct = ((ws.male / ws.total) * 100).toFixed(0)
                  const femalePct = ((ws.female / ws.total) * 100).toFixed(0)
                  return (
                    <button
                      key={ws.ward}
                      onClick={() => setSelectedWard(ws.ward)}
                      className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-sm text-foreground">{ws.ward}</span>
                        <Badge variant="outline" className="text-xs tabular-nums">
                          {ws.total} voters
                        </Badge>
                      </div>

                      {/* Mini donut visual */}
                      <div className="flex items-center gap-3">
                        <svg width="36" height="36" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="4"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="4"
                            strokeDasharray={`${(ws.male / ws.total) * 88} 88`}
                            strokeDashoffset="0"
                            transform="rotate(-90 18 18)"
                          />
                        </svg>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>
                            Male: {ws.male} ({malePct}%)
                          </span>
                          <span>
                            Female: {ws.female} ({femalePct}%)
                          </span>
                          <span>{ws.booths} booths</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3" />
                        View voters
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Voter List for Ward */
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: selectedMunicipalityColor || "hsl(var(--primary))" }}
                />
                <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
                  {selectedMunicipality}
                </Badge>
                <Badge variant="outline">{selectedWard}</Badge>
                <span className="text-sm text-muted-foreground">{wardVoters.length} voters</span>
              </div>
              <ScrollArea className="h-[450px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {wardVoters.map((v) => (
                    <button
                      key={v.voter_id}
                      onClick={() => setSelectedVoter(v)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-all text-left"
                    >
                      <img
                        src={v.picture}
                        alt={`Photo of ${v.name}`}
                        className="w-10 h-10 rounded-full object-cover bg-muted shrink-0"
                        crossOrigin="anonymous"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.voter_id} | {v.age}y | {v.gender}
                        </p>
                        <p className="text-xs text-muted-foreground">{v.booth}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
