"use client"

import { FilterBar } from "./filter-bar"
import { VoterTable } from "./voter-table"

export function VotersSection() {
  return (
    <div className="flex flex-col gap-6">
      <FilterBar />
      <VoterTable />
    </div>
  )
}
