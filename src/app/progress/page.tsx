"use client"

import { useState } from "react"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import { format, subDays, isSameDay, eachDayOfInterval } from "date-fns"
import { Trophy, BookOpen, PenTool, Flame, Activity } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { database } from "@/lib/db"
import CardModel from "@/model/Card"
import Script from "@/model/Script"
import JournalEntry from "@/model/JournalEntry"

// Types
interface ProgressStats {
    totalCards: number
    totalScripts: number
    totalEntries: number
    recentActivity: Date[]
}

const ProgressDashboard = ({ stats }: { stats: ProgressStats }) => {
    // Calculate basic heatmap data (last 30 days)
    const today = new Date()
    const last30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today
    })

    const getActivityLevel = (date: Date) => {
        const count = stats.recentActivity.filter(d => isSameDay(d, date)).length
        if (count === 0) return "bg-secondary"
        if (count <= 2) return "bg-green-300 dark:bg-green-900"
        if (count <= 5) return "bg-green-500 dark:bg-green-700"
        return "bg-green-700 dark:bg-green-500"
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
                <p className="text-muted-foreground">Keep up the momentum!</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Vocabulary</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCards}</div>
                        <p className="text-xs text-muted-foreground">words learned</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scripts Mastered</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalScripts}</div>
                        <p className="text-xs text-muted-foreground">conversations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                        <PenTool className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEntries}</div>
                        <p className="text-xs text-muted-foreground">written logs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">days in a row</p>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {last30Days.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={`h-8 w-8 rounded-md ${getActivityLevel(day)}`}
                                    title={`${format(day, 'MMM do')}`}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Badges / Milestones (Static for V1) */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                            <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Early Adopter</h4>
                            <p className="text-sm text-muted-foreground">Joined LearnLingua</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg border p-4 opacity-50">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Flame className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold">7 Day Streak</h4>
                            <p className="text-sm text-muted-foreground">Coming soon...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}



// Correction: withObservables signature expects an object where values are observables.
// We cannot pass an async IIFE directly like that.
// We must decompose this.

const RealEnhancedProgressPage = withObservables([], () => ({
    cardsCount: database.collections.get<CardModel>('cards').query().observeCount(),
    scriptsCount: database.collections.get<Script>('scripts').query().observeCount(),
    entriesCount: database.collections.get<JournalEntry>('journal_entries').query().observeCount(),
    recentEntries: database.collections.get<JournalEntry>('journal_entries')
        .query(Q.sortBy('created_at', Q.desc), Q.take(50)).observe()
}))
    // @ts-ignore
    (({ cardsCount, scriptsCount, entriesCount, recentEntries }) => {
        const stats: ProgressStats = {
            totalCards: cardsCount,
            totalScripts: scriptsCount,
            totalEntries: entriesCount,
            recentActivity: recentEntries.map((e: JournalEntry) => e.createdAt)
        }
        return <ProgressDashboard stats={stats} />
    })


export default function ProgressPage() {
    return <RealEnhancedProgressPage />
}
