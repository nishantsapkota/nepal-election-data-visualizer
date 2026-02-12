"use client"

import { useVoters } from "@/lib/voter-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, Hash, Users, Heart } from "lucide-react"

export function VoterProfileModal() {
  const { selectedVoter, setSelectedVoter } = useVoters()

  if (!selectedVoter) return null

  return (
    <Dialog open={!!selectedVoter} onOpenChange={() => setSelectedVoter(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Voter Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
            <img
              src={selectedVoter.picture}
              alt={`Photo of ${selectedVoter.name}`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{selectedVoter.name}</h3>
            <Badge variant="outline" className="mt-1">{selectedVoter.voter_id}</Badge>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Age / Gender</p>
              <p className="text-sm font-medium text-foreground">{selectedVoter.age} / {selectedVoter.gender}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Parent</p>
              <p className="text-sm font-medium text-foreground">{selectedVoter.parent_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Spouse</p>
              <p className="text-sm font-medium text-foreground">{selectedVoter.spouse || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Municipality</p>
              <p className="text-sm font-medium text-foreground">{selectedVoter.municipality}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Ward</p>
              <p className="text-sm font-medium text-foreground">{selectedVoter.ward}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Hash className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Booth</p>
              <p className="text-sm font-medium text-foreground">{selectedVoter.booth}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
