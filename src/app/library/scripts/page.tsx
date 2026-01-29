"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, MessageSquare, Play } from "lucide-react"
import { withObservables } from '@nozbe/watermelondb/react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { database } from "@/lib/db"
import Script from "@/model/Script"

const ScriptList = ({ scripts }: { scripts: Script[] }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
                <Link key={script.id} href={`/library/scripts/${script.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-xl">
                                    {script.language === 'jp' ? '🇯🇵' : '🇬🇧'}
                                </span>
                                {script.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Click to practice this conversation.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {scripts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    No scripts yet. Create one to start roleplaying!
                </div>
            )}
        </div>
    )
}

const EnhancedScriptList = withObservables([], () => ({
    scripts: database.collections.get<Script>('scripts').query().observe(),
}))(ScriptList)

export default function ScriptListPage() {
    const router = useRouter()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [language, setLanguage] = useState("en")

    const handleCreate = async () => {
        if (!title.trim()) return

        await database.write(async () => {
            await database.collections.get<Script>('scripts').create(script => {
                script.title = title
                script.language = language
                script.createdAt = new Date()
            })
        })

        setIsCreateOpen(false)
        setTitle("")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roleplay Scripts</h1>
                    <p className="text-muted-foreground">
                        Practice real-life conversations.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Script
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Script</DialogTitle>
                            <DialogDescription>
                                Start a new conversation script.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="e.g. Ordering Coffee"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Language</label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">🇬🇧 English</SelectItem>
                                        <SelectItem value="jp">🇯🇵 Japanese</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create Script</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <EnhancedScriptList />
        </div>
    )
}
