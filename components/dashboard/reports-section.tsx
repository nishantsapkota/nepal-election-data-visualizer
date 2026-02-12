"use client"

import { useMemo, useState } from "react"
import { useVoters } from "@/lib/voter-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Printer, Table2 } from "lucide-react"

type ReportType = "demographic" | "municipality" | "ward" | "age" | "gender"

export function ReportsSection() {
  const { filteredVoters, filters, municipalities } = useVoters()
  const [reportType, setReportType] = useState<ReportType>("demographic")

  const reportData = useMemo(() => {
    const data = filteredVoters
    const total = data.length
    const male = data.filter((v) => v.gender === "Male").length
    const female = data.filter((v) => v.gender === "Female").length
    const other = data.filter((v) => v.gender === "Other").length
    const avgAge = total > 0 ? Math.round(data.reduce((s, v) => s + v.age, 0) / total) : 0
    const minAge = total > 0 ? Math.min(...data.map((v) => v.age)) : 0
    const maxAge = total > 0 ? Math.max(...data.map((v) => v.age)) : 0

    const byMunicipality: Record<string, { total: number; male: number; female: number; wards: Set<string> }> = {}
    data.forEach((v) => {
      if (!byMunicipality[v.municipality]) byMunicipality[v.municipality] = { total: 0, male: 0, female: 0, wards: new Set() }
      byMunicipality[v.municipality].total++
      if (v.gender === "Male") byMunicipality[v.municipality].male++
      else if (v.gender === "Female") byMunicipality[v.municipality].female++
      byMunicipality[v.municipality].wards.add(v.ward)
    })

    const byWard: Record<string, { total: number; male: number; female: number; booths: Set<string> }> = {}
    data.forEach((v) => {
      const key = `${v.municipality} - ${v.ward}`
      if (!byWard[key]) byWard[key] = { total: 0, male: 0, female: 0, booths: new Set() }
      byWard[key].total++
      if (v.gender === "Male") byWard[key].male++
      else if (v.gender === "Female") byWard[key].female++
      byWard[key].booths.add(v.booth)
    })

    const ageGroups = [
      { label: "18-25", min: 18, max: 25 },
      { label: "26-35", min: 26, max: 35 },
      { label: "36-45", min: 36, max: 45 },
      { label: "46-55", min: 46, max: 55 },
      { label: "56-65", min: 56, max: 65 },
      { label: "66+", min: 66, max: 200 },
    ].map((g) => {
      const group = data.filter((v) => v.age >= g.min && v.age <= g.max)
      return {
        label: g.label,
        total: group.length,
        male: group.filter((v) => v.gender === "Male").length,
        female: group.filter((v) => v.gender === "Female").length,
        percent: total > 0 ? ((group.length / total) * 100).toFixed(1) : "0",
      }
    })

    return {
      total, male, female, other, avgAge, minAge, maxAge,
      byMunicipality, byWard, ageGroups,
    }
  }, [filteredVoters])

  function exportCsv() {
    const headers = ["voter_id", "name", "age", "gender", "parent_name", "spouse", "municipality", "ward", "booth"]
    const rows = filteredVoters.map((v) =>
      headers.map((h) => String(v[h as keyof typeof v]).includes(",") ? `"${v[h as keyof typeof v]}"` : String(v[h as keyof typeof v]))
    )
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voter-report-${reportType}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function printReport() {
    window.print()
  }

  const activeFilterLabels = [
    filters.gender !== "all" && `Gender: ${filters.gender}`,
    filters.municipality !== "all" && `Municipality: ${filters.municipality}`,
    filters.ward !== "all" && `Ward: ${filters.ward}`,
    filters.booth !== "all" && `Booth: ${filters.booth}`,
    (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 80) && `Age: ${filters.ageRange[0]}-${filters.ageRange[1]}`,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-4">
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Report Generator
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={reportType} onValueChange={(val) => setReportType(val as ReportType)}>
                <SelectTrigger className="w-48 h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demographic">Demographic Summary</SelectItem>
                  <SelectItem value="municipality">Municipality Report</SelectItem>
                  <SelectItem value="ward">Ward-wise Report</SelectItem>
                  <SelectItem value="age">Age Analysis</SelectItem>
                  <SelectItem value="gender">Gender Analysis</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1 h-8 text-xs">
                <Download className="w-3 h-3" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={printReport} className="gap-1 h-8 text-xs">
                <Printer className="w-3 h-3" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <Card className="border border-border print:border-0 print:shadow-none" id="report-content">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            {/* Report Header */}
            <div className="text-center border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">
                Kavre-1 Constituency Voter Report
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {reportType === "demographic" && "Demographic Summary Report"}
                {reportType === "municipality" && "Municipality-wise Analysis Report"}
                {reportType === "ward" && "Ward-wise Detailed Report"}
                {reportType === "age" && "Age Distribution Analysis Report"}
                {reportType === "gender" && "Gender Analysis Report"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              {activeFilterLabels.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {activeFilterLabels.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Demographic Summary */}
            {reportType === "demographic" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">{reportData.total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Voters</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{reportData.male.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Male ({reportData.total > 0 ? ((reportData.male / reportData.total) * 100).toFixed(1) : 0}%)</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-accent">{reportData.female.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Female ({reportData.total > 0 ? ((reportData.female / reportData.total) * 100).toFixed(1) : 0}%)</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">{reportData.avgAge}</p>
                    <p className="text-xs text-muted-foreground">Average Age ({reportData.minAge}-{reportData.maxAge})</p>
                  </div>
                </div>
                <Separator />
                <h3 className="font-semibold text-sm text-foreground">Municipality Breakdown</h3>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Municipality</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Total</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Male</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Female</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Wards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.byMunicipality).map(([name, data]) => (
                        <tr key={name} className="border-b border-border/50">
                          <td className="py-2 px-3 text-foreground">{name}</td>
                          <td className="text-right py-2 px-3 font-medium text-foreground">{data.total}</td>
                          <td className="text-right py-2 px-3 text-foreground">{data.male}</td>
                          <td className="text-right py-2 px-3 text-foreground">{data.female}</td>
                          <td className="text-right py-2 px-3 text-foreground">{data.wards.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Municipality Report */}
            {reportType === "municipality" && (
              <div className="flex flex-col gap-4">
                {Object.entries(reportData.byMunicipality).map(([name, data]) => (
                  <div key={name} className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground">{name}</h3>
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-lg font-bold text-foreground">{data.total}</p>
                        <p className="text-xs text-muted-foreground">Total Voters</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{data.male}</p>
                        <p className="text-xs text-muted-foreground">Male</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-accent">{data.female}</p>
                        <p className="text-xs text-muted-foreground">Female</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{data.wards.size}</p>
                        <p className="text-xs text-muted-foreground">Wards</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${(data.male / data.total) * 100}%` }} />
                      <div className="h-full bg-accent" style={{ width: `${(data.female / data.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ward Report */}
            {reportType === "ward" && (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Location</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Total</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Male</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Female</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Booths</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">M/F Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.byWard)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([name, data]) => (
                        <tr key={name} className="border-b border-border/50">
                          <td className="py-2 px-3 text-foreground">{name}</td>
                          <td className="text-right py-2 px-3 font-medium text-foreground">{data.total}</td>
                          <td className="text-right py-2 px-3 text-foreground">{data.male}</td>
                          <td className="text-right py-2 px-3 text-foreground">{data.female}</td>
                          <td className="text-right py-2 px-3 text-foreground">{data.booths.size}</td>
                          <td className="text-right py-2 px-3 text-foreground">
                            {data.female > 0 ? (data.male / data.female).toFixed(2) : "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Age Report */}
            {reportType === "age" && (
              <div className="flex flex-col gap-4">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Age Group</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Total</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Male</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Female</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">% of Total</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.ageGroups.map((g) => (
                        <tr key={g.label} className="border-b border-border/50">
                          <td className="py-2 px-3 font-medium text-foreground">{g.label}</td>
                          <td className="text-right py-2 px-3 text-foreground">{g.total}</td>
                          <td className="text-right py-2 px-3 text-foreground">{g.male}</td>
                          <td className="text-right py-2 px-3 text-foreground">{g.female}</td>
                          <td className="text-right py-2 px-3 text-foreground">{g.percent}%</td>
                          <td className="py-2 px-3">
                            <div className="h-2 rounded-full bg-muted overflow-hidden w-32">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${g.percent}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Gender Report */}
            {reportType === "gender" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">{reportData.male.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Male Voters</p>
                    <p className="text-lg font-semibold text-primary mt-1">
                      {reportData.total > 0 ? ((reportData.male / reportData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-6 bg-accent/5 border border-accent/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-accent">{reportData.female.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Female Voters</p>
                    <p className="text-lg font-semibold text-accent mt-1">
                      {reportData.total > 0 ? ((reportData.female / reportData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-6 bg-muted border border-border rounded-lg text-center">
                    <p className="text-3xl font-bold text-foreground">{reportData.other.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Other</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {reportData.total > 0 ? ((reportData.other / reportData.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <Separator />
                <h3 className="font-semibold text-sm text-foreground">Gender Ratio by Municipality</h3>
                {Object.entries(reportData.byMunicipality).map(([name, data]) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="text-sm text-foreground w-40 truncate">{name.replace(" Municipality", "")}</span>
                    <div className="flex-1 h-6 rounded-full overflow-hidden flex bg-muted">
                      <div
                        className="h-full bg-primary flex items-center justify-center"
                        style={{ width: `${(data.male / data.total) * 100}%` }}
                      >
                        <span className="text-[10px] font-semibold text-primary-foreground">{data.male}</span>
                      </div>
                      <div
                        className="h-full bg-accent flex items-center justify-center"
                        style={{ width: `${(data.female / data.total) * 100}%` }}
                      >
                        <span className="text-[10px] font-semibold text-accent-foreground">{data.female}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right">{data.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
