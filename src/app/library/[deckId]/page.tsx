"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Edit, Volume2, Book, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { withObservables } from '@nozbe/watermelondb/react'
import ReactMarkdown from 'react-markdown'

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

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import CardModel from "@/model/Card"

// Inner Component: Displays the list of cards
const CardList = ({ cards, deck }: { cards: CardModel[], deck: Deck }) => {
    const [selectedCard, setSelectedCard] = useState<CardModel | null>(null)

    const handleDeleteCard = async (card: CardModel) => {
        if (confirm("Delete this card?")) {
            await database.write(async () => {
                await card.markAsDeleted()
            })
        }
    }

    const speakWord = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'jp': 'ja-JP',
            'ja': 'ja-JP',
            'de': 'de-DE',
            'fr': 'fr-FR',
            'es': 'es-ES',
            'zh': 'zh-CN',
            'ko': 'ko-KR',
            'id': 'id-ID'
        }
        utterance.lang = langMap[deck.language.toLowerCase()] || 'en-US'
        speechSynthesis.speak(utterance)
    }

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Cards ({cards.length})</h2>
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
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${card.type === 'grammar' ? 'bg-purple-100 text-purple-600' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {card.type === "vocab" && "📚"}
                                    {card.type === "phrase" && "💬"}
                                    {card.type === "grammar" && "📝"}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{card.front}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {card.type === 'grammar' ? "Grammar Pattern" : card.back}
                                    </p>
                                </div>

                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => speakWord(card.front)}
                                    >
                                        <Volume2 className="h-4 w-4" />
                                    </Button>

                                    {card.type === 'grammar' ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedCard(card)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCard(card)}
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
                </div>
            )}

            {/* Grammar View Dialog */}
            <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Book className="h-5 w-5 text-purple-500" />
                            {selectedCard?.front}
                        </DialogTitle>
                        <DialogDescription>
                            Grammar Pattern & Rules
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 prose dark:prose-invert max-w-none">
                        <ReactMarkdown>
                            {selectedCard?.back || ""}
                        </ReactMarkdown>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

const EnhancedCardList = withObservables(['deck'], ({ deck }: { deck: Deck }) => ({
    cards: deck.cards.observe(),
}))(CardList)


// Main Page Component
const DeckDetail = ({ deck }: { deck: Deck }) => {
    const router = useRouter()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCard, setNewCard] = useState<{ front: string; back: string; type: "vocab" | "phrase" | "grammar" }>({ front: "", back: "", type: "vocab" })

    const handleAddCard = async () => {
        if (!newCard.front.trim() || !newCard.back.trim()) return

        await database.write(async () => {
            await deck.addCard(newCard.front, newCard.back, newCard.type)
        })

        setNewCard({ front: "", back: "", type: "vocab" })
        setIsAddOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/library">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{deck.name}</h1>
                    <p className="text-muted-foreground capitalize">{deck.language} Deck</p>
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
                                    {newCard.type === 'grammar' ? "Grammar Pattern" : "Front (Word/Phrase)"}
                                </label>
                                <Input
                                    id="front"
                                    placeholder={newCard.type === 'grammar' ? "e.g. Verb-te + iru" : "e.g., Negotiate"}
                                    value={newCard.front}
                                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="back" className="text-sm font-medium">
                                    {newCard.type === 'grammar' ? "Explanation & Examples" : "Back (Meaning/Translation)"}
                                </label>
                                {newCard.type === 'grammar' ? (
                                    <textarea
                                        id="back"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Explain the grammar rule and provide examples..."
                                        value={newCard.back}
                                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                    />
                                ) : (
                                    <Input
                                        id="back"
                                        placeholder="e.g., To discuss something to reach an agreement"
                                        value={newCard.back}
                                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                    />
                                )}
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
                <Link href={`/gym/flashcards?deckId=${deck.id}`} className="flex-1">
                    <Button size="lg" className="w-full">
                        🎯 Study Flashcards
                    </Button>
                </Link>
                <Button size="lg" variant="outline" className="flex-1">
                    🎤 Speaking Drill
                </Button>
            </div>

            {/* Cards List */}
            <EnhancedCardList deck={deck} />
        </div>
    )
}

const EnhancedDeckDetail = withObservables(['deckId'], ({ deckId }: { deckId: string }) => ({
    deck: database.collections.get<Deck>('decks').findAndObserve(deckId),
}))(DeckDetail)

export default function DeckDetailPage({ params }: { params: { deckId: string } }) {
    const { deckId } = useParams()
    if (!deckId) return <div>Loading...</div>
    return <EnhancedDeckDetail deckId={deckId as string} />
}
