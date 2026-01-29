"use client"

import Link from "next/link"
import { BookOpen, Dumbbell, Flame, Target, TrendingUp, Calendar, Trophy, Clock } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap"
import { SkillRadar } from "@/components/dashboard/SkillRadar"

const stats = [
  { label: "Total Cards", value: "234", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Cards Due", value: "38", icon: Target, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Day Streak", value: "7", icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Weekly Progress", value: "+23%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
]

const achievements = [
  { name: "First Steps", description: "Complete your first lesson", icon: "🎯", unlocked: true },
  { name: "Week Warrior", description: "7 day streak", icon: "🔥", unlocked: true },
  { name: "Vocabulary Master", description: "Learn 100 words", icon: "📚", unlocked: true },
  { name: "Speaking Pro", description: "Complete 50 speaking drills", icon: "🎤", unlocked: false },
]

const recentActivity = [
  { date: "Today", action: "Reviewed 15 cards", deck: "Business English", time: "10 min ago" },
  { date: "Today", action: "Speaking drill completed", deck: "Daily Conversations", time: "1 hr ago" },
  { date: "Yesterday", action: "Added 5 new cards", deck: "Tech Vocabulary", time: "Yesterday" },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your language journey?
          </p>
        </div>
        <Link href="/gym">
          <Button size="lg" className="gap-2">
            <Dumbbell className="h-5 w-5" />
            Start Training
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activity Overview
          </CardTitle>
          <CardDescription>Your learning consistency over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Progress</CardTitle>
            <CardDescription>Your language abilities at a glance</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SkillRadar />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 border-l-2 border-primary/20 pl-4 hover:border-primary transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.deck}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <CardDescription>Milestones in your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center p-4 rounded-lg border text-center transition-all ${achievement.unlocked
                    ? "bg-primary/5 border-primary/20"
                    : "opacity-50 grayscale"
                  }`}
              >
                <span className="text-3xl mb-2">{achievement.icon}</span>
                <p className="font-medium text-sm">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">
              Ready for your daily practice?
            </h3>
            <p className="text-muted-foreground">
              You have 38 cards waiting for review. Let&apos;s keep the streak going!
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/library">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Library
              </Button>
            </Link>
            <Link href="/gym">
              <Button className="gap-2">
                <Dumbbell className="h-4 w-4" />
                Start Gym
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
