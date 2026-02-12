"use client"

import { useMemo } from "react"
import { useVoters } from "@/lib/voter-context"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, MapPin, Building2 } from "lucide-react"

export function KpiCards() {
  const { voters, filteredVoters } = useVoters()

  const stats = useMemo(() => {
    const total = filteredVoters.length
    const male = filteredVoters.filter((v) => v.gender === "Male").length
    const female = filteredVoters.filter((v) => v.gender === "Female").length
    const municipalities = new Set(filteredVoters.map((v) => v.municipality)).size
    const wards = new Set(filteredVoters.map((v) => `${v.municipality}-${v.ward}`)).size
    const avgAge = total > 0 ? Math.round(filteredVoters.reduce((sum, v) => sum + v.age, 0) / total) : 0

    return [
      {
        label: "Total Voters",
        value: total.toLocaleString(),
        subtext: `of ${voters.length.toLocaleString()} total`,
        icon: Users,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        label: "Male / Female",
        value: `${male} / ${female}`,
        subtext: `${total > 0 ? ((female / total) * 100).toFixed(1) : 0}% female`,
        icon: UserCheck,
        color: "text-accent",
        bgColor: "bg-accent/10",
      },
      {
        label: "Municipalities",
        value: municipalities.toString(),
        subtext: `${wards} total wards`,
        icon: Building2,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
      },
      {
        label: "Average Age",
        value: avgAge.toString(),
        subtext: "years old",
        icon: MapPin,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
      },
    ]
  }, [filteredVoters, voters])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                <span className="text-2xl font-bold text-card-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.subtext}</span>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
