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
    @field('repetitions') repetitions?: number

    @date('created_at') createdAt!: Date

    @writer async updateReview(rating: number) {
        // SuperMemo-2 Algorithm
        // Input: rating (0-5)
        // 5: perfect response
        // 4: correct response after a hesitation
        // 3: correct response recalled with serious difficulty
        // 2: incorrect response; where the correct one seemed easy to recall
        // 1: incorrect response; the correct one remembered
        // 0: complete blackout.

        let interval = this.interval || 0
        let repetitions = this.repetitions || 0
        let easeFactor = this.easeFactor || 2.5

        if (rating >= 3) {
            if (repetitions === 0) {
                interval = 1
            } else if (repetitions === 1) {
                interval = 6
            } else {
                interval = Math.round(interval * easeFactor)
            }
            repetitions += 1
        } else {
            repetitions = 0
            interval = 1
        }

        easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
        if (easeFactor < 1.3) easeFactor = 1.3

        await this.update(card => {
            card.nextReview = Date.now() + interval * 24 * 60 * 60 * 1000
            card.interval = interval
            card.easeFactor = easeFactor
            card.repetitions = repetitions
        })
    }
}
