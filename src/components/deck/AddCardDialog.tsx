"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Deck from "@/model/Deck"
import { database } from "@/lib/db"

interface AddCardDialogProps {
    deck: Deck
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const AddCardDialog = ({ deck, open, onOpenChange }: AddCardDialogProps) => {
    const [front, setFront] = useState("")
    const [back, setBack] = useState("")
    const [example, setExample] = useState("")
    const [tags, setTags] = useState("")

    const handleAddCard = async () => {
        if (!front.trim() || !back.trim()) return

        await database.write(async () => {
            const newCard = await deck.addCard(front.trim(), back.trim(), 'vocab')

            // Update additional fields
            if (example.trim() || tags.trim()) {
                await newCard.update(card => {
                    if (example.trim()) card.example = example.trim()
                    if (tags.trim()) card.tags = tags.trim()
                })
            }
        })

        setFront("")
        setBack("")
        setExample("")
        setTags("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Card</DialogTitle>
                    <DialogDescription>
                        Create a new flashcard for {deck.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Front (Question)</label>
                        <Input
                            placeholder="e.g., 食べる"
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Back (Answer)</label>
                        <Input
                            placeholder="e.g., to eat"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Example Sentence (Optional)</label>
                        <Textarea
                            placeholder="e.g., 私はりんごを食べる"
                            value={example}
                            onChange={(e) => setExample(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags (Optional, comma-separated)</label>
                        <Input
                            placeholder="e.g., verb, JLPT N5, food"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddCard}
                        disabled={!front.trim() || !back.trim()}
                    >
                        Add Card
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
