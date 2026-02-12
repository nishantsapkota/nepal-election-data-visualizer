"use client"

import { useMemo } from "react"
import { useVoters } from "@/lib/voter-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AreaChart,
  Area,
} from "recharts"

const COLORS = [
  "hsl(215, 80%, 50%)",
  "hsl(168, 70%, 42%)",
  "hsl(35, 92%, 55%)",
  "hsl(340, 65%, 55%)",
  "hsl(260, 55%, 55%)",
]

export function OverviewCharts() {
  const { filteredVoters } = useVoters()

  const genderData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredVoters.forEach((v) => {
      counts[v.gender] = (counts[v.gender] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filteredVoters])

  const ageData = useMemo(() => {
    const ranges = [
      { label: "18-25", min: 18, max: 25 },
      { label: "26-35", min: 26, max: 35 },
      { label: "36-45", min: 36, max: 45 },
      { label: "46-55", min: 46, max: 55 },
      { label: "56-65", min: 56, max: 65 },
      { label: "66-80", min: 66, max: 80 },
    ]
    return ranges.map((r) => ({
      name: r.label,
      male: filteredVoters.filter((v) => v.age >= r.min && v.age <= r.max && v.gender === "Male").length,
      female: filteredVoters.filter((v) => v.age >= r.min && v.age <= r.max && v.gender === "Female").length,
      other: filteredVoters.filter((v) => v.age >= r.min && v.age <= r.max && v.gender === "Other").length,
    }))
  }, [filteredVoters])

  const municipalityData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredVoters.forEach((v) => {
      counts[v.municipality] = (counts[v.municipality] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.replace(" Municipality", ""), value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredVoters])

  const wardTrendData = useMemo(() => {
    const wardCounts: Record<string, { male: number; female: number }> = {}
    filteredVoters.forEach((v) => {
      if (!wardCounts[v.ward]) wardCounts[v.ward] = { male: 0, female: 0 }
      if (v.gender === "Male") wardCounts[v.ward].male++
      else wardCounts[v.ward].female++
    })
    return Object.entries(wardCounts)
      .sort((a, b) => {
        const numA = parseInt(a[0].replace(/\D/g, ""))
        const numB = parseInt(b[0].replace(/\D/g, ""))
        return numA - numB
      })
      .map(([name, data]) => ({ name, ...data }))
  }, [filteredVoters])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-card-foreground">Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {genderData.map((_, index) => (
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
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-card-foreground">Age Distribution by Gender</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} barGap={2}>
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
                <Bar dataKey="male" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Male" />
                <Bar dataKey="female" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Female" />
                <Bar dataKey="other" fill={COLORS[2]} radius={[4, 4, 0, 0]} name="Other" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-card-foreground">Voters by Municipality</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={municipalityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={100} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill={COLORS[0]} radius={[0, 4, 4, 0]} name="Voters" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-card-foreground">Ward-wise Gender Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wardTrendData}>
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
                <Area type="monotone" dataKey="male" stackId="1" fill={COLORS[0]} stroke={COLORS[0]} fillOpacity={0.6} name="Male" />
                <Area type="monotone" dataKey="female" stackId="1" fill={COLORS[1]} stroke={COLORS[1]} fillOpacity={0.6} name="Female" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
