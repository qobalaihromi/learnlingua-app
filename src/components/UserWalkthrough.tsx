"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, BookOpen, Dumbbell, GraduationCap, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WalkthroughStep {
    title: string
    description: string
    icon: React.ElementType
    color: string
}

const steps: WalkthroughStep[] = [
    {
        title: "Welcome to LinguaSpace! 🚀",
        description: "Your personal language learning gym. Learn vocabulary, practice speaking, and track your progress - all offline!",
        icon: BookOpen,
        color: "text-blue-500",
    },
    {
        title: "Build Your Library 📚",
        description: "Create decks for different topics - Business English, Daily Conversations, or any language you want to master.",
        icon: BookOpen,
        color: "text-green-500",
    },
    {
        title: "Study Anywhere 🌍",
        description: "Watch YouTube videos and read articles. Capture phrases and save words directly to your decks.",
        icon: GraduationCap,
        color: "text-purple-500",
    },
    {
        title: "Train at the Gym 💪",
        description: "Flashcard sprints, speaking drills, and dictation exercises. Practice makes perfect!",
        icon: Dumbbell,
        color: "text-orange-500",
    },
    {
        title: "Track Your Progress 📈",
        description: "Watch your skills grow with beautiful visualizations. Maintain your streak and unlock achievements!",
        icon: BarChart3,
        color: "text-pink-500",
    },
]

const WALKTHROUGH_KEY = "linguaspace_walkthrough_completed"

export function UserWalkthrough() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        // Check if walkthrough was completed
        const completed = localStorage.getItem(WALKTHROUGH_KEY)
        if (!completed) {
            // Delay to let the page load first
            const timer = setTimeout(() => setIsOpen(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        localStorage.setItem(WALKTHROUGH_KEY, "true")
        setIsOpen(false)
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleClose()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const step = steps[currentStep]
    const Icon = step.icon

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-md"
                    >
                        <Card className="border-2 border-primary/20 shadow-2xl">
                            <CardContent className="pt-8 pb-6 px-6">
                                {/* Close button */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Step indicator */}
                                <div className="flex justify-center gap-2 mb-8">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 rounded-full transition-all ${i === currentStep
                                                    ? "w-8 bg-primary"
                                                    : i < currentStep
                                                        ? "w-2 bg-primary/50"
                                                        : "w-2 bg-muted"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Icon */}
                                <motion.div
                                    key={currentStep}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className={`rounded-full bg-primary/10 p-6 ${step.color}`}>
                                        <Icon className="h-12 w-12" />
                                    </div>
                                </motion.div>

                                {/* Content */}
                                <motion.div
                                    key={`content-${currentStep}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center mb-8"
                                >
                                    <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </motion.div>

                                {/* Navigation */}
                                <div className="flex justify-between gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        disabled={currentStep === 0}
                                        className="flex-1"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Back
                                    </Button>
                                    <Button onClick={handleNext} className="flex-1">
                                        {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                                        {currentStep < steps.length - 1 && (
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        )}
                                    </Button>
                                </div>

                                {/* Skip */}
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Skip walkthrough
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
