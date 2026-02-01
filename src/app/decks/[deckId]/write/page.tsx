"use client"

import { useState, useEffect, use, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import { ArrowLeft, Check, X, Sparkles, RotateCcw, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

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

// Normalize string for comparison (lowercase, trim, remove extra spaces)
const normalizeAnswer = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

// Check if answer is correct (with some flexibility)
const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const normalized = normalizeAnswer(userAnswer)
    const correct = normalizeAnswer(correctAnswer)
    return normalized === correct
}

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
            <h2 className="text-3xl font-bold mb-2">Writing Practice Complete!</h2>
            <p className="text-muted-foreground mb-6">
                You typed {correct} out of {total} correctly
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
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Deck
                </Button>
                <Button onClick={onRestart}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Practice Again
                </Button>
            </div>
        </motion.div>
    )
}

// Main Write Session Component
const WriteSession = ({ deck, cards }: { deck: Deck; cards: CardModel[] }) => {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [showResult, setShowResult] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [correctCount, setCorrectCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [studyCards, setStudyCards] = useState<CardModel[]>([])
    const [showHint, setShowHint] = useState(false)

    // Initialize study cards (shuffle)
    useEffect(() => {
        const shuffled = shuffleArray(cards)
        setStudyCards(shuffled)
    }, [cards])

    // Focus input on mount and card change
    useEffect(() => {
        if (!showResult && inputRef.current) {
            inputRef.current.focus()
        }
    }, [currentIndex, showResult])

    const currentCard = studyCards[currentIndex]
    const progress = studyCards.length > 0 ? ((currentIndex) / studyCards.length) * 100 : 0

    const handleCheck = useCallback(async () => {
        if (!currentCard || !userAnswer.trim()) return

        const correct = checkAnswer(userAnswer, currentCard.back)
        setIsCorrect(correct)
        setShowResult(true)

        if (correct) {
            setCorrectCount(prev => prev + 1)
            // Update SRS with good rating
            await database.write(async () => {
                await currentCard.updateReview(4)
            })
        } else {
            // Update SRS with bad rating
            await database.write(async () => {
                await currentCard.updateReview(1)
            })
        }
    }, [userAnswer, currentCard])

    const handleNext = () => {
        if (currentIndex < studyCards.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setUserAnswer("")
            setShowResult(false)
            setIsCorrect(false)
            setShowHint(false)
        } else {
            setIsComplete(true)
        }
    }

    const handleOverride = async () => {
        // User says they were actually correct
        setIsCorrect(true)
        setCorrectCount(prev => prev + 1)
        if (currentCard) {
            await database.write(async () => {
                await currentCard.updateReview(3) // Give it a "hard" rating as override
            })
        }
    }

    // Keyboard shortcut for Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (showResult) {
                handleNext()
            } else if (userAnswer.trim()) {
                handleCheck()
            }
        }
    }

    const handleRestart = () => {
        const shuffled = shuffleArray(cards)
        setStudyCards(shuffled)
        setCurrentIndex(0)
        setUserAnswer("")
        setShowResult(false)
        setIsCorrect(false)
        setCorrectCount(0)
        setIsComplete(false)
        setShowHint(false)
    }

    // Generate hint (first letter + underscores)
    const getHint = (answer: string): string => {
        if (answer.length <= 1) return answer[0] || ''
        return answer[0] + '_'.repeat(answer.length - 1)
    }

    if (studyCards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No cards to practice in this deck.</p>
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
                        <p className="text-sm text-muted-foreground">Write Mode - Type the Answer</p>
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
                <div className="space-y-8 max-w-xl mx-auto">
                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="border-2">
                                <CardContent className="p-8 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Type the translation for:</p>
                                    <p className="text-3xl font-bold">{currentCard.front}</p>
                                    {currentCard.example && (
                                        <p className="text-sm text-muted-foreground mt-4 italic">
                                            "{currentCard.example}"
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    {/* Answer Input */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                                ref={inputRef}
                                placeholder="Type your answer..."
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={showResult}
                                className={`text-lg py-6 pr-12 ${showResult
                                        ? isCorrect
                                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                            : 'border-red-500 bg-red-50 dark:bg-red-950'
                                        : ''
                                    }`}
                            />
                            {showResult && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {isCorrect ? (
                                        <Check className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <X className="h-6 w-6 text-red-600" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hint Button */}
                        {!showResult && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowHint(!showHint)}
                                    className="gap-2 text-muted-foreground"
                                >
                                    {showHint ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {showHint ? 'Hide Hint' : 'Show Hint'}
                                </Button>
                            </div>
                        )}

                        {showHint && !showResult && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-muted-foreground font-mono"
                            >
                                Hint: {getHint(currentCard.back)}
                            </motion.p>
                        )}

                        {/* Result Feedback */}
                        {showResult && !isCorrect && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-2"
                            >
                                <p className="text-sm text-muted-foreground">Correct answer:</p>
                                <p className="text-xl font-semibold text-green-600">{currentCard.back}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleOverride}
                                    className="text-xs text-muted-foreground"
                                >
                                    Override: I was correct
                                </Button>
                            </motion.div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        {!showResult ? (
                            <Button
                                size="lg"
                                onClick={handleCheck}
                                disabled={!userAnswer.trim()}
                            >
                                Check Answer
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleNext}>
                                {currentIndex < studyCards.length - 1 ? 'Next Card' : 'See Results'}
                            </Button>
                        )}
                    </div>

                    {/* Keyboard Hints */}
                    <div className="text-center text-xs text-muted-foreground">
                        Press <kbd className="px-1 bg-muted rounded">Enter</kbd> to check/continue
                    </div>
                </div>
            ) : null}
        </div>
    )
}

// Enhanced with WatermelonDB observables
const EnhancedWriteSession = withObservables(['deckId'], ({ deckId }: { deckId: string }) => ({
    deck: database.collections.get<Deck>('decks').findAndObserve(deckId),
    cards: database.collections.get<CardModel>('cards')
        .query(Q.where('deck_id', deckId))
        .observe(),
}))(WriteSession)

// Page Component
export default function WritePage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params)

    return <EnhancedWriteSession deckId={deckId} />
}
