"use client"

import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import { format, subDays, isSameDay, eachDayOfInterval } from "date-fns"
import { Trophy, BookOpen, Flame, Target, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { database } from "@/lib/db"
import CardModel from "@/model/Card"
import Deck from "@/model/Deck"

// Types
interface ProgressStats {
    totalCards: number
    totalDecks: number
    masteredCards: number
    dueCards: number
}

const ProgressDashboard = ({ stats }: { stats: ProgressStats }) => {
    // Calculate basic heatmap data (last 30 days)
    const today = new Date()
    const last30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today
    })

    // For now, simulate activity - in a real app, we'd track daily reviews
    const getActivityLevel = (date: Date) => {
        // Placeholder: random activity based on date
        const hash = date.getDate() + date.getMonth() * 31
        const level = hash % 4
        if (level === 0) return "bg-secondary"
        if (level === 1) return "bg-green-300 dark:bg-green-900"
        if (level === 2) return "bg-green-500 dark:bg-green-700"
        return "bg-green-700 dark:bg-green-500"
    }

    const masteryRate = stats.totalCards > 0
        ? Math.round((stats.masteredCards / stats.totalCards) * 100)
        : 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
                <p className="text-muted-foreground">Track your learning journey</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDecks}</div>
                            <p className="text-xs text-muted-foreground">flashcard decks</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCards}</div>
                            <p className="text-xs text-muted-foreground">vocabulary items</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.masteredCards}</div>
                            <p className="text-xs text-muted-foreground">{masteryRate}% mastery rate</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                            <Zap className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.dueCards}</div>
                            <p className="text-xs text-muted-foreground">cards to review</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Activity Heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {last30Days.map((day, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className={`h-8 w-8 rounded-md ${getActivityLevel(day)}`}
                                title={`${format(day, 'MMM do')}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                        <span>Less</span>
                        <div className="h-3 w-3 rounded bg-secondary" />
                        <div className="h-3 w-3 rounded bg-green-300 dark:bg-green-900" />
                        <div className="h-3 w-3 rounded bg-green-500 dark:bg-green-700" />
                        <div className="h-3 w-3 rounded bg-green-700 dark:bg-green-500" />
                        <span>More</span>
                    </div>
                </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
                <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                            <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Early Adopter</h4>
                            <p className="text-sm text-muted-foreground">Joined FlashLingua</p>
                        </div>
                    </div>
                    {stats.totalCards >= 10 ? (
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Card Collector</h4>
                                <p className="text-sm text-muted-foreground">Created 10+ cards</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 rounded-lg border p-4 opacity-50">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <BookOpen className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Card Collector</h4>
                                <p className="text-sm text-muted-foreground">Create 10 cards to unlock</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-4 rounded-lg border p-4 opacity-50">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Flame className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold">7 Day Streak</h4>
                            <p className="text-sm text-muted-foreground">Coming soon...</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg border p-4 opacity-50">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Star className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Master of 100</h4>
                            <p className="text-sm text-muted-foreground">Master 100 cards</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const EnhancedProgressPage = withObservables([], () => {
    const now = Date.now()
    return {
        totalCards: database.collections.get<CardModel>('cards').query().observeCount(),
        totalDecks: database.collections.get<Deck>('decks').query().observeCount(),
        // Cards with interval > 21 days are considered "mastered"
        masteredCards: database.collections.get<CardModel>('cards')
            .query(Q.where('interval', Q.gte(21))).observeCount(),
        // Cards due for review (nextReview <= now)
        dueCards: database.collections.get<CardModel>('cards')
            .query(Q.where('next_review', Q.lte(now))).observeCount(),
    }
})((props: { totalCards: number; totalDecks: number; masteredCards: number; dueCards: number }) => {
    const stats: ProgressStats = {
        totalCards: props.totalCards,
        totalDecks: props.totalDecks,
        masteredCards: props.masteredCards,
        dueCards: props.dueCards,
    }
    return <ProgressDashboard stats={stats} />
})

export default function ProgressPage() {
    return <EnhancedProgressPage />
}
