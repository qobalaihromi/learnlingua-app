"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Volume2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface DictationItem {
    id: string
    text: string
    audioText: string // Text to be spoken
}

const dictationItems: DictationItem[] = [
    { id: "1", text: "The meeting has been rescheduled", audioText: "The meeting has been rescheduled" },
    { id: "2", text: "Please review the attached document", audioText: "Please review the attached document" },
    { id: "3", text: "I will follow up with you tomorrow", audioText: "I will follow up with you tomorrow" },
    { id: "4", text: "Could you clarify the requirements?", audioText: "Could you clarify the requirements?" },
    { id: "5", text: "The deadline is next Friday", audioText: "The deadline is next Friday" },
]

export default function DictationPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userInput, setUserInput] = useState("")
    const [isPlaying, setIsPlaying] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [score, setScore] = useState(0)
    const [playCount, setPlayCount] = useState(0)

    const currentItem = dictationItems[currentIndex]
    const progress = ((currentIndex) / dictationItems.length) * 100

    const playAudio = () => {
        setIsPlaying(true)
        setPlayCount(playCount + 1)

        const utterance = new SpeechSynthesisUtterance(currentItem.audioText)
        utterance.lang = "en-US"
        utterance.rate = playCount === 0 ? 0.8 : 0.6 // Slower on repeat

        utterance.onend = () => {
            setIsPlaying(false)
        }

        speechSynthesis.speak(utterance)
    }

    const checkAnswer = () => {
        setShowResult(true)

        // Calculate similarity
        const similarity = calculateAccuracy(
            userInput.toLowerCase().trim(),
            currentItem.text.toLowerCase().trim()
        )

        if (similarity >= 80) {
            setScore(score + 1)
        }
    }

    const calculateAccuracy = (input: string, target: string): number => {
        const inputWords = input.split(" ").filter(Boolean)
        const targetWords = target.split(" ").filter(Boolean)

        let correct = 0
        targetWords.forEach((word, i) => {
            if (inputWords[i] && inputWords[i].replace(/[.,?!]/g, "") === word.replace(/[.,?!]/g, "")) {
                correct++
            }
        })

        return (correct / targetWords.length) * 100
    }

    const getWordComparison = () => {
        const inputWords = userInput.toLowerCase().trim().split(" ")
        const targetWords = currentItem.text.toLowerCase().trim().split(" ")

        return targetWords.map((word, i) => {
            const inputWord = inputWords[i] || ""
            const isCorrect = inputWord.replace(/[.,?!]/g, "") === word.replace(/[.,?!]/g, "")
            return { word, isCorrect, userWord: inputWord }
        })
    }

    const nextItem = () => {
        if (currentIndex < dictationItems.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setUserInput("")
            setShowResult(false)
            setPlayCount(0)
        }
    }

    const resetDrill = () => {
        setCurrentIndex(0)
        setUserInput("")
        setShowResult(false)
        setScore(0)
        setPlayCount(0)
    }

    const accuracy = showResult ? calculateAccuracy(
        userInput.toLowerCase().trim(),
        currentItem.text.toLowerCase().trim()
    ) : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dictation Mode</h1>
                    <p className="text-muted-foreground">
                        Exercise {currentIndex + 1} of {dictationItems.length}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{score}/{currentIndex + (showResult ? 1 : 0)}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                </div>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2" />

            {/* Audio Player */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Volume2 className="h-5 w-5" />
                        Listen and Type
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Play Button */}
                    <div className="flex justify-center">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={playAudio}
                            disabled={isPlaying}
                            className={`flex h-20 w-20 items-center justify-center rounded-full transition-colors ${isPlaying
                                    ? "bg-primary/50 cursor-not-allowed"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                        >
                            {isPlaying ? (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    <Volume2 className="h-8 w-8" />
                                </motion.div>
                            ) : (
                                <Play className="h-8 w-8 ml-1" />
                            )}
                        </motion.button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        {playCount === 0
                            ? "Click to play the audio"
                            : `Played ${playCount} time(s) - Click again for slower playback`}
                    </p>

                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type what you hear:</label>
                        <Input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type the sentence here..."
                            disabled={showResult}
                            className="text-lg"
                            onKeyDown={(e) => e.key === "Enter" && !showResult && userInput && checkAnswer()}
                        />
                    </div>

                    {/* Result */}
                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Accuracy */}
                                <div className={`flex items-center justify-center gap-2 rounded-full py-3 ${accuracy >= 80
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-red-500/10 text-red-500"
                                    }`}>
                                    {accuracy >= 80 ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <XCircle className="h-5 w-5" />
                                    )}
                                    <span className="font-medium">{Math.round(accuracy)}% Accuracy</span>
                                </div>

                                {/* Word Comparison */}
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-muted-foreground mb-2">Correct answer:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {getWordComparison().map((item, i) => (
                                            <span
                                                key={i}
                                                className={`px-2 py-1 rounded ${item.isCorrect
                                                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                    }`}
                                            >
                                                {item.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex gap-3">
                {!showResult && userInput && (
                    <Button onClick={checkAnswer} className="flex-1">
                        Check Answer
                    </Button>
                )}
                {showResult && currentIndex < dictationItems.length - 1 && (
                    <Button onClick={nextItem} className="flex-1 gap-2">
                        Next Exercise
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
                {showResult && currentIndex === dictationItems.length - 1 && (
                    <Button onClick={resetDrill} className="flex-1 gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Start Over
                    </Button>
                )}
            </div>
        </div>
    )
}
