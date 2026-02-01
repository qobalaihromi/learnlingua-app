"use client"

import { useRef } from "react"
import { Q } from '@nozbe/watermelondb'
import { database } from "@/lib/db"
import Deck from "@/model/Deck"
import CardModel from "@/model/Card"

export const useDeckImportExport = (deck: Deck) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExport = async () => {
        try {
            const cards = await database.collections
                .get<CardModel>('cards')
                .query(Q.where('deck_id', deck.id))
                .fetch()

            const exportData = {
                name: deck.name,
                language: deck.language,
                exportedAt: new Date().toISOString(),
                cards: cards.map(card => ({
                    front: card.front,
                    back: card.back,
                    type: card.type,
                    example: card.example,
                    exampleTranslation: card.exampleTranslation,
                    tags: card.tags,
                }))
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${deck.name.replace(/\s+/g, '_')}_flashlingua.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export deck')
        }
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            const data = JSON.parse(text)

            if (!data.cards || !Array.isArray(data.cards)) {
                alert('Invalid file format. Expected a FlashLingua export file.')
                return
            }

            await database.write(async () => {
                for (const cardData of data.cards) {
                    await database.collections.get<CardModel>('cards').create(card => {
                        card.deckId = deck.id
                        card.front = cardData.front || ''
                        card.back = cardData.back || ''
                        card.type = cardData.type || 'vocab'
                        card.example = cardData.example || ''
                        card.exampleTranslation = cardData.exampleTranslation || ''
                        card.tags = cardData.tags || ''
                        card.createdAt = new Date()
                    })
                }
            })

            alert(`Successfully imported ${data.cards.length} cards!`)
        } catch (error) {
            alert('Failed to import file. Please check the file format.')
            console.error(error)
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const triggerImport = () => {
        fileInputRef.current?.click()
    }

    return {
        fileInputRef,
        handleExport,
        handleImport,
        triggerImport
    }
}
