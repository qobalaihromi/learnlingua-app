"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StudyModeCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    color: string
    disabled?: boolean
}

export const StudyModeCard = ({
    title,
    description,
    icon: Icon,
    href,
    color,
    disabled = false
}: StudyModeCardProps) => (
    <Link href={disabled ? "#" : href} className={disabled ? "cursor-not-allowed" : ""}>
        <motion.div
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
        >
            <Card className={`h-full transition-all ${disabled ? 'opacity-50' : 'hover:shadow-lg hover:border-primary/50'}`}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className={`p-4 rounded-2xl ${color}`}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {disabled && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">Coming Soon</span>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    </Link>
)
