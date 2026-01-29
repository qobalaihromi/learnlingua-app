"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { UserWalkthrough } from "@/components/UserWalkthrough"

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                <div className="container mx-auto max-w-5xl p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* User Walkthrough (shows only for new users) */}
            <UserWalkthrough />
        </div>
    )
}
