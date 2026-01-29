"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Dumbbell, LayoutDashboard, Settings, GraduationCap, ChevronDown, Check, PenTool } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useSpace } from "@/components/providers/SpaceContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Journal", href: "/journal", icon: PenTool },
    { name: "Gym", href: "/gym", icon: Dumbbell },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const { currentLanguage, setLanguage, label } = useSpace()

    return (
        <div className="hidden h-screen w-64 flex-col border-r bg-background p-4 md:flex">
            <div className="mb-4 flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="text-xl font-bold">LinguaSpace</span>
            </div>

            <div className="px-2 mb-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between font-normal">
                            <span className="flex items-center gap-2 truncate">
                                {currentLanguage === 'en' ? '🇬🇧' : currentLanguage === 'jp' ? '🇯🇵' : '🌍'}
                                <span className="truncate">{label}</span>
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
                            <span>🇬🇧</span> English Space
                            {currentLanguage === 'en' && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage('jp')} className="gap-2">
                            <span>🇯🇵</span> Japanese Space
                            {currentLanguage === 'jp' && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage(null)} className="gap-2">
                            <span>🌍</span> All Spaces
                            {currentLanguage === null && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
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

            <div className="border-t pt-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">App Theme</span>
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}
