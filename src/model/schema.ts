import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
    version: 2, // Bumped version for migration
    tables: [
        tableSchema({
            name: 'decks',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'language', type: 'string' },
                { name: 'description', type: 'string', isOptional: true }, // NEW: Deck description
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
                // NEW: Rich card fields
                { name: 'example', type: 'string', isOptional: true },              // Example sentence
                { name: 'example_translation', type: 'string', isOptional: true },  // Translation of example
                { name: 'image_url', type: 'string', isOptional: true },            // Image for visual learning
                { name: 'audio_url', type: 'string', isOptional: true },            // Custom audio file
                { name: 'tags', type: 'string', isOptional: true },                 // Comma-separated tags
                // SRS fields
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
                { name: 'cards_reviewed', type: 'number' },        // Renamed for clarity
                { name: 'cards_learned', type: 'number', isOptional: true }, // NEW
                { name: 'study_time_seconds', type: 'number', isOptional: true }, // NEW
            ]
        }),
        // REMOVED: scripts, script_lines, journal_entries tables
    ]
})
