"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import {
    ArrowLeft,
    Plus,
    BookOpen,
    Brain,
    Keyboard,
    Zap,
    MoreVertical,
    Trash2,
    Download,
    Upload,
    Target,
    TrendingUp,
    Clock,
    Play
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import CardModel from "@/model/Card"

import { StatsCard } from "@/components/deck/StatsCard"
import { StudyModeCard } from "@/components/deck/StudyModeCard"
import { CardsList } from "@/components/deck/CardsList"
import { AddCardDialog } from "@/components/deck/AddCardDialog"
import { useDeckImportExport } from "@/hooks/useDeckImportExport"

interface DeckHubContentProps {
    deck: Deck
    cardCount: number
    masteredCount: number
    dueCount: number
}

// Deck Hub Component
const DeckHubContent = ({
    deck,
    cardCount,
    masteredCount,
    dueCount
}: DeckHubContentProps) => {
    const router = useRouter()
    const [isAddCardOpen, setIsAddCardOpen] = useState(false)
    const { fileInputRef, handleExport, handleImport, triggerImport } = useDeckImportExport(deck)

    const masteryRate = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0

    const studyModes = [
        {
            title: "Flashcards",
            description: "Classic flip cards with SRS",
            icon: BookOpen,
            href: `/decks/${deck.id}/flashcards`,
            color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
            disabled: false
        },
        {
            title: "Learn",
            description: "Multiple choice quiz",
            icon: Brain,
            href: `/decks/${deck.id}/learn`,
            color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
            disabled: false
        },
        {
            title: "Write",
            description: "Type the answer",
            icon: Keyboard,
            href: `/decks/${deck.id}/write`,
            color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
            disabled: false
        },
        {
            title: "Match",
            description: "Pair matching game",
            icon: Zap,
            href: `/decks/${deck.id}/match`,
            color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
            disabled: false
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
                        <p className="text-muted-foreground">
                            {cardCount} {cardCount === 1 ? 'card' : 'cards'} • {deck.language}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={handleExport}>
                                <Download className="h-4 w-4" />
                                Export Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={triggerImport}>
                                <Upload className="h-4 w-4" />
                                Import Cards
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" />
                                Delete Deck
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="gap-2" onClick={() => setIsAddCardOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add Card
                    </Button>
                </div>
            </div>

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
            />

            {/* Stats Overview */}
            {cardCount > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <StatsCard
                        icon={BookOpen}
                        label="Total Cards"
                        value={cardCount}
                        color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                    />
                    <StatsCard
                        icon={Target}
                        label="Mastered"
                        value={masteredCount}
                        color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    />
                    <StatsCard
                        icon={Clock}
                        label="Due Today"
                        value={dueCount}
                        color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        label="Mastery Rate"
                        value={`${masteryRate}%`}
                        color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    />
                </div>
            )}

            {/* Mastery Progress Bar */}
            {cardCount > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mastery Progress</span>
                        <span className="font-medium">{masteryRate}%</span>
                    </div>
                    <Progress value={masteryRate} className="h-2" />
                </div>
            )}

            {/* Study Modes */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Study Modes</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {studyModes.map((mode) => (
                        <StudyModeCard key={mode.title} {...mode} />
                    ))}
                </div>
            </div>

            {/* Quick Start */}
            {cardCount > 0 && (
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">Ready to practice?</h3>
                            <p className="text-muted-foreground">
                                {dueCount > 0
                                    ? `You have ${dueCount} cards due for review`
                                    : 'Start a quick flashcard session'
                                }
                            </p>
                        </div>
                        <Link href={`/decks/${deck.id}/flashcards`}>
                            <Button size="lg" className="gap-2">
                                <Play className="h-5 w-5" />
                                Start Now
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Cards List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Cards in this Deck</h2>
                <CardsList deckId={deck.id} />
            </div>

            {/* Add Card Dialog */}
            <AddCardDialog
                deck={deck}
                open={isAddCardOpen}
                onOpenChange={setIsAddCardOpen}
            />
        </div>
    )
}

// Enhanced with WatermelonDB observables
const EnhancedDeckHub = withObservables(['deckId'], ({ deckId }: { deckId: string }) => {
    const now = Date.now()
    return {
        deck: database.collections.get<Deck>('decks').findAndObserve(deckId),
        cardCount: database.collections.get<CardModel>('cards')
            .query(Q.where('deck_id', deckId))
            .observeCount(),
        masteredCount: database.collections.get<CardModel>('cards')
            .query(Q.where('deck_id', deckId), Q.where('interval', Q.gte(21)))
            .observeCount(),
        dueCount: database.collections.get<CardModel>('cards')
            .query(Q.where('deck_id', deckId), Q.where('next_review', Q.lte(now)))
            .observeCount(),
    }
})(DeckHubContent)

// Page Component
export default function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params)

    return <EnhancedDeckHub deckId={deckId} />
}
