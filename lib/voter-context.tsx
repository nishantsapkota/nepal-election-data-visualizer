"use client"

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react"
import type { Voter, FilterState } from "./types"
import { sampleVoters, parseCsvToVoters } from "./sample-data"

interface VoterContextType {
  voters: Voter[]
  filteredVoters: Voter[]
  filters: FilterState
  setFilters: (filters: FilterState) => void
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  loadCsvData: (csvText: string) => void
  selectedVoter: Voter | null
  setSelectedVoter: (voter: Voter | null) => void
  municipalities: string[]
  wards: string[]
  booths: string[]
  isUsingCsvData: boolean
}

const defaultFilters: FilterState = {
  search: "",
  gender: "all",
  municipality: "all",
  ward: "all",
  booth: "all",
  ageRange: [18, 80],
}

const VoterContext = createContext<VoterContextType | undefined>(undefined)

export function VoterProvider({ children }: { children: ReactNode }) {
  const [voters, setVoters] = useState<Voter[]>(sampleVoters)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null)
  const [isUsingCsvData, setIsUsingCsvData] = useState(false)

  const municipalities = useMemo(() => [...new Set(voters.map((v) => v.municipality))].sort(), [voters])
  const wards = useMemo(() => {
    const filtered = filters.municipality !== "all" ? voters.filter((v) => v.municipality === filters.municipality) : voters
    return [...new Set(filtered.map((v) => v.ward))].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""))
      const numB = parseInt(b.replace(/\D/g, ""))
      return numA - numB
    })
  }, [voters, filters.municipality])

  const booths = useMemo(() => {
    let filtered = voters
    if (filters.municipality !== "all") filtered = filtered.filter((v) => v.municipality === filters.municipality)
    if (filters.ward !== "all") filtered = filtered.filter((v) => v.ward === filters.ward)
    return [...new Set(filtered.map((v) => v.booth))].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""))
      const numB = parseInt(b.replace(/\D/g, ""))
      return numA - numB
    })
  }, [voters, filters.municipality, filters.ward])

  const filteredVoters = useMemo(() => {
    return voters.filter((v) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match = v.name.toLowerCase().includes(q) ||
          v.voter_id.toLowerCase().includes(q) ||
          v.parent_name.toLowerCase().includes(q)
        if (!match) return false
      }
      if (filters.gender !== "all" && v.gender !== filters.gender) return false
      if (filters.municipality !== "all" && v.municipality !== filters.municipality) return false
      if (filters.ward !== "all" && v.ward !== filters.ward) return false
      if (filters.booth !== "all" && v.booth !== filters.booth) return false
      if (v.age < filters.ageRange[0] || v.age > filters.ageRange[1]) return false
      return true
    })
  }, [voters, filters])

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "municipality") {
        next.ward = "all"
        next.booth = "all"
      }
      if (key === "ward") {
        next.booth = "all"
      }
      return next
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const loadCsvData = useCallback((csvText: string) => {
    const parsed = parseCsvToVoters(csvText)
    if (parsed.length > 0) {
      setVoters(parsed)
      setIsUsingCsvData(true)
      setFilters(defaultFilters)
    }
  }, [])

  return (
    <VoterContext.Provider
      value={{
        voters,
        filteredVoters,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        loadCsvData,
        selectedVoter,
        setSelectedVoter,
        municipalities,
        wards,
        booths,
        isUsingCsvData,
      }}
    >
      {children}
    </VoterContext.Provider>
  )
}

export function useVoters() {
  const context = useContext(VoterContext)
  if (!context) throw new Error("useVoters must be used within VoterProvider")
  return context
}
