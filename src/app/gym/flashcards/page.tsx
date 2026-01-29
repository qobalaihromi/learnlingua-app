"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, ThumbsUp, ThumbsDown, Volume2, ArrowRight, Trophy, Flame, ArrowLeft } from "lucide-react"
import confetti from "canvas-confetti"
import { withObservables } from '@nozbe/watermelondb/react'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { database } from "@/lib/db"
import CardModel from "@/model/Card"
import Deck from "@/model/Deck"

// Inner Component: Actual Flashcard Logic
const FlashcardSession = ({ cards, deck }: { cards: CardModel[], deck: Deck }) => {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [correctCount, setCorrectCount] = useState(0)
    const [incorrectCount, setIncorrectCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [streak, setStreak] = useState(0)

    const currentCard = cards[currentIndex]
    // Guard against empty deck
    if (!currentCard && !isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-muted-foreground">This deck has no cards yet.</p>
                <Link href={`/library/${deck.id}`}>
                    <Button>Add Cards</Button>
                </Link>
            </div>
        )
    }

    const progress = ((currentIndex) / cards.length) * 100

    const speakWord = useCallback((text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        // Simple mapping
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'jp': 'ja-JP',
            'de': 'de-DE',
            'fr': 'fr-FR',
            'es': 'es-ES',
            'zh': 'zh-CN',
            'ko': 'ko-KR',
            'id': 'id-ID'
        }
        utterance.lang = langMap[deck.language.toLowerCase()] || 'en-US'
        utterance.rate = 0.9
        speechSynthesis.speak(utterance)
    }, [deck.language])

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
        if (!isFlipped) {
            speakWord(currentCard.front)
        }
    }

    const handleResponse = async (correct: boolean) => {
        // Update DB (async fire-and-forget for UI responsiveness, or await if critical)
        database.write(async () => {
            await currentCard.updateReview(correct ? 5 : 1) // 5 = Easy/Good, 1 = Again
        })

        if (correct) {
            setCorrectCount(correctCount + 1)
            setStreak(streak + 1)

            // Celebration for streaks
            if (streak > 0 && (streak + 1) % 5 === 0) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            }
        } else {
            setIncorrectCount(incorrectCount + 1)
            setStreak(0)
        }

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        } else {
            setIsComplete(true)
            // Final celebration
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 }
            })
        }
    }

    const resetSession = () => {
        setCurrentIndex(0)
        setIsFlipped(false)
        setCorrectCount(0)
        setIncorrectCount(0)
        setIsComplete(false)
        setStreak(0)
    }

    // Completion screen
    if (isComplete) {
        const accuracy = Math.round((correctCount / cards.length) * 100)
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                >
                    <Trophy className="h-20 w-20 text-yellow-500" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold">Session Complete! 🎉</h1>
                    <p className="text-muted-foreground mt-2">Great job finishing your review</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-6 py-6"
                >
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{correctCount}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">{incorrectCount}</p>
                        <p className="text-sm text-muted-foreground">To Review</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{accuracy}%</p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                </motion.div>

                <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Deck
                    </Button>
                    <Button size="lg" onClick={resetSession} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Practice Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Flashcard Sprint</h1>
                    <p className="text-muted-foreground">
                        Card {currentIndex + 1} of {cards.length}
                    </p>
                </div>
                {streak >= 3 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-orange-500"
                    >
                        <Flame className="h-5 w-5" />
                        <span className="font-bold">{streak} Streak!</span>
                    </motion.div>
                )}
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2" />

            {/* Flashcard */}
            <div className="flex justify-center py-8">
                <div
                    className="perspective-1000 relative h-64 w-full max-w-md cursor-pointer"
                    onClick={handleFlip}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isFlipped ? "back" : "front"}
                            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Card className={`flex h-full items-center justify-center p-8 ${isFlipped
                                ? "bg-gradient-to-br from-primary/5 to-primary/10"
                                : "bg-gradient-to-br from-secondary/50 to-secondary"
                                }`}>
                                <CardContent className="text-center">
                                    <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                                        {isFlipped ? "Answer" : "Question"}
                                    </div>
                                    <p className="text-2xl font-semibold">
                                        {isFlipped ? currentCard.back : currentCard.front}
                                    </p>
                                    <div className="mt-4 flex justify-center gap-2">
                                        <span className={`rounded-full px-2 py-1 text-xs ${currentCard.type === "vocab" ? "bg-blue-500/10 text-blue-500" :
                                            currentCard.type === "phrase" ? "bg-green-500/10 text-green-500" :
                                                "bg-purple-500/10 text-purple-500"
                                            }`}>
                                            {currentCard.type}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                {!isFlipped ? (
                    <>
                        <Button variant="outline" size="lg" onClick={(e) => {
                            e.stopPropagation();
                            speakWord(currentCard.front);
                        }}>
                            <Volume2 className="h-5 w-5" />
                        </Button>
                        <Button size="lg" onClick={handleFlip} className="gap-2 px-8">
                            Reveal Answer
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleResponse(false)}
                            className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                        >
                            <ThumbsDown className="h-5 w-5" />
                            Again
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => handleResponse(true)}
                            className="gap-2 bg-green-500 hover:bg-green-600"
                        >
                            <ThumbsUp className="h-5 w-5" />
                            Got It!
                        </Button>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    {correctCount} correct
                </span>
                <span className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    {incorrectCount} to review
                </span>
            </div>
        </div>
    )
}


const EnhancedFlashcardSession = withObservables(['deckId'], ({ deckId }: { deckId: string }) => {
    const deck = database.collections.get<Deck>('decks').findAndObserve(deckId)
    // We observe `deck.cards`
    // Note: WatermelonDB doesn't easily let you just "pass through" a prop to a query in the same component definition without some HOC nesting or trickery.
    // Standard pattern: Get deck, pass to child. Child observes cards.
    // OR we can do a complex observable here.
    return {
        deck: deck,
    }
})(({ deck }: { deck: Deck }) => <EnhancedCardList deck={deck} />)

// We need two layers because `deck` is async.
const EnhancedCardList = withObservables(['deck'], ({ deck }: { deck: Deck }) => ({
    cards: deck.cards.observe(),
}))(FlashcardSession)


export default function FlashcardsPage() {
    const searchParams = useSearchParams()
    const deckId = searchParams.get("deckId")

    if (!deckId) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">No deck selected.</p>
            </div>
        )
    }

    return <EnhancedFlashcardSession deckId={deckId} />
}
