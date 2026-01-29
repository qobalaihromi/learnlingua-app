import { Model } from '@nozbe/watermelondb'
import { field, date, text, writer, relation } from '@nozbe/watermelondb/decorators'
import type Deck from './Deck'

export default class Card extends Model {
    static table = 'cards'
    static associations = {
        decks: { type: 'belongs_to', key: 'deck_id' },
    } as const

    @text('front') front!: string
    @text('back') back!: string
    @text('type') type!: string // 'vocab' | 'phrase' | 'grammar'

    @field('deck_id') deckId!: string
    @relation('decks', 'deck_id') deck!: any

    @field('next_review') nextReview?: number
    @field('interval') interval?: number
    @field('ease_factor') easeFactor?: number

    @date('created_at') createdAt!: Date

    @writer async updateReview(rating: number) {
        // TODO: Implement actual SM-2 algorithm
        await this.update(card => {
            card.nextReview = Date.now() + 86400000 // Default +1 day for now
        })
    }
}
