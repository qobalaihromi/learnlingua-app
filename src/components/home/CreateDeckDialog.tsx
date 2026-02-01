"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import { languageSuggestions } from "@/lib/constants"

interface CreateDeckDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const CreateDeckDialog = ({ open, onOpenChange }: CreateDeckDialogProps) => {
    const [name, setName] = useState("")
    const [language, setLanguage] = useState("")

    const handleCreateDeck = async () => {
        if (!name.trim() || !language.trim()) return

        await database.write(async () => {
            await database.collections.get<Deck>('decks').create(deck => {
                deck.name = name
                deck.language = language.toLowerCase().trim()
                deck.createdAt = new Date()
            })
        })

        setName("")
        setLanguage("")
        onOpenChange(false)
    }

    const handleSuggestionClick = (langCode: string) => {
        const lang = languageSuggestions.find(l => l.code === langCode)
        if (lang) {
            setLanguage(lang.name)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Deck</DialogTitle>
                    <DialogDescription>
                        Add a new flashcard deck to start learning.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Deck Name
                        </label>
                        <Input
                            id="name"
                            placeholder="e.g., JLPT N5 Vocabulary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="language" className="text-sm font-medium">
                            Language
                        </label>
                        <Input
                            id="language"
                            placeholder="e.g., Japanese"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {languageSuggestions.slice(0, 6).map((lang) => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => handleSuggestionClick(lang.code)}
                                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${language.toLowerCase() === lang.name.toLowerCase()
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateDeck}
                        disabled={!name.trim() || !language.trim()}
                    >
                        Create Deck
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
