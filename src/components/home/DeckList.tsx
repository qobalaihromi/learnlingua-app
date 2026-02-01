"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { withObservables } from '@nozbe/watermelondb/react'
import { BookOpen, MoreVertical, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import { getLanguageDisplay } from "@/lib/constants"

interface DeckListProps {
    decks: Deck[]
    searchQuery?: string
}

const DeckListComponent = ({ decks, searchQuery = "" }: DeckListProps) => {
    const handleDeleteDeck = async (deck: Deck) => {
        if (confirm(`Are you sure you want to delete "${deck.name}"?`)) {
            await database.write(async () => {
                await deck.deleteDeck()
            })
        }
    }

    const filteredDecks = decks.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.language.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filteredDecks.length === 0) {
        if (searchQuery) {
            return (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>No decks found matching "{searchQuery}"</p>
                </div>
            )
        }

        return (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                    <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No decks yet</h3>
                <p className="max-w-sm">
                    Create your first flashcard deck to start learning vocabulary!
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {filteredDecks.map((deck, index) => {
                    const langDisplay = getLanguageDisplay(deck.language)
                    return (
                        <motion.div
                            key={deck.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Link href={`/decks/${deck.id}`}>
                                <Card className="group relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl">
                                                    {langDisplay.flag}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{deck.name}</CardTitle>
                                                    <CardDescription>
                                                        {langDisplay.name}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
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
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            handleDeleteDeck(deck)
                                                        }}
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
                                                Click to study
                                            </span>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                    📚 Cards
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

export const DeckList = withObservables([], () => ({
    decks: database.collections.get<Deck>('decks').query().observe(),
}))(DeckListComponent)
