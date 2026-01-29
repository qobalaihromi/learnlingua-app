"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, BookOpen, Trash2, Edit, MoreVertical, Globe, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import { useSpace } from "@/components/providers/SpaceContext"

// Common language suggestions
const languageSuggestions = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "jp", name: "Japanese", flag: "🇯🇵" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷" },
]

// Helper to get display name and flag
const getLanguageDisplay = (langCode: string) => {
    const found = languageSuggestions.find(l =>
        l.code.toLowerCase() === langCode.toLowerCase() ||
        l.name.toLowerCase() === langCode.toLowerCase()
    )
    if (found) {
        return { name: found.name, flag: found.flag }
    }
    return {
        name: langCode.charAt(0).toUpperCase() + langCode.slice(1),
        flag: "🌍"
    }
}

// Inner Component: Displays the list of decks
const DeckList = ({ decks }: { decks: Deck[] }) => {
    const handleDeleteDeck = async (deck: Deck) => {
        if (confirm(`Are you sure you want to delete "${deck.name}"?`)) {
            await database.write(async () => {
                await deck.deleteDeck()
            })
        }
    }

    if (decks.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 opacity-50 mb-4" />
                <h3 className="text-lg font-medium">No decks found</h3>
                <p>Create a new deck to get started!</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {decks.map((deck) => {
                    const langDisplay = getLanguageDisplay(deck.language)
                    return (
                        <motion.div
                            key={deck.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="group relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{deck.name}</CardTitle>
                                                <CardDescription>
                                                    {langDisplay.flag} {langDisplay.name}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive"
                                                    onClick={() => handleDeleteDeck(deck)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {/* We can query card count async or just show 'View' */}
                                            View Cards
                                        </span>
                                        <Link href={`/library/${deck.id}`}>
                                            <Button variant="secondary" size="sm">
                                                Study Now
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

const EnhancedDeckList = withObservables(['currentLanguage'], ({ currentLanguage }: { currentLanguage: string | null }) => {
    const collection = database.collections.get<Deck>('decks')
    const queries = []
    if (currentLanguage) {
        queries.push(Q.where('language', currentLanguage))
    }
    return {
        decks: collection.query(...queries).observe(),
    }
})(DeckList)

export default function LibraryPage() {
    const { currentLanguage } = useSpace()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newDeckName, setNewDeckName] = useState("")
    const [newDeckLanguage, setNewDeckLanguage] = useState("")

    const handleCreateDeck = async () => {
        if (!newDeckName.trim() || !newDeckLanguage.trim()) return

        await database.write(async () => {
            await database.collections.get<Deck>('decks').create(deck => {
                deck.name = newDeckName
                deck.language = newDeckLanguage.toLowerCase().trim()
                deck.createdAt = new Date()
            })
        })

        setNewDeckName("")
        setNewDeckLanguage("")
        setIsCreateOpen(false)
    }

    const handleSuggestionClick = (langCode: string) => {
        const lang = languageSuggestions.find(l => l.code === langCode)
        if (lang) {
            setNewDeckLanguage(lang.name)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Library</h1>
                    <p className="text-muted-foreground">
                        Manage your vocabulary decks and flashcards
                    </p>
                </div>

                <Link href="/library/scripts">
                    <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Scripts
                    </Button>
                </Link>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Deck
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Deck</DialogTitle>
                            <DialogDescription>
                                Add a new vocabulary deck to your library.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Deck Name
                                </label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Business German..."
                                    value={newDeckName}
                                    onChange={(e) => setNewDeckName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="language" className="text-sm font-medium">
                                    Language
                                </label>
                                <Input
                                    id="language"
                                    placeholder="e.g., German..."
                                    value={newDeckLanguage}
                                    onChange={(e) => setNewDeckLanguage(e.target.value)}
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {languageSuggestions.slice(0, 6).map((lang) => (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => handleSuggestionClick(lang.code)}
                                            className={`text-xs px-2 py-1 rounded-full border transition-colors ${newDeckLanguage.toLowerCase() === lang.name.toLowerCase()
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted hover:bg-muted/80 border-transparent"
                                                }`}
                                        >
                                            {lang.flag} {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateDeck}
                                disabled={!newDeckName.trim() || !newDeckLanguage.trim()}
                            >
                                Create Deck
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Decks - Filtering handled by WatermelonDB */}
            <EnhancedDeckList currentLanguage={currentLanguage} />
        </div>
    )
}
