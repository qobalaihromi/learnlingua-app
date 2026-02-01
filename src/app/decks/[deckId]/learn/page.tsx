"use client"

import { useState, useEffect, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import { ArrowLeft, Check, X, Sparkles, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

// Generate wrong options from other cards
const generateOptions = (correctCard: CardModel, allCards: CardModel[], count: number = 4): string[] => {
    const wrongOptions = allCards
        .filter(c => c.id !== correctCard.id)
        .map(c => c.back)

    const shuffledWrong = shuffleArray(wrongOptions).slice(0, count - 1)
    const options = [...shuffledWrong, correctCard.back]
    return shuffleArray(options)
}

// Option Button Component
const OptionButton = ({
    option,
    isSelected,
    isCorrect,
    showResult,
    onClick
}: {
    option: string
    isSelected: boolean
    isCorrect: boolean
    showResult: boolean
    onClick: () => void
}) => {
    let className = "w-full p-4 text-left rounded-lg border-2 transition-all "

    if (showResult) {
        if (isCorrect) {
            className += "border-green-500 bg-green-50 dark:bg-green-950"
        } else if (isSelected && !isCorrect) {
            className += "border-red-500 bg-red-50 dark:bg-red-950"
        } else {
            className += "border-muted opacity-50"
        }
    } else if (isSelected) {
        className += "border-primary bg-primary/5"
    } else {
        className += "border-border hover:border-primary/50 hover:bg-muted/50"
    }

    return (
        <motion.button
            whileHover={showResult ? {} : { scale: 1.01 }}
            whileTap={showResult ? {} : { scale: 0.99 }}
            className={className}
            onClick={onClick}
            disabled={showResult}
        >
            <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showResult && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-600" />}
            </div>
        </motion.button>
    )
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
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-6">
                You answered {correct} out of {total} correctly
            </p>

            <div className="w-64 mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span>Score</span>
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
                    Try Again
                </Button>
            </div>
        </motion.div>
    )
}

// Main Learn Session Component
const LearnSession = ({ deck, cards }: { deck: Deck; cards: CardModel[] }) => {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [correctCount, setCorrectCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [studyCards, setStudyCards] = useState<CardModel[]>([])
    const [options, setOptions] = useState<string[]>([])

    // Initialize study cards (shuffle)
    useEffect(() => {
        if (cards.length >= 4) {
            const shuffled = shuffleArray(cards)
            setStudyCards(shuffled)
        } else {
            setStudyCards(cards)
        }
    }, [cards])

    // Generate options when current card changes
    useEffect(() => {
        if (studyCards.length > 0 && currentIndex < studyCards.length) {
            const currentCard = studyCards[currentIndex]
            const newOptions = generateOptions(currentCard, studyCards)
            setOptions(newOptions)
        }
    }, [currentIndex, studyCards])

    const currentCard = studyCards[currentIndex]
    const progress = studyCards.length > 0 ? ((currentIndex) / studyCards.length) * 100 : 0

    const handleOptionSelect = (option: string) => {
        if (showResult) return
        setSelectedOption(option)
    }

    const handleCheck = useCallback(async () => {
        if (!selectedOption || !currentCard) return

        setShowResult(true)
        const isCorrect = selectedOption === currentCard.back

        if (isCorrect) {
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
    }, [selectedOption, currentCard])

    const handleNext = () => {
        if (currentIndex < studyCards.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setSelectedOption(null)
            setShowResult(false)
        } else {
            setIsComplete(true)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isComplete) return

            if (e.key === 'Enter') {
                if (showResult) {
                    handleNext()
                } else if (selectedOption) {
                    handleCheck()
                }
            } else if (!showResult && options.length > 0) {
                const num = parseInt(e.key)
                if (num >= 1 && num <= options.length) {
                    setSelectedOption(options[num - 1])
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showResult, selectedOption, options, isComplete, handleCheck])

    const handleRestart = () => {
        const shuffled = shuffleArray(cards)
        setStudyCards(shuffled)
        setCurrentIndex(0)
        setSelectedOption(null)
        setShowResult(false)
        setCorrectCount(0)
        setIsComplete(false)
    }

    if (cards.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                    You need at least 4 cards to use Learn mode.
                </p>
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
                        <p className="text-sm text-muted-foreground">Learn Mode - Multiple Choice</p>
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
                                    <p className="text-sm text-muted-foreground mb-2">What is the meaning of:</p>
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

                    {/* Options */}
                    <div className="grid gap-3 md:grid-cols-2">
                        {options.map((option, index) => (
                            <OptionButton
                                key={`${currentCard.id}-${index}`}
                                option={option}
                                isSelected={selectedOption === option}
                                isCorrect={option === currentCard.back}
                                showResult={showResult}
                                onClick={() => handleOptionSelect(option)}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        {!showResult ? (
                            <Button
                                size="lg"
                                onClick={handleCheck}
                                disabled={!selectedOption}
                            >
                                Check Answer
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleNext}>
                                {currentIndex < studyCards.length - 1 ? 'Next Question' : 'See Results'}
                            </Button>
                        )}
                    </div>

                    {/* Keyboard Hints */}
                    <div className="text-center text-xs text-muted-foreground">
                        Keyboard: <kbd className="px-1 bg-muted rounded">1-4</kbd> select •
                        <kbd className="px-1 bg-muted rounded ml-1">Enter</kbd> check/next
                    </div>
                </div>
            ) : null}
        </div>
    )
}

// Enhanced with WatermelonDB observables
const EnhancedLearnSession = withObservables(['deckId'], ({ deckId }: { deckId: string }) => ({
    deck: database.collections.get<Deck>('decks').findAndObserve(deckId),
    cards: database.collections.get<CardModel>('cards')
        .query(Q.where('deck_id', deckId))
        .observe(),
}))(LearnSession)

// Page Component
export default function LearnPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params)

    return <EnhancedLearnSession deckId={deckId} />
}
