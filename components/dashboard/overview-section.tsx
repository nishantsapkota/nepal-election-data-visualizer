"use client"

import { KpiCards } from "./kpi-cards"
import { OverviewCharts } from "./overview-charts"
import { FilterBar } from "./filter-bar"

export function OverviewSection() {
  return (
    <div className="flex flex-col gap-6">
      <FilterBar />
      <KpiCards />
      <OverviewCharts />
    </div>
  )
}
