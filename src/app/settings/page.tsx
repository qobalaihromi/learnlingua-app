"use client"

import { useState, useRef } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, Info, Check, AlertCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Types for data export/import
interface CardData {
    id: string
    front: string
    back: string
    type: "vocab" | "phrase" | "grammar"
    createdAt: string
}

interface DeckData {
    id: string
    name: string
    language: string
    createdAt: string
    cards: CardData[]
}

interface ExportData {
    version: string
    exportedAt: string
    decks: DeckData[]
    stats: {
        totalCards: number
        totalDecks: number
    }
}

// Mock data for demo - in real app this would come from WatermelonDB
const mockDeckData: DeckData[] = [
    {
        id: "1",
        name: "Business English",
        language: "en",
        createdAt: new Date().toISOString(),
        cards: [
            { id: "1", front: "Negotiate", back: "To discuss something to reach an agreement", type: "vocab", createdAt: new Date().toISOString() },
            { id: "2", front: "Let's circle back", back: "Let's discuss this again later", type: "phrase", createdAt: new Date().toISOString() },
            { id: "3", front: "Leverage", back: "To use something to maximum advantage", type: "vocab", createdAt: new Date().toISOString() },
        ]
    },
    {
        id: "2",
        name: "Daily Conversations",
        language: "en",
        createdAt: new Date().toISOString(),
        cards: [
            { id: "4", front: "How's it going?", back: "Informal greeting", type: "phrase", createdAt: new Date().toISOString() },
            { id: "5", front: "Catch you later", back: "Informal goodbye", type: "phrase", createdAt: new Date().toISOString() },
        ]
    },
]

export default function SettingsPage() {
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
    const [exportSuccess, setExportSuccess] = useState(false)
    const [importStatus, setImportStatus] = useState<"success" | "error" | null>(null)
    const [importMessage, setImportMessage] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExport = () => {
        // Create export data
        const exportData: ExportData = {
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
            decks: mockDeckData,
            stats: {
                totalCards: mockDeckData.reduce((sum, deck) => sum + deck.cards.length, 0),
                totalDecks: mockDeckData.length,
            }
        }

        // Create and download JSON file
        const jsonString = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `linguaspace-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setExportSuccess(true)
        setTimeout(() => setExportSuccess(false), 3000)
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const data = JSON.parse(content) as ExportData

                // Validate the imported data
                if (!data.version || !data.decks || !Array.isArray(data.decks)) {
                    throw new Error("Invalid file format")
                }

                // Validate each deck has required fields
                for (const deck of data.decks) {
                    if (!deck.name || !deck.cards || !Array.isArray(deck.cards)) {
                        throw new Error("Invalid deck format")
                    }
                }

                // Here you would save to WatermelonDB
                // For now, we just show success
                const totalCards = data.decks.reduce((sum, deck) => sum + deck.cards.length, 0)

                setImportStatus("success")
                setImportMessage(`Successfully imported ${data.decks.length} decks with ${totalCards} cards!`)

                // Clear after 5 seconds
                setTimeout(() => {
                    setImportStatus(null)
                    setImportMessage("")
                }, 5000)

            } catch (error) {
                setImportStatus("error")
                setImportMessage("Failed to import: Invalid file format. Please use a valid LinguaSpace backup file.")

                setTimeout(() => {
                    setImportStatus(null)
                    setImportMessage("")
                }, 5000)
            }
        }

        reader.readAsText(file)

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleReset = () => {
        // Here you would clear WatermelonDB
        // For now, just close the dialog
        localStorage.clear()
        setIsResetDialogOpen(false)
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Customize your LinguaSpace experience
                </p>
            </div>

            {/* Hidden file input for import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />

            {/* Import/Export Status Messages */}
            {(exportSuccess || importStatus) && (
                <div className={`flex items-center gap-2 p-4 rounded-lg ${exportSuccess || importStatus === "success"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                    {exportSuccess || importStatus === "success" ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <span>
                        {exportSuccess
                            ? "Data exported successfully! Check your downloads folder."
                            : importMessage}
                    </span>
                </div>
            )}

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize how LinguaSpace looks on your device
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">
                            Switch between light and dark mode
                        </p>
                    </div>
                    <ModeToggle />
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Export or import your learning data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Export Data</p>
                            <p className="text-sm text-muted-foreground">
                                Download all your decks and progress as JSON
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Import Data</p>
                            <p className="text-sm text-muted-foreground">
                                Restore from a previous backup
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handleImportClick}>
                            <Upload className="h-4 w-4" />
                            Import
                        </Button>
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-destructive">Reset All Data</p>
                                <p className="text-sm text-muted-foreground">
                                    This will delete all your decks and progress. This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={() => setIsResetDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        About LinguaSpace
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Stack:</strong> Next.js 15, WatermelonDB, Shadcn UI</p>
                    <p><strong>Database:</strong> Local-First (Your data stays on your device)</p>
                    <p className="pt-2">
                        Built with ❤️ for language learners who want to take control of their journey.
                    </p>
                </CardContent>
            </Card>

            {/* Reset Confirmation Dialog */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">⚠️ Reset All Data?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all your vocabulary decks, flashcards,
                            and learning progress. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
                        <p className="font-medium text-destructive">You will lose:</p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                            <li>• All vocabulary decks and flashcards</li>
                            <li>• Your learning streak and statistics</li>
                            <li>• Study progress and achievements</li>
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsResetDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReset}
                        >
                            Yes, Reset Everything
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
