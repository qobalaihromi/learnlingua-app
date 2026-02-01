"use client"

import { motion } from "framer-motion"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'
import {
    MoreVertical,
    Trash2,
    Edit,
    Volume2,
    BookOpen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { database } from "@/lib/db"
import CardModel from "@/model/Card"
import { speakText } from "@/lib/speech"

// Card Item Component
const CardItem = ({ card, onDelete }: { card: CardModel; onDelete: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-medium">{card.front}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => speakText(card.front)}
                                >
                                    <Volume2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{card.back}</p>
                            {card.example && (
                                <p className="text-xs text-muted-foreground/70 italic mt-2">
                                    "{card.example}"
                                </p>
                            )}
                            {card.tags && (
                                <div className="flex gap-1 mt-2">
                                    {card.tagsArray.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={onDelete}>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Cards List Component
const CardsListComponent = ({ cards }: { cards: CardModel[] }) => {
    const handleDeleteCard = async (card: CardModel) => {
        if (confirm('Delete this card?')) {
            await database.write(async () => {
                await card.destroyPermanently()
            })
        }
    }

    if (cards.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-lg">No cards yet</h3>
                <p>Add your first flashcard to get started!</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {cards.map((card) => (
                <CardItem key={card.id} card={card} onDelete={() => handleDeleteCard(card)} />
            ))}
        </div>
    )
}

export const CardsList = withObservables(['deckId'], ({ deckId }: { deckId: string }) => ({
    cards: database.collections.get<CardModel>('cards')
        .query(Q.where('deck_id', deckId), Q.sortBy('created_at', Q.desc))
        .observe(),
}))(CardsListComponent)
