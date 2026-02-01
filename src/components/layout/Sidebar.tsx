"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutDashboard, Settings, Trophy, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
    { name: "My Decks", href: "/", icon: LayoutDashboard },
    { name: "Progress", href: "/progress", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden h-screen w-64 flex-col border-r bg-background p-4 md:flex">
            <div className="mb-6 flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">FlashLingua</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-3", isActive && "bg-secondary")}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            <div className="space-y-4">
                <Link href="/?create=true">
                    <Button className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        New Deck
                    </Button>
                </Link>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </div>
    )
}

