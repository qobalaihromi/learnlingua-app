"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import { ArrowLeft, Sparkles, RotateCcw, Timer } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import CardModel from "@/model/Card"

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

type MatchTile = {
    id: string
    cardId: string
    text: string
    type: 'front' | 'back'
    isMatched: boolean
}

// Tile Component
const Tile = ({
    tile,
    isSelected,
    isWrong,
    onClick
}: {
    tile: MatchTile
    isSelected: boolean
    isWrong: boolean
    onClick: () => void
}) => {
    if (tile.isMatched) {
        return (
            <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="aspect-[4/3]"
            />
        )
    }

    let className = "aspect-[4/3] flex items-center justify-center p-4 text-center rounded-xl border-2 cursor-pointer transition-all font-medium "

    if (isWrong) {
        className += "border-red-500 bg-red-50 dark:bg-red-950 animate-shake"
    } else if (isSelected) {
        className += "border-primary bg-primary/10 shadow-lg scale-105"
    } else {
        className += "border-border bg-card hover:border-primary/50 hover:shadow-md"
    }

    return (
        <motion.button
            whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={className}
            onClick={onClick}
        >
            <span className={`text-sm md:text-base ${tile.type === 'front' ? 'text-primary font-semibold' : ''}`}>
                {tile.text}
            </span>
        </motion.button>
    )
}

// Completion Screen
const CompletionScreen = ({
    time,
    pairs,
    onRestart,
    onBack
}: {
    time: number
    pairs: number
    onRestart: () => void
    onBack: () => void
}) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-12"
        >
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">All Matched!</h2>
            <p className="text-muted-foreground mb-6">
                You matched all {pairs} pairs
            </p>

            <div className="flex items-center gap-2 text-2xl font-bold mb-8">
                <Timer className="h-6 w-6 text-muted-foreground" />
                <span>{formatTime(time)}</span>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Deck
                </Button>
                <Button onClick={onRestart}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Play Again
                </Button>
            </div>
        </motion.div>
    )
}

// Main Match Session Component
const MatchSession = ({ deck, cards }: { deck: Deck; cards: CardModel[] }) => {
    const router = useRouter()
    const [tiles, setTiles] = useState<MatchTile[]>([])
    const [selectedTile, setSelectedTile] = useState<MatchTile | null>(null)
    const [wrongPair, setWrongPair] = useState<string[]>([])
    const [isComplete, setIsComplete] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)

    // Initialize tiles
    useEffect(() => {
        if (cards.length > 0) {
            // Take up to 6 cards for the match game (12 tiles total)
            const selectedCards = shuffleArray(cards).slice(0, 6)

            const newTiles: MatchTile[] = []
            selectedCards.forEach(card => {
                newTiles.push({
                    id: `${card.id}-front`,
                    cardId: card.id,
                    text: card.front,
                    type: 'front',
                    isMatched: false
                })
                newTiles.push({
                    id: `${card.id}-back`,
                    cardId: card.id,
                    text: card.back,
                    type: 'back',
                    isMatched: false
                })
            })

            setTiles(shuffleArray(newTiles))
            setIsTimerRunning(true)
        }
    }, [cards])

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isTimerRunning && !isComplete) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isTimerRunning, isComplete])

    // Check for completion
    useEffect(() => {
        if (tiles.length > 0 && tiles.every(t => t.isMatched)) {
            setIsComplete(true)
            setIsTimerRunning(false)
        }
    }, [tiles])

    const handleTileClick = (tile: MatchTile) => {
        if (tile.isMatched || wrongPair.length > 0) return

        if (!selectedTile) {
            // First selection
            setSelectedTile(tile)
        } else if (selectedTile.id === tile.id) {
            // Deselect
            setSelectedTile(null)
        } else {
            // Check for match
            if (selectedTile.cardId === tile.cardId) {
                // Match found!
                setTiles(prev => prev.map(t =>
                    t.cardId === tile.cardId ? { ...t, isMatched: true } : t
                ))
                setSelectedTile(null)
            } else {
                // Wrong match
                setWrongPair([selectedTile.id, tile.id])
                setTimeout(() => {
                    setWrongPair([])
                    setSelectedTile(null)
                }, 500)
            }
        }
    }

    const handleRestart = () => {
        const selectedCards = shuffleArray(cards).slice(0, 6)

        const newTiles: MatchTile[] = []
        selectedCards.forEach(card => {
            newTiles.push({
                id: `${card.id}-front`,
                cardId: card.id,
                text: card.front,
                type: 'front',
                isMatched: false
            })
            newTiles.push({
                id: `${card.id}-back`,
                cardId: card.id,
                text: card.back,
                type: 'back',
                isMatched: false
            })
        })

        setTiles(shuffleArray(newTiles))
        setSelectedTile(null)
        setWrongPair([])
        setIsComplete(false)
        setElapsedTime(0)
        setIsTimerRunning(true)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const matchedCount = tiles.filter(t => t.isMatched).length / 2
    const totalPairs = tiles.length / 2

    if (cards.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                    You need at least 4 cards to play Match mode.
                </p>
                <Button variant="outline" onClick={() => router.push(`/decks/${deck.id}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Deck
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/decks/${deck.id}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{deck.name}</h1>
                        <p className="text-sm text-muted-foreground">Match Mode - Pair the Cards</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        {matchedCount} / {totalPairs} pairs
                    </div>
                    <div className="flex items-center gap-1 font-mono text-lg">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        {formatTime(elapsedTime)}
                    </div>
                </div>
            </div>

            {isComplete ? (
                <CompletionScreen
                    time={elapsedTime}
                    pairs={totalPairs}
                    onRestart={handleRestart}
                    onBack={() => router.push(`/decks/${deck.id}`)}
                />
            ) : (
                <>
                    {/* Game Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        <AnimatePresence>
                            {tiles.map(tile => (
                                <Tile
                                    key={tile.id}
                                    tile={tile}
                                    isSelected={selectedTile?.id === tile.id}
                                    isWrong={wrongPair.includes(tile.id)}
                                    onClick={() => handleTileClick(tile)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Instructions */}
                    <div className="text-center text-sm text-muted-foreground">
                        Click on two tiles to match the term with its definition
                    </div>
                </>
            )}
        </div>
    )
}

// Enhanced with WatermelonDB observables
const EnhancedMatchSession = withObservables(['deckId'], ({ deckId }: { deckId: string }) => ({
    deck: database.collections.get<Deck>('decks').findAndObserve(deckId),
    cards: database.collections.get<CardModel>('cards')
        .query(Q.where('deck_id', deckId))
        .observe(),
}))(MatchSession)

// Page Component
export default function MatchPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params)

    return <EnhancedMatchSession deckId={deckId} />
}
