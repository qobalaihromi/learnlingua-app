"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Volume2, Mic, Play, MoreVertical, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { withObservables } from '@nozbe/watermelondb/react'

import { Button } from "@/components/ui/button"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { database } from "@/lib/db"
import Script from "@/model/Script"
import ScriptLine from "@/model/ScriptLine"

// Inner Component: Script Lines (Chat View)
const ScriptViewer = ({ script, lines }: { script: Script, lines: ScriptLine[] }) => {
    const [hideTranslation, setHideTranslation] = useState(false)

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text)
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'jp': 'ja-JP',
            'ja': 'ja-JP',
        }
        utterance.lang = langMap[script.language.toLowerCase()] || 'en-US'
        speechSynthesis.speak(utterance)
    }

    const deleteLine = async (line: ScriptLine) => {
        if (confirm("Delete this line?")) {
            await database.write(async () => {
                await line.markAsDeleted()
            })
        }
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto pb-24">
            <div className="flex justify-end mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHideTranslation(!hideTranslation)}
                >
                    {hideTranslation ? "Show Translation" : "Hide Translation"}
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {lines.map((line) => (
                    <motion.div
                        key={line.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex gap-3 ${line.speaker === 'B' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${line.speaker === 'A' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                            }`}>
                            {line.speaker}
                        </div>

                        <div className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${line.speaker === 'A'
                                ? 'bg-primary/10 rounded-tl-none'
                                : 'bg-secondary/50 rounded-tr-none'
                            }`}>
                            <p className="text-base font-medium leading-relaxed">
                                {line.text}
                            </p>
                            <p className={`text-sm text-muted-foreground mt-1 transition-opacity duration-200 ${hideTranslation ? 'opacity-0 hover:opacity-100 cursor-pointer' : 'opacity-80'
                                }`}>
                                {line.translation}
                            </p>

                            {/* Hover Actions */}
                            <div className={`absolute -bottom-8 ${line.speaker === 'B' ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => speakText(line.text)}
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => deleteLine(line)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {lines.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No lines yet. Add a line to start the conversation!
                </div>
            )}
        </div>
    )
}

const EnhancedScriptViewer = withObservables(['script'], ({ script }: { script: Script }) => ({
    lines: script.lines.observe(),
}))(ScriptViewer)


// Main Page Component
const ScriptDetail = ({ script }: { script: Script }) => {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [speaker, setSpeaker] = useState("A")
    const [text, setText] = useState("")
    const [translation, setTranslation] = useState("")

    const handleAddLine = async () => {
        if (!text.trim()) return

        await database.write(async () => {
            // Simple ordering: count existing lines? Or just timestamp.
            // For now, date sorting works if we don't need reordering. 
            // If we want explicit order, we'd need to fetch count.
            // Let's assume generic ordering by creation time is fine for V1.
            const count = await script.lines.count()
            await script.addLine(speaker, text, translation, count)
        })

        setText("")
        setTranslation("")
        // Toggle speaker automatically for convenience
        setSpeaker(speaker === "A" ? "B" : "A")
        // Keep dialog open maybe? Or close it. Let's keep it open for rapid entry.
        // setIsAddOpen(false) 
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4 mb-4 shrink-0">
                <Link href="/library/scripts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{script.title}</h1>
                    <p className="text-xs text-muted-foreground capitalize">{script.language} Script</p>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-1">
                <EnhancedScriptViewer script={script} />
            </div>

            {/* Input Area (Fixed Bottom) */}
            <div className="border-t pt-4 mt-4 shrink-0 bg-background">
                <div className="flex items-end gap-2 max-w-2xl mx-auto">
                    <div className="space-y-2 flex-1">
                        <div className="flex gap-2 mb-2">
                            <Tabs value={speaker} onValueChange={setSpeaker} className="w-[120px]">
                                <TabsList className="grid w-full grid-cols-2 h-8">
                                    <TabsTrigger value="A">A</TabsTrigger>
                                    <TabsTrigger value="B">B</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <span className="text-xs text-muted-foreground self-center">
                                Speaker
                            </span>
                        </div>
                        <Input
                            placeholder="Text (e.g. Hello)"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleAddLine()
                                }
                            }}
                        />
                        <Input
                            placeholder="Translation (e.g. Konnichiwa)"
                            className="text-sm text-muted-foreground"
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleAddLine()
                                }
                            }}
                        />
                    </div>
                    <Button onClick={handleAddLine} size="icon" className="h-10 w-10 shrink-0 mb-[2px]">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2 pb-2">
                    Press Enter to add line & switch speaker
                </p>
            </div>
        </div>
    )
}

const EnhancedScriptDetail = withObservables(['scriptId'], ({ scriptId }: { scriptId: string }) => ({
    script: database.collections.get<Script>('scripts').findAndObserve(scriptId),
}))(ScriptDetail)

export default function ScriptDetailPage({ params }: { params: { scriptId: string } }) {
    const { scriptId } = useParams()
    if (!scriptId) return <div>Loading...</div>
    return <EnhancedScriptDetail scriptId={scriptId as string} />
}
