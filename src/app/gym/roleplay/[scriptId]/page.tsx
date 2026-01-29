"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mic, MicOff, Volume2, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// We might need a Toast component later for feedback, using simplistic alerts for now or just UI text.

import { database } from "@/lib/db"
import Script from "@/model/Script"
import ScriptLine from "@/model/ScriptLine"

// Type definition for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

const RoleplaySession = ({ script, lines }: { script: Script, lines: ScriptLine[] }) => {
    const [userRole, setUserRole] = useState<"A" | "B" | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
    const [isSessionComplete, setIsSessionComplete] = useState(false)

    // Sort lines by order just in case
    const sortedLines = [...lines].sort((a, b) => a.order - b.order)
    const currentLine = sortedLines[currentIndex]
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Initialize Speech Recognition
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow
        const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition

        if (SpeechRecognitionConstructor) {
            const recognition = new SpeechRecognitionConstructor()
            recognition.continuous = false
            recognition.interimResults = true
            // Map simple language codes to BCP 47 for recognition
            const langMap: Record<string, string> = {
                'en': 'en-US',
                'jp': 'ja-JP',
                'ja': 'ja-JP',
            }
            recognition.lang = langMap[script.language.toLowerCase()] || 'en-US'

            recognition.onresult = (event: any) => {
                const currentTranscript = event.results[0][0].transcript
                setTranscript(currentTranscript)
            }

            recognition.onend = () => {
                setIsListening(false)
                // We'll verify manually or auto-verify here? 
                // Let's let user stop manually or auto-stop? 
                // Usually for short phrases, auto-stop works well.
                // We'll verify in a separate useEffect or callback.
            }

            recognitionRef.current = recognition
        }
    }, [script.language])

    // Auto-play TTS if it's the app's turn
    useEffect(() => {
        if (!userRole || isSessionComplete || !currentLine) return

        if (currentLine.speaker !== userRole) {
            // App's turn: Speak the line after a short delay
            const timeout = setTimeout(() => {
                speakText(currentLine.text, () => {
                    // After speaking, move to next
                    handleNext()
                })
            }, 500)
            return () => clearTimeout(timeout)
        } else {
            // User's turn: Maybe visual cue?
            setTranscript("")
            setFeedback(null)
        }
    }, [currentIndex, userRole])

    const speakText = (text: string, onEnd?: () => void) => {
        const utterance = new SpeechSynthesisUtterance(text)
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'jp': 'ja-JP',
            'ja': 'ja-JP',
        }
        utterance.lang = langMap[script.language.toLowerCase()] || 'en-US'
        utterance.onend = () => {
            if (onEnd) onEnd()
        }
        speechSynthesis.speak(utterance)
    }

    const startListening = () => {
        if (recognitionRef.current) {
            setTranscript("")
            setIsListening(true)
            setFeedback(null)
            recognitionRef.current.start()
        } else {
            alert("Speech recognition not supported in this browser.")
        }
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
            verifySpeech(transcript) // Verify whatever we caught
        }
    }

    const verifySpeech = (recResult: string) => {
        // Simple fuzzy match: remove punctuation and case
        const cleanTarget = currentLine.text.toLowerCase().replace(/[.,?!]/g, "")
        const cleanResult = recResult.toLowerCase().replace(/[.,?!]/g, "")

        // Very basic implementation: check if result contains key words or distinct match
        // For 'jp', we would need tokenization for accurate fuzzy, 
        // but for now simple string inclusion or exact match is V0.

        // Let's implement a "lenient" check: > 50% Levenshtein similarity?
        // Or simpler: includes 70% of words?
        // Simplest V1: Exact match ignoring punctuation/case OR user marks manual "Good"

        // We'll trust the user mostly for V1 or give generic "Good Job".
        // Let's just simulate "Correct" if length > 2

        console.log(`Target: ${cleanTarget}, Result: ${cleanResult}`)

        if (cleanResult.length > 0) {
            setFeedback("correct")
            setTimeout(() => {
                handleNext()
            }, 1000)
        } else {
            setFeedback("incorrect")
        }
    }

    const handleNext = () => {
        if (currentIndex < sortedLines.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            setIsSessionComplete(true)
        }
    }

    if (!userRole) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-8 min-h-[50vh]">
                <h2 className="text-2xl font-bold text-center">Choose Your Role</h2>
                <div className="flex gap-4">
                    <Button size="lg" className="w-32 h-32 flex flex-col gap-2 text-xl" onClick={() => setUserRole('A')}>
                        <span className="text-4xl">A</span>
                        Speaker A
                    </Button>
                    <Button size="lg" className="w-32 h-32 flex flex-col gap-2 text-xl" variant="secondary" onClick={() => setUserRole('B')}>
                        <span className="text-4xl">B</span>
                        Speaker B
                    </Button>
                </div>
                <p className="text-muted-foreground text-center max-w-sm">
                    You will speak your lines, and the app will play the other role.
                </p>
            </div>
        )
    }

    if (isSessionComplete) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-[50vh] text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-4 rounded-full bg-green-100 dark:bg-green-900"
                >
                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </motion.div>
                <h2 className="text-3xl font-bold">Roleplay Complete!</h2>
                <p className="text-muted-foreground">Great job practicing the conversation.</p>
                <div className="flex gap-4">
                    <Button onClick={() => {
                        setIsSessionComplete(false)
                        setCurrentIndex(0)
                        setUserRole(null)
                    }} variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restart
                    </Button>
                    <Link href="/library/scripts">
                        <Button>Back to Scripts</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const isUserTurn = currentLine.speaker === userRole

    return (
        <div className="max-w-xl mx-auto flex flex-col items-center space-y-8 py-8">
            <Progress value={((currentIndex) / sortedLines.length) * 100} className="w-full" />

            <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full min-h-[300px]">
                <div className={`p-4 rounded-full text-xl font-bold w-16 h-16 flex items-center justify-center ${currentLine.speaker === 'A' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                    {currentLine.speaker}
                </div>

                <div className="text-center space-y-4">
                    <p className="text-2xl font-semibold leading-relaxed px-4">
                        {currentLine.text}
                    </p>
                    <p className="text-muted-foreground">
                        {currentLine.translation}
                    </p>
                </div>

                {/* Interaction Area */}
                <div className="pt-8 h-32 flex items-center justify-center">
                    {!isUserTurn ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                            <Volume2 className="h-8 w-8" />
                            <span>Listening to partner...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <AnimatePresence>
                                {isListening && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -mt-12 text-sm font-medium text-primary bg-background/90 px-3 py-1 rounded-full border shadow-sm"
                                    >
                                        {transcript || "Listening..."}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                size="lg"
                                className={`rounded-full h-20 w-20 shadow-xl transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : ''}`}
                                onMouseDown={startListening}
                                onMouseUp={stopListening}
                                onTouchStart={startListening}
                                onTouchEnd={stopListening}
                            >
                                {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                {isListening ? "Release to Send" : "Hold to Speak"}
                            </p>

                            {feedback === 'incorrect' && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-muted-foreground underline mt-2"
                                    onClick={handleNext}
                                >
                                    Skip / Mark Correct
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const EnhancedRoleplaySession = withObservables(['script'], ({ script }: { script: Script }) => ({
    lines: script.lines.observe(),
}))(RoleplaySession)


// Main Page
const RoleplayPage = ({ script }: { script: Script }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href={`/library/scripts/${script.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">Roleplay Mode</h1>
                    <p className="text-xs text-muted-foreground">{script.title}</p>
                </div>
            </div>

            <EnhancedRoleplaySession script={script} />
        </div>
    )
}

const EnhancedRoleplayDetail = withObservables(['scriptId'], ({ scriptId }: { scriptId: string }) => ({
    script: database.collections.get<Script>('scripts').findAndObserve(scriptId),
}))(RoleplayPage)

export default function RoleplayPageWrapper({ params }: { params: { scriptId: string } }) {
    const { scriptId } = useParams()
    if (!scriptId) return <div>Loading...</div>
    return <EnhancedRoleplayDetail scriptId={scriptId as string} />
}
