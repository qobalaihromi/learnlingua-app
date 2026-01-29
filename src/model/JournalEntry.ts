import { Model } from '@nozbe/watermelondb'
import { field, date, text, readonly, writer } from '@nozbe/watermelondb/decorators'

export default class JournalEntry extends Model {
    static table = 'journal_entries'

    @text('date') date!: string
    @text('content') content!: string
    @text('correction') correction?: string
    @text('mood') mood?: string

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date

    @writer async updateEntry(content: string, mood?: string) {
        await this.update(entry => {
            entry.content = content
            if (mood) entry.mood = mood
        })
    }
}
