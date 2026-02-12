"use client"

import { useState } from "react"
import { SidebarNav } from "./sidebar-nav"
import { MobileNav } from "./mobile-nav"
import { OverviewSection } from "./overview-section"
import { VotersSection } from "./voters-section"
import { AnalyticsSection } from "./analytics-section"
import { MapSection } from "./map-section"
import { ReportsSection } from "./reports-section"
import { UploadSection } from "./upload-section"
import { VoterProfileModal } from "./voter-profile-modal"
import { VoterProvider } from "@/lib/voter-context"
import { Vote } from "lucide-react"

const sectionTitles: Record<string, string> = {
  overview: "Dashboard Overview",
  voters: "Voter Records",
  analytics: "Analytics & Charts",
  map: "Geographic Map View",
  reports: "Reports & Export",
  upload: "Upload CSV Data",
}

const sectionDescriptions: Record<string, string> = {
  overview: "Key statistics and demographics for Kavre-1 constituency",
  voters: "Browse, search, and filter the complete voter list",
  analytics: "In-depth charts and data analysis tools",
  map: "Explore voter distribution across municipalities, wards, and booths",
  reports: "Generate and export customized voter reports",
  upload: "Import your own voter CSV data into the dashboard",
}

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <VoterProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarNav activeSection={activeSection} onNavigate={setActiveSection} />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground lg:hidden">
                  <Vote className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-foreground leading-tight">
                    {sectionTitles[activeSection]}
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {sectionDescriptions[activeSection]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full hidden sm:inline-block">
                  Kavre-1, Nepal
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-auto">
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "voters" && <VotersSection />}
            {activeSection === "analytics" && <AnalyticsSection />}
            {activeSection === "map" && <MapSection />}
            {activeSection === "reports" && <ReportsSection />}
            {activeSection === "upload" && <UploadSection />}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav activeSection={activeSection} onNavigate={setActiveSection} />

        {/* Voter Profile Modal */}
        <VoterProfileModal />
      </div>
    </VoterProvider>
  )
}
