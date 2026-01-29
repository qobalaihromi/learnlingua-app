"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Plus, Book, ArrowRight } from "lucide-react"
import { withObservables } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import { Button } from "@/components/ui/button"
// Calendar needs to be imported from shadcn components
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { database } from "@/lib/db"
import JournalEntry from "@/model/JournalEntry"

const JournalList = ({ entries }: { entries: JournalEntry[] }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Today's Entry Card - Always first */}
            <Link href={`/journal/${format(new Date(), 'yyyy-MM-dd')}`}>
                <Card className="h-full border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-primary">
                        <Plus className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">Write Today's Entry</h3>
                        <p className="text-sm opacity-80">{format(new Date(), 'EEEE, MMMM do')}</p>
                    </CardContent>
                </Card>
            </Link>

            {entries.map((entry) => (
                <Link key={entry.id} href={`/journal/${entry.date}`}>
                    <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(entry.date), 'MMM do, yyyy')}
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                {entry.mood && <span className="mr-2">{entry.mood}</span>}
                                {format(new Date(entry.createdAt), 'h:mm a')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {entry.content}
                            </p>

                            <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                Read more <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

const EnhancedJournalList = withObservables([], () => ({
    entries: database.collections.get<JournalEntry>('journal_entries')
        .query(Q.sortBy('date', Q.desc))
        .observe(),
}))(JournalList)

export default function JournalPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const router = useRouter()

    const handleSelectDate = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate)
            router.push(`/journal/${format(newDate, 'yyyy-MM-dd')}`)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Daily Journal</h1>
                        <p className="text-muted-foreground">
                            Build your writing habit one day at a time.
                        </p>
                    </div>

                    <EnhancedJournalList />
                </div>

                {/* Sidebar Calendar */}
                <div className="w-full md:w-auto shrink-0 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Archive</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleSelectDate}
                                className="rounded-md border-none"
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                        </CardContent>
                    </Card>

                    <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Book className="h-4 w-4" />
                            Writing Tip
                        </h4>
                        <p>
                            Don't worry about grammar. Just flow.
                            You can get corrections later!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
