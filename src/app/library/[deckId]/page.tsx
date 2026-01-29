"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Edit, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CardType {
    id: string
    front: string
    back: string
    type: "vocab" | "phrase" | "grammar"
}

// Mock data
const mockCards: CardType[] = [
    { id: "1", front: "Negotiate", back: "To discuss something to reach an agreement", type: "vocab" },
    { id: "2", front: "Let's circle back on this", back: "Let's discuss this again later", type: "phrase" },
    { id: "3", front: "Leverage", back: "To use something to maximum advantage", type: "vocab" },
]

export default function DeckDetailPage() {
    const params = useParams()
    const router = useRouter()
    const deckId = params.deckId as string

    const [cards, setCards] = useState<CardType[]>(mockCards)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCard, setNewCard] = useState<{ front: string; back: string; type: "vocab" | "phrase" | "grammar" }>({ front: "", back: "", type: "vocab" })

    const handleAddCard = () => {
        if (!newCard.front.trim() || !newCard.back.trim()) return

        const card: CardType = {
            id: Date.now().toString(),
            ...newCard,
        }

        setCards([...cards, card])
        setNewCard({ front: "", back: "", type: "vocab" })
        setIsAddOpen(false)
    }

    const handleDeleteCard = (id: string) => {
        setCards(cards.filter((card) => card.id !== id))
    }

    const speakWord = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "en-US"
        speechSynthesis.speak(utterance)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Business English</h1>
                    <p className="text-muted-foreground">{cards.length} cards</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Card
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Card</DialogTitle>
                            <DialogDescription>
                                Create a new flashcard for this deck.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Card Type</label>
                                <Tabs
                                    value={newCard.type}
                                    onValueChange={(v) => setNewCard({ ...newCard, type: v as "vocab" | "phrase" | "grammar" })}
                                >
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="vocab">📚 Vocab</TabsTrigger>
                                        <TabsTrigger value="phrase">💬 Phrase</TabsTrigger>
                                        <TabsTrigger value="grammar">📝 Grammar</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="front" className="text-sm font-medium">
                                    Front (Word/Phrase)
                                </label>
                                <Input
                                    id="front"
                                    placeholder="e.g., Negotiate"
                                    value={newCard.front}
                                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="back" className="text-sm font-medium">
                                    Back (Meaning/Translation)
                                </label>
                                <Input
                                    id="back"
                                    placeholder="e.g., To discuss something to reach an agreement"
                                    value={newCard.back}
                                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddCard}>Add Card</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button size="lg" className="flex-1">
                    🎯 Study Flashcards
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                    🎤 Speaking Drill
                </Button>
            </div>

            {/* Cards List */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Cards</h2>
                <AnimatePresence mode="popLayout">
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="group">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                                        {card.type === "vocab" && "📚"}
                                        {card.type === "phrase" && "💬"}
                                        {card.type === "grammar" && "📝"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{card.front}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {card.back}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => speakWord(card.front)}
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteCard(card.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {cards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            No cards yet. Add your first card!
                        </p>
                        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Card
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
