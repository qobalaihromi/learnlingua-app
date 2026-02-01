"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { DeckList } from "@/components/home/DeckList"
import { CreateDeckDialog } from "@/components/home/CreateDeckDialog"

function HomePageContent() {
  const searchParams = useSearchParams()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Open create dialog if ?create=true in URL
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
          <p className="text-muted-foreground">
            Build your vocabulary with flashcards
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search decks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="gap-2 shrink-0" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Deck</span>
          </Button>
        </div>
      </div>

      {/* Quick Tips for Empty State */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Pro tip: Spaced Repetition</p>
            <p className="text-sm text-muted-foreground">
              Our SRS algorithm shows cards at optimal intervals for long-term memory!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Decks Grid */}
      <DeckList searchQuery={searchQuery} />

      {/* Create Deck Dialog */}
      <CreateDeckDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <HomePageContent />
    </Suspense>
  )
}
