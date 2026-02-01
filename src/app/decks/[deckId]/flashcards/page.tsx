"use client"

import { useState, useEffect, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import { ArrowLeft, RotateCcw, Volume2, Check, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import CardModel from "@/model/Card"

// Flashcard Component
const Flashcard = ({
    card,
    isFlipped,
    onFlip
}: {
    card: CardModel
    isFlipped: boolean
    onFlip: () => void
}) => {
    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            speechSynthesis.speak(utterance)
        }
    }

    return (
        <div
            className="perspective-1000 cursor-pointer w-full max-w-lg mx-auto"
            onClick={onFlip}
        >
            <motion.div
                className="relative h-72 w-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front */}
                <Card className="absolute inset-0 backface-hidden border-2">
                    <CardContent className="h-full flex flex-col items-center justify-center p-6">
                        <p className="text-3xl font-bold text-center">{card.front}</p>
                        {card.example && (
                            <p className="text-sm text-muted-foreground mt-4 text-center italic">
                                "{card.example}"
                            </p>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mt-4"
                            onClick={(e) => {
                                e.stopPropagation()
                                speakText(card.front)
                            }}
                        >
                            <Volume2 className="h-5 w-5" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">Tap to reveal</p>
                    </CardContent>
                </Card>

                {/* Back */}
                <Card
                    className="absolute inset-0 backface-hidden border-2 border-primary/50"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6">
                        <p className="text-3xl font-bold text-center text-primary">{card.back}</p>
                        {card.exampleTranslation && (
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                {card.exampleTranslation}
                            </p>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mt-4"
                            onClick={(e) => {
                                e.stopPropagation()
                                speakText(card.back)
                            }}
                        >
                            <Volume2 className="h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

// Rating Buttons
const RatingButtons = ({ onRate, disabled }: { onRate: (rating: number) => void; disabled: boolean }) => (
    <div className="flex gap-3 justify-center">
        <Button
            variant="outline"
            size="lg"
            className="gap-2 border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => onRate(1)}
            disabled={disabled}
        >
            <X className="h-5 w-5" />
            Again
        </Button>
        <Button
            variant="outline"
            size="lg"
            className="gap-2 border-yellow-500/50 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
            onClick={() => onRate(3)}
            disabled={disabled}
        >
            Hard
        </Button>
        <Button
            variant="outline"
            size="lg"
            className="gap-2 border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => onRate(4)}
            disabled={disabled}
        >
            Good
        </Button>
        <Button
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => onRate(5)}
            disabled={disabled}
        >
            <Check className="h-5 w-5" />
            Easy
        </Button>
    </div>
)

// Completion Screen
const CompletionScreen = ({
    correct,
    total,
    onRestart,
    onBack
}: {
    correct: number
    total: number
    onRestart: () => void
    onBack: () => void
}) => {
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-12"
        >
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-6">
                You reviewed {total} cards
            </p>

            <div className="w-64 mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span>Accuracy</span>
                    <span className="font-semibold">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-600">{correct}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-600">{total - correct}</p>
                    <p className="text-sm text-muted-foreground">To Review</p>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Deck
                </Button>
                <Button onClick={onRestart}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Study Again
                </Button>
            </div>
        </motion.div>
    )
}

// Main Flashcard Session Component
const FlashcardSession = ({ deck, cards }: { deck: Deck; cards: CardModel[] }) => {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [correctCount, setCorrectCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [studyCards, setStudyCards] = useState<CardModel[]>([])

    // Initialize study cards (shuffle)
    useEffect(() => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5)
        setStudyCards(shuffled)
    }, [cards])

    const currentCard = studyCards[currentIndex]
    const progress = studyCards.length > 0 ? ((currentIndex) / studyCards.length) * 100 : 0

    const handleRate = useCallback(async (rating: number) => {
        if (!currentCard) return

        // Update SRS in database
        await database.write(async () => {
            await currentCard.updateReview(rating)
        })

        if (rating >= 3) {
            setCorrectCount(prev => prev + 1)
        }

        // Move to next card
        if (currentIndex < studyCards.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setIsFlipped(false)
        } else {
            setIsComplete(true)
        }
    }, [currentCard, currentIndex, studyCards.length])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isComplete) return

            if (e.code === 'Space') {
                e.preventDefault()
                setIsFlipped(prev => !prev)
            } else if (isFlipped) {
                if (e.key === '1') handleRate(1)
                else if (e.key === '2') handleRate(3)
                else if (e.key === '3') handleRate(4)
                else if (e.key === '4') handleRate(5)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFlipped, isComplete, handleRate])

    const handleRestart = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5)
        setStudyCards(shuffled)
        setCurrentIndex(0)
        setIsFlipped(false)
        setCorrectCount(0)
        setIsComplete(false)
    }

    if (studyCards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No cards to study in this deck.</p>
                <Button variant="outline" onClick={() => router.push(`/decks/${deck.id}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Deck
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/decks/${deck.id}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{deck.name}</h1>
                        <p className="text-sm text-muted-foreground">Flashcard Session</p>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {studyCards.length}
                </div>
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="h-2" />

            {isComplete ? (
                <CompletionScreen
                    correct={correctCount}
                    total={studyCards.length}
                    onRestart={handleRestart}
                    onBack={() => router.push(`/decks/${deck.id}`)}
                />
            ) : currentCard ? (
                <div className="space-y-8">
                    {/* Flashcard */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <Flashcard
                                card={currentCard}
                                isFlipped={isFlipped}
                                onFlip={() => setIsFlipped(prev => !prev)}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Rating or Flip Prompt */}
                    <div className="text-center">
                        {isFlipped ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">How well did you know this?</p>
                                <RatingButtons onRate={handleRate} disabled={false} />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd> or tap card to flip
                            </p>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Keyboard Hints */}
            {!isComplete && (
                <div className="text-center text-xs text-muted-foreground">
                    Keyboard: <kbd className="px-1 bg-muted rounded">Space</kbd> flip •
                    <kbd className="px-1 bg-muted rounded ml-1">1</kbd> again •
                    <kbd className="px-1 bg-muted rounded ml-1">2</kbd> hard •
                    <kbd className="px-1 bg-muted rounded ml-1">3</kbd> good •
                    <kbd className="px-1 bg-muted rounded ml-1">4</kbd> easy
                </div>
            )}
        </div>
    )
}

// Enhanced with WatermelonDB observables
const EnhancedFlashcardSession = withObservables(['deckId'], ({ deckId }: { deckId: string }) => ({
    deck: database.collections.get<Deck>('decks').findAndObserve(deckId),
    cards: database.collections.get<CardModel>('cards')
        .query(Q.where('deck_id', deckId))
        .observe(),
}))(FlashcardSession)

// Page Component
export default function FlashcardsPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params)

    return <EnhancedFlashcardSession deckId={deckId} />
}
