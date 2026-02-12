"use client"

import { useState, useMemo } from "react"
import { useVoters } from "@/lib/voter-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye } from "lucide-react"

type SortKey = "name" | "age" | "gender" | "municipality" | "ward" | "booth" | "voter_id"
type SortDir = "asc" | "desc"

const PAGE_SIZE = 15

export function VoterTable() {
  const { filteredVoters, setSelectedVoter } = useVoters()
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const sorted = useMemo(() => {
    return [...filteredVoters].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      return sortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })
  }, [filteredVoters, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(0)
  }

  const SortableHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead>
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-foreground transition-colors"
      >
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </button>
    </TableHead>
  )

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-card-foreground">
          Voter Records ({filteredVoters.length.toLocaleString()})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-xs font-semibold uppercase tracking-wide">Photo</TableHead>
                <SortableHeader label="Voter ID" field="voter_id" />
                <SortableHeader label="Name" field="name" />
                <SortableHeader label="Age" field="age" />
                <SortableHeader label="Gender" field="gender" />
                <SortableHeader label="Municipality" field="municipality" />
                <SortableHeader label="Ward" field="ward" />
                <SortableHeader label="Booth" field="booth" />
                <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No voters match the current filters
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((voter) => (
                  <TableRow
                    key={voter.voter_id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setSelectedVoter(voter)}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={voter.picture} alt={voter.name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {voter.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{voter.voter_id}</TableCell>
                    <TableCell className="font-medium text-sm text-foreground">{voter.name}</TableCell>
                    <TableCell className="text-sm text-foreground">{voter.age}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          voter.gender === "Male"
                            ? "border-primary/40 text-primary bg-primary/5"
                            : voter.gender === "Female"
                            ? "border-accent/40 text-accent bg-accent/5"
                            : "border-chart-3/40 text-chart-3 bg-chart-3/5"
                        }
                      >
                        {voter.gender}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{voter.municipality.replace(" Municipality", "")}</TableCell>
                    <TableCell className="text-sm text-foreground">{voter.ward}</TableCell>
                    <TableCell className="text-sm text-foreground">{voter.booth}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedVoter(voter)
                        }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="sr-only">View profile</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="h-8 gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="h-8 gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
