import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'decks',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'language', type: 'string' }, // 'en' or 'jp'
                { name: 'created_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'cards',
            columns: [
                { name: 'deck_id', type: 'string', isIndexed: true },
                { name: 'front', type: 'string' },
                { name: 'back', type: 'string' },
                { name: 'type', type: 'string' }, // 'vocab', 'phrase', 'grammar'
                { name: 'next_review', type: 'number', isOptional: true },
                { name: 'interval', type: 'number', isOptional: true },
                { name: 'ease_factor', type: 'number', isOptional: true },
                { name: 'repetitions', type: 'number', isOptional: true },
                { name: 'created_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'daily_logs',
            columns: [
                { name: 'date', type: 'string', isIndexed: true }, // YYYY-MM-DD
                { name: 'vocab_count', type: 'number' },
                { name: 'journal_entry', type: 'string', isOptional: true },
                { name: 'speaking_score', type: 'number', isOptional: true },
            ]
        }),
        tableSchema({
            name: 'scripts',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'language', type: 'string' }, // 'en' or 'jp'
                { name: 'created_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'script_lines',
            columns: [
                { name: 'script_id', type: 'string', isIndexed: true },
                { name: 'speaker', type: 'string' }, // 'A' or 'B'
                { name: 'text', type: 'string' },
                { name: 'translation', type: 'string' },
                { name: 'order', type: 'number' },
                { name: 'created_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'journal_entries',
            columns: [
                { name: 'date', type: 'string', isIndexed: true }, // YYYY-MM-DD
                { name: 'content', type: 'string' },
                { name: 'correction', type: 'string', isOptional: true },
                { name: 'mood', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
    ]
})
