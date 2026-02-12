"use client"

import { useVoters } from "@/lib/voter-context"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Search, RotateCcw, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FilterBar() {
  const {
    filters,
    updateFilter,
    resetFilters,
    municipalities,
    wards,
    booths,
    filteredVoters,
    voters,
  } = useVoters()

  const activeFilterCount = [
    filters.gender !== "all",
    filters.municipality !== "all",
    filters.ward !== "all",
    filters.booth !== "all",
    filters.search !== "",
    filters.ageRange[0] !== 18 || filters.ageRange[1] !== 80,
  ].filter(Boolean).length

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-card-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filteredVoters.length} of {voters.length} voters
          </span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs gap-1">
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name or ID..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 h-9 text-sm bg-background"
          />
        </div>

        <Select value={filters.gender} onValueChange={(val) => updateFilter("gender", val)}>
          <SelectTrigger className="h-9 text-sm bg-background">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.municipality} onValueChange={(val) => updateFilter("municipality", val)}>
          <SelectTrigger className="h-9 text-sm bg-background">
            <SelectValue placeholder="Municipality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Municipalities</SelectItem>
            {municipalities.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.ward} onValueChange={(val) => updateFilter("ward", val)}>
          <SelectTrigger className="h-9 text-sm bg-background">
            <SelectValue placeholder="Ward" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wards</SelectItem>
            {wards.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.booth} onValueChange={(val) => updateFilter("booth", val)}>
          <SelectTrigger className="h-9 text-sm bg-background">
            <SelectValue placeholder="Booth" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Booths</SelectItem>
            {booths.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          Age: {filters.ageRange[0]} - {filters.ageRange[1]}
        </span>
        <Slider
          min={18}
          max={80}
          step={1}
          value={filters.ageRange}
          onValueChange={(val) => updateFilter("ageRange", val as [number, number])}
          className="flex-1 max-w-xs"
        />
      </div>
    </div>
  )
}
