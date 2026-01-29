"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface HeatmapProps {
    data?: Record<string, number> // date string -> activity count
}

// Generate mock data for the last 365 days
const generateMockData = (): Record<string, number> => {
    const data: Record<string, number> = {}
    const today = new Date()

    for (let i = 0; i < 365; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        // Random activity with some patterns
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

        // More activity on weekdays, some randomness
        if (Math.random() > 0.3) {
            const baseActivity = isWeekend ? 2 : 5
            data[dateStr] = Math.floor(Math.random() * baseActivity) + 1
        }
    }

    return data
}

const getActivityLevel = (count: number): number => {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 5) return 2
    if (count <= 10) return 3
    return 4
}

const getActivityColor = (level: number): string => {
    const colors = [
        "bg-muted hover:bg-muted/80", // 0 - no activity
        "bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800", // 1 - low
        "bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600", // 2 - medium
        "bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-400", // 3 - high
        "bg-green-600 dark:bg-green-400 hover:bg-green-700 dark:hover:bg-green-300", // 4 - very high
    ]
    return colors[level] || colors[0]
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ActivityHeatmap({ data }: HeatmapProps) {
    const activityData = useMemo(() => data || generateMockData(), [data])

    const weeks = useMemo(() => {
        const result: { date: Date; count: number }[][] = []
        const today = new Date()
        let currentWeek: { date: Date; count: number }[] = []

        // Start from 52 weeks ago
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 364)

        // Adjust to start from Sunday
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)

        for (let i = 0; i <= 371; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)

            if (date > today) break

            const dateStr = date.toISOString().split('T')[0]
            const count = activityData[dateStr] || 0

            currentWeek.push({ date, count })

            if (currentWeek.length === 7) {
                result.push(currentWeek)
                currentWeek = []
            }
        }

        if (currentWeek.length > 0) {
            result.push(currentWeek)
        }

        return result
    }, [activityData])

    const totalActivities = useMemo(() => {
        return Object.values(activityData).reduce((sum, count) => sum + count, 0)
    }, [activityData])

    const currentStreak = useMemo(() => {
        let streak = 0
        const today = new Date()

        for (let i = 0; i < 365; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            if (activityData[dateStr] && activityData[dateStr] > 0) {
                streak++
            } else if (i > 0) {
                break
            }
        }

        return streak
    }, [activityData])

    return (
        <div className="space-y-4">
            {/* Stats Row */}
            <div className="flex gap-6 text-sm">
                <div>
                    <span className="text-muted-foreground">Total Activities: </span>
                    <span className="font-bold text-primary">{totalActivities}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">Current Streak: </span>
                    <span className="font-bold text-orange-500">{currentStreak} days 🔥</span>
                </div>
            </div>

            {/* Month Labels */}
            <div className="flex">
                <div className="w-8" /> {/* Spacer for day labels */}
                <div className="flex flex-1 text-xs text-muted-foreground">
                    {months.map((month, i) => (
                        <div key={month} className="flex-1 text-center">
                            {i % 2 === 0 ? month : ""}
                        </div>
                    ))}
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
                {/* Day Labels */}
                <div className="flex flex-col justify-around text-xs text-muted-foreground pr-2">
                    {days.filter((_, i) => i % 2 === 1).map((day) => (
                        <div key={day} className="h-3">{day}</div>
                    ))}
                </div>

                {/* Weeks */}
                <div className="flex gap-[3px] flex-1 overflow-x-auto">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dayIndex) => {
                                const level = getActivityLevel(day.count)
                                return (
                                    <motion.div
                                        key={dayIndex}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: weekIndex * 0.01 + dayIndex * 0.01 }}
                                        className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getActivityColor(level)}`}
                                        title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
                                    />
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    )
}
