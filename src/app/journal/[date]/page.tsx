"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowLeft, Save, Sparkles, AlertCircle } from "lucide-react"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { database } from "@/lib/db"
import JournalEntry from "@/model/JournalEntry"

// Editor Component
const JournalEditor = ({
    dateStr,
    entry
}: {
    dateStr: string,
    entry?: JournalEntry
}) => {
    const router = useRouter()
    const [content, setContent] = useState(entry?.content || "")
    const [mood, setMood] = useState(entry?.mood || "😐")
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Update state if entry loads late (observable)
    useEffect(() => {
        if (entry) {
            setContent(entry.content)
            setMood(entry.mood || "😐")
        }
    }, [entry])

    const handleSave = async () => {
        setIsSaving(true)
        setIsSaved(false)

        try {
            await database.write(async () => {
                const journalCollection = database.collections.get<JournalEntry>('journal_entries')

                if (entry) {
                    // Update existing
                    await entry.updateEntry(content, mood)
                } else {
                    // Create new
                    await journalCollection.create(newEntry => {
                        newEntry.date = dateStr
                        newEntry.content = content
                        newEntry.mood = mood
                        newEntry.createdAt = new Date()
                        newEntry.updatedAt = new Date() // Manual set? decorators might handle read-only but create needs val?
                        // Actually readonly decorators usually mean we don't set them manually, 
                        // but for 'created_at' in WatermelonDB often we do unless there's a schema default or logic.
                        // Let's safe-guard.
                    })
                }
            })
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 2000)
        } catch (error) {
            console.error("Failed to save journal", error)
            alert("Failed to save. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const formattedDate = format(parseISO(dateStr), 'EEEE, MMMM do, yyyy')

    return (
        <div className="max-w-3xl mx-auto space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/journal">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">{formattedDate}</h1>
                        <p className="text-xs text-muted-foreground">
                            {content.split(/\s+/).filter(w => w.length > 0).length} words
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="Mood" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="😄">😄</SelectItem>
                            <SelectItem value="🙂">🙂</SelectItem>
                            <SelectItem value="😐">😐</SelectItem>
                            <SelectItem value="😔">😔</SelectItem>
                            <SelectItem value="😤">😤</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleSave} disabled={isSaving || !content.trim()} className="gap-2">
                        {isSaved ? (
                            "Saved!"
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Entry
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-card rounded-lg border shadow-sm p-6 flex flex-col gap-4">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Today I learned..."
                    className="flex-1 resize-none border-none focus-visible:ring-0 text-lg leading-relaxed p-0 scrollbar-hide"
                />

                <div className="pt-4 border-t flex justify-end">
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={() => {
                        window.open('https://chatgpt.com', '_blank')
                    }}>
                        <Sparkles className="h-4 w-4" />
                        Ask ChatGPT to Correct
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Wrapper to fetch entry if exists
const EnhancedJournalEditor = withObservables(['dateStr'], ({ dateStr }: { dateStr: string }) => ({
    entry: database.collections.get<JournalEntry>('journal_entries')
    entries: database.collections.get<JournalEntry>('journal_entries')
        .query(Q.where('date', dateStr)) // Should return 0 or 1
        .observe()
}))(({ dateStr, entries }: { dateStr: string, entries: JournalEntry[] }) => {
    return <JournalEditor dateStr={dateStr} entry={entries[0]} />
})

export default function JournalEditorPage({ params }: { params: { date: string } }) {
    // Validate date format slightly?
    const { date } = useParams()
    if (!date) return <div>Loading...</div>

    return <EnhancedJournalEditor dateStr={date as string} />
}
