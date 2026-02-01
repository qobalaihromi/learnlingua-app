"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { Command } from "lucide-react"

// Keyboard Shortcuts Help
const ShortcutHelp = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null

    const shortcuts = [
        { keys: ['⌘', 'K'], description: 'Show this help' },
        { keys: ['⌘', 'N'], description: 'Create new deck' },
        { keys: ['G', 'H'], description: 'Go to home (decks)' },
        { keys: ['G', 'P'], description: 'Go to progress' },
        { keys: ['G', 'S'], description: 'Go to settings' },
    ]

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-background border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Command className="h-5 w-5" />
                        Keyboard Shortcuts
                    </h2>
                </div>
                <div className="p-4 space-y-3">
                    {shortcuts.map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{shortcut.description}</span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, j) => (
                                    <kbd key={j} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-muted/30 text-center text-sm text-muted-foreground">
                    Press <kbd className="px-1 bg-muted rounded">Esc</kbd> to close
                </div>
            </div>
        </div>
    )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [gPressed, setGPressed] = useState(false)

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
            }

            // Cmd/Ctrl + K - Show shortcuts
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowShortcuts(true)
                return
            }

            // Cmd/Ctrl + N - New deck
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault()
                router.push('/?create=true')
                return
            }

            // G key combinations for navigation
            if (e.key === 'g' && !gPressed) {
                setGPressed(true)
                setTimeout(() => setGPressed(false), 1000)
                return
            }

            if (gPressed) {
                setGPressed(false)
                if (e.key === 'h') {
                    e.preventDefault()
                    router.push('/')
                } else if (e.key === 'p') {
                    e.preventDefault()
                    router.push('/progress')
                } else if (e.key === 's') {
                    e.preventDefault()
                    router.push('/settings')
                }
            }

            // Escape - Close modals
            if (e.key === 'Escape') {
                setShowShortcuts(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router, gPressed])

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                <div className="container mx-auto max-w-5xl p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Keyboard Shortcuts Help Modal */}
            <ShortcutHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

            {/* Keyboard Shortcut Hint (Desktop only) */}
            <div className="hidden md:flex fixed bottom-4 right-4 items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-sm">
                <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-[10px]">⌘K</kbd>
                <span>for shortcuts</span>
            </div>
        </div>
    )
}
