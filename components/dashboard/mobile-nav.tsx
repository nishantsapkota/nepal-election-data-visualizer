"use client"

import {
  LayoutDashboard,
  Users,
  BarChart3,
  Map,
  FileText,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeSection: string
  onNavigate: (section: string) => void
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "voters", label: "Voters", icon: Users },
  { id: "analytics", label: "Charts", icon: BarChart3 },
  { id: "map", label: "Map", icon: Map },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "upload", label: "Upload", icon: Upload },
]

export function MobileNav({ activeSection, onNavigate }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <nav className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs transition-colors min-w-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate text-[10px]">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
