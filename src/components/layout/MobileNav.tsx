"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Dumbbell, LayoutDashboard, Settings, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Study", href: "/study", icon: GraduationCap },
    { name: "Gym", href: "/gym", icon: Dumbbell },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
            <nav className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary",
                                isActive && "text-primary"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
