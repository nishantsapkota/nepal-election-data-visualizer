"use client"

import { useMemo } from "react"
import { useVoters } from "@/lib/voter-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterBar } from "./filter-bar"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

const COLORS = [
  "hsl(215, 80%, 50%)",
  "hsl(168, 70%, 42%)",
  "hsl(35, 92%, 55%)",
  "hsl(340, 65%, 55%)",
  "hsl(260, 55%, 55%)",
]

export function AnalyticsSection() {
  const { filteredVoters } = useVoters()

  const boothData = useMemo(() => {
    const counts: Record<string, { male: number; female: number; total: number }> = {}
    filteredVoters.forEach((v) => {
      if (!counts[v.booth]) counts[v.booth] = { male: 0, female: 0, total: 0 }
      if (v.gender === "Male") counts[v.booth].male++
      else counts[v.booth].female++
      counts[v.booth].total++
    })
    return Object.entries(counts)
      .sort((a, b) => {
        const numA = parseInt(a[0].replace(/\D/g, ""))
        const numB = parseInt(b[0].replace(/\D/g, ""))
        return numA - numB
      })
      .map(([name, data]) => ({ name, ...data }))
  }, [filteredVoters])

  const ageGroupGender = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {}
    filteredVoters.forEach((v) => {
      const group = v.age < 30 ? "Youth (18-29)" : v.age < 45 ? "Adult (30-44)" : v.age < 60 ? "Middle (45-59)" : "Senior (60+)"
      if (!groups[group]) groups[group] = {}
      groups[group][v.gender] = (groups[group][v.gender] || 0) + 1
    })
    return Object.entries(groups).map(([name, data]) => ({ name, ...data }))
  }, [filteredVoters])

  const municipalityRadar = useMemo(() => {
    const data: Record<string, { totalVoters: number; wards: Set<string>; booths: Set<string>; avgAge: number; count: number }> = {}
    filteredVoters.forEach((v) => {
      const key = v.municipality.replace(" Municipality", "")
      if (!data[key]) data[key] = { totalVoters: 0, wards: new Set(), booths: new Set(), avgAge: 0, count: 0 }
      data[key].totalVoters++
      data[key].wards.add(v.ward)
      data[key].booths.add(v.booth)
      data[key].avgAge += v.age
      data[key].count++
    })
    return Object.entries(data).map(([name, d]) => ({
      name,
      voters: d.totalVoters,
      wards: d.wards.size,
      booths: d.booths.size,
      avgAge: Math.round(d.avgAge / d.count),
    }))
  }, [filteredVoters])

  const scatterData = useMemo(() => {
    const byMunicipality: Record<string, { ward: string; count: number; avgAge: number }[]> = {}
    const wardGroups: Record<string, { ages: number[]; municipality: string }> = {}
    filteredVoters.forEach((v) => {
      const key = `${v.municipality}-${v.ward}`
      if (!wardGroups[key]) wardGroups[key] = { ages: [], municipality: v.municipality }
      wardGroups[key].ages.push(v.age)
    })
    Object.entries(wardGroups).forEach(([key, data]) => {
      const ward = key.split("-").pop() || ""
      const m = data.municipality.replace(" Municipality", "")
      if (!byMunicipality[m]) byMunicipality[m] = []
      byMunicipality[m].push({
        ward,
        count: data.ages.length,
        avgAge: Math.round(data.ages.reduce((a, b) => a + b, 0) / data.ages.length),
      })
    })
    return byMunicipality
  }, [filteredVoters])

  return (
    <div className="flex flex-col gap-6">
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-card-foreground">Booth-wise Voter Count</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boothData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="male" stackId="a" fill={COLORS[0]} name="Male" />
                  <Bar dataKey="female" stackId="a" fill={COLORS[1]} name="Female" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-card-foreground">Age Group Demographics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageGroupGender}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="Male"
                    label={({ name }) => name}
                  >
                    {ageGroupGender.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-card-foreground">Municipality Comparison (Radar)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={municipalityRadar} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Voters" dataKey="voters" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} />
                  <Radar name="Wards" dataKey="wards" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-card-foreground">Ward Voter Scatter (Count vs Avg Age)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="count" name="Voters" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="number" dataKey="avgAge" name="Avg Age" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <ZAxis range={[40, 200]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  {Object.entries(scatterData).map(([name, data], i) => (
                    <Scatter key={name} name={name} data={data} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
