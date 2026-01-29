"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, XCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SpeakingCard {
    id: string
    text: string
    translation: string
}

const speakingCards: SpeakingCard[] = [
    { id: "1", text: "I would like to schedule a meeting", translation: "Saya ingin menjadwalkan rapat" },
    { id: "2", text: "Could you please send me the report?", translation: "Bisakah Anda mengirimkan laporannya?" },
    { id: "3", text: "Let me know if you have any questions", translation: "Beri tahu saya jika ada pertanyaan" },
    { id: "4", text: "I appreciate your help with this", translation: "Saya menghargai bantuan Anda" },
    { id: "5", text: "We need to discuss the budget", translation: "Kita perlu membahas anggaran" },
]

export default function SpeakingPage() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
    const [score, setScore] = useState(0)
    const [attempts, setAttempts] = useState(0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)

    const currentCard = speakingCards[currentIndex]
    const progress = ((currentIndex) / speakingCards.length) * 100

    useEffect(() => {
        // Initialize Speech Recognition
        if (typeof window !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognitionAPI) {
                recognitionRef.current = new SpeechRecognitionAPI()
                recognitionRef.current.continuous = false
                recognitionRef.current.interimResults = true
                recognitionRef.current.lang = "en-US"

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognitionRef.current.onresult = (event: any) => {
                    const current = event.resultIndex
                    const result = event.results[current][0].transcript
                    setTranscript(result)
                }

                recognitionRef.current.onend = () => {
                    setIsListening(false)
                }
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "en-US"
        utterance.rate = 0.85
        speechSynthesis.speak(utterance)
    }

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech Recognition is not supported in your browser. Try Chrome!")
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            setTranscript("")
            setFeedback(null)
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    const checkAnswer = () => {
        setAttempts(attempts + 1)
        const similarity = calculateSimilarity(
            transcript.toLowerCase().trim(),
            currentCard.text.toLowerCase().trim()
        )

        if (similarity >= 0.7) {
            setFeedback("correct")
            setScore(score + 1)
        } else {
            setFeedback("incorrect")
        }
    }

    const calculateSimilarity = (str1: string, str2: string): number => {
        // Simple word-based similarity
        const words1 = str1.split(" ").filter(Boolean)
        const words2 = str2.split(" ").filter(Boolean)

        let matches = 0
        words1.forEach(word => {
            if (words2.some(w => w.includes(word) || word.includes(w))) {
                matches++
            }
        })

        return matches / Math.max(words1.length, words2.length)
    }

    const nextCard = () => {
        if (currentIndex < speakingCards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setTranscript("")
            setFeedback(null)
        }
    }

    const resetDrill = () => {
        setCurrentIndex(0)
        setTranscript("")
        setFeedback(null)
        setScore(0)
        setAttempts(0)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Speaking Drill</h1>
                    <p className="text-muted-foreground">
                        Practice {currentIndex + 1} of {speakingCards.length}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{score}/{attempts}</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                </div>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2" />

            {/* Target Phrase */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Say this phrase:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-primary/5 p-6 text-center">
                        <p className="text-2xl font-medium">{currentCard.text}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {currentCard.translation}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => speakText(currentCard.text)}
                    >
                        <Volume2 className="h-4 w-4" />
                        Listen to Native Speaker
                    </Button>
                </CardContent>
            </Card>

            {/* Recording Section */}
            <Card>
                <CardContent className="py-8">
                    <div className="flex flex-col items-center space-y-6">
                        {/* Mic Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleListening}
                            className={`flex h-24 w-24 items-center justify-center rounded-full transition-colors ${isListening
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                        >
                            {isListening ? (
                                <MicOff className="h-10 w-10" />
                            ) : (
                                <Mic className="h-10 w-10" />
                            )}
                        </motion.button>
                        <p className="text-sm text-muted-foreground">
                            {isListening ? "Listening... Click to stop" : "Click to start speaking"}
                        </p>

                        {/* Transcript */}
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full rounded-lg border bg-muted/50 p-4 text-center"
                            >
                                <p className="text-sm text-muted-foreground mb-1">Your speech:</p>
                                <p className="text-lg font-medium">{transcript}</p>
                            </motion.div>
                        )}

                        {/* Feedback */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`flex items-center gap-2 rounded-full px-6 py-3 ${feedback === "correct"
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-red-500/10 text-red-500"
                                        }`}
                                >
                                    {feedback === "correct" ? (
                                        <>
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">Great pronunciation!</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5" />
                                            <span className="font-medium">Try again!</span>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex gap-3">
                {transcript && !feedback && (
                    <Button onClick={checkAnswer} className="flex-1">
                        Check Pronunciation
                    </Button>
                )}
                {feedback === "correct" && currentIndex < speakingCards.length - 1 && (
                    <Button onClick={nextCard} className="flex-1 gap-2">
                        Next Phrase
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
                {feedback === "incorrect" && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setTranscript("")
                            setFeedback(null)
                        }}
                        className="flex-1 gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                )}
                {currentIndex === speakingCards.length - 1 && feedback === "correct" && (
                    <Button onClick={resetDrill} className="flex-1">
                        Complete! Start Over
                    </Button>
                )}
            </div>
        </div>
    )
}
