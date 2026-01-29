"use client"

import { useState } from "react"
import Link from "next/link"
import { Play, Mic, Headphones, Shuffle, Target, Zap } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const trainingModes = [
    {
        id: "flashcards",
        name: "Flashcard Sprint",
        description: "Quick vocabulary review with spaced repetition",
        icon: Shuffle,
        color: "bg-blue-500/10 text-blue-500",
        stats: { due: 23, total: 150 },
        href: "/gym/flashcards",
    },
    {
        id: "speaking",
        name: "Speaking Drill",
        description: "Practice pronunciation and speaking fluency",
        icon: Mic,
        color: "bg-green-500/10 text-green-500",
        stats: { due: 10, total: 50 },
        href: "/gym/speaking",
    },
    {
        id: "listening",
        name: "Dictation Mode",
        description: "Improve listening by writing what you hear",
        icon: Headphones,
        color: "bg-purple-500/10 text-purple-500",
        stats: { due: 5, total: 30 },
        href: "/gym/dictation",
    },
]

export default function GymPage() {
    const [selectedMode, setSelectedMode] = useState<string | null>(null)
    const todayProgress = 65

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Training Gym</h1>
                <p className="text-muted-foreground">
                    Practice makes perfect. Choose your workout!
                </p>
            </div>

            {/* Today's Progress */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Today&apos;s Progress
                            </CardTitle>
                            <CardDescription>Keep up the momentum!</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">{todayProgress}%</p>
                            <p className="text-sm text-muted-foreground">Daily Goal</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Progress value={todayProgress} className="h-3" />
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">38</p>
                            <p className="text-xs text-muted-foreground">Cards Reviewed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">12</p>
                            <p className="text-xs text-muted-foreground">Speaking Drills</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-500">5</p>
                            <p className="text-xs text-muted-foreground">Dictations</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Training Modes */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Choose Your Workout
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {trainingModes.map((mode, index) => {
                        const Icon = mode.icon
                        return (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={mode.href}>
                                    <Card
                                        className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${selectedMode === mode.id ? "ring-2 ring-primary" : ""
                                            }`}
                                        onClick={() => setSelectedMode(mode.id)}
                                    >
                                        <CardHeader>
                                            <div className={`w-fit rounded-lg p-3 ${mode.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <CardTitle className="mt-3">{mode.name}</CardTitle>
                                            <CardDescription>{mode.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-2xl font-bold">{mode.stats.due}</span>
                                                    <span className="text-muted-foreground">/{mode.stats.total}</span>
                                                    <p className="text-xs text-muted-foreground">Cards due</p>
                                                </div>
                                                <Button size="sm" className="gap-2">
                                                    <Play className="h-4 w-4" />
                                                    Start
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <h3 className="text-lg font-semibold">🔥 7 Day Streak!</h3>
                        <p className="text-sm text-muted-foreground">
                            You&apos;re on fire! Keep learning every day.
                        </p>
                    </div>
                    <div className="text-4xl">🔥</div>
                </CardContent>
            </Card>
        </div>
    )
}
