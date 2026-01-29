"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Plus, Clock, Save, Bookmark, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface CapturedPhrase {
    id: string
    text: string
    timestamp: number
    source: string
}

export default function StudyPage() {
    const [activeTab, setActiveTab] = useState("youtube")
    const [videoUrl, setVideoUrl] = useState("")
    const [videoId, setVideoId] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [capturedPhrases, setCapturedPhrases] = useState<CapturedPhrase[]>([])
    const [newPhrase, setNewPhrase] = useState("")
    const [isSaveOpen, setIsSaveOpen] = useState(false)
    const [selectedPhrase, setSelectedPhrase] = useState<CapturedPhrase | null>(null)

    // DB Integration State
    const [decks, setDecks] = useState<Deck[]>([])
    const [selectedDeckId, setSelectedDeckId] = useState("")
    const [meaning, setMeaning] = useState("")

    // Article state
    const [articleUrl, setArticleUrl] = useState("")
    const [articleContent, setArticleContent] = useState("")

    // Load Decks
    useEffect(() => {
        const subscription = database.collections.get<Deck>('decks')
            .query()
            .observe()
            .subscribe(setDecks)
        return () => subscription.unsubscribe()
    }, [])

    const extractVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    const handleLoadVideo = () => {
        const id = extractVideoId(videoUrl)
        if (id) {
            setVideoId(id)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleCapturePhrase = () => {
        if (!newPhrase.trim()) return

        const phrase: CapturedPhrase = {
            id: Date.now().toString(),
            text: newPhrase,
            timestamp: currentTime,
            source: videoId ? `YouTube: ${videoId}` : "Manual",
        }

        setCapturedPhrases([...capturedPhrases, phrase])
        setNewPhrase("")
    }

    const handleSaveToLibrary = (phrase: CapturedPhrase) => {
        setSelectedPhrase(phrase)
        if (decks.length > 0) {
            setSelectedDeckId(decks[0].id)
        }
        setIsSaveOpen(true)
    }

    const handleConfirmSave = async () => {
        if (!selectedPhrase || !selectedDeckId) return

        try {
            const deck = decks.find(d => d.id === selectedDeckId)
            if (deck) {
                await database.write(async () => {
                    await deck.addCard(
                        selectedPhrase.text,
                        meaning,
                        "phrase"
                    )
                })
                setIsSaveOpen(false)
                setSelectedPhrase(null)
                setMeaning("")
                // Ideally show a toast here
            }
        } catch (error) {
            console.error("Failed to save card", error)
            alert("Failed to save to database")
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Study Center</h1>
                <p className="text-muted-foreground">
                    Learn from YouTube videos and articles
                </p>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="youtube" className="gap-2">
                        📺 YouTube
                    </TabsTrigger>
                    <TabsTrigger value="article" className="gap-2">
                        📄 Article
                    </TabsTrigger>
                </TabsList>

                {/* YouTube Tab */}
                <TabsContent value="youtube" className="space-y-4 mt-4">
                    {/* URL Input */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Load YouTube Video</CardTitle>
                            <CardDescription>
                                Paste a YouTube URL to start learning
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={handleLoadVideo} className="gap-2">
                                    <Play className="h-4 w-4" />
                                    Load
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Player */}
                    {videoId && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="overflow-hidden">
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Current: {formatTime(currentTime)}
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setCurrentTime(currentTime + 1)}
                                        >
                                            Update Time (Demo)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Phrase Capture */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bookmark className="h-5 w-5" />
                                Capture Phrase
                            </CardTitle>
                            <CardDescription>
                                Save interesting phrases while watching
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a phrase you want to remember..."
                                    value={newPhrase}
                                    onChange={(e) => setNewPhrase(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCapturePhrase()}
                                    className="flex-1"
                                />
                                <Button onClick={handleCapturePhrase} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Capture
                                </Button>
                            </div>

                            {/* Captured List */}
                            <AnimatePresence>
                                {capturedPhrases.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-2"
                                    >
                                        <p className="text-sm font-medium">
                                            Captured ({capturedPhrases.length})
                                        </p>
                                        {capturedPhrases.map((phrase) => (
                                            <motion.div
                                                key={phrase.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-3 rounded-lg border p-3"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{phrase.text}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @ {formatTime(phrase.timestamp)} • {phrase.source}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() => handleSaveToLibrary(phrase)}
                                                >
                                                    <Save className="h-3 w-3" />
                                                    Save
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Article Tab */}
                <TabsContent value="article" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Read Article</CardTitle>
                            <CardDescription>
                                Paste article text or URL to start reading
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Paste article URL..."
                                    value={articleUrl}
                                    onChange={(e) => setArticleUrl(e.target.value)}
                                    className="flex-1"
                                />
                                <Button variant="outline" className="gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Fetch
                                </Button>
                            </div>

                            <div className="relative">
                                <textarea
                                    placeholder="Or paste article text here..."
                                    value={articleContent}
                                    onChange={(e) => setArticleContent(e.target.value)}
                                    className="min-h-[300px] w-full rounded-lg border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    💡 Tip: Select any word and click to save it to your vocabulary!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save to Library</DialogTitle>
                        <DialogDescription>
                            Add &quot;{selectedPhrase?.text}&quot; to your vocabulary deck
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Deck</label>
                            {decks.length === 0 ? (
                                <p className="text-sm text-destructive">No decks found. Create one in Library first.</p>
                            ) : (
                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2"
                                    value={selectedDeckId}
                                    onChange={(e) => setSelectedDeckId(e.target.value)}
                                >
                                    {decks.map(deck => (
                                        <option key={deck.id} value={deck.id}>
                                            {deck.name} ({deck.language})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Meaning/Translation</label>
                            <Input
                                placeholder="Enter the meaning..."
                                value={meaning}
                                onChange={(e) => setMeaning(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Saving to Local Database...
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSave} disabled={decks.length === 0}>
                            Save to Deck
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
