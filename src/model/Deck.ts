import { Model } from '@nozbe/watermelondb'
import { field, date, children, writer } from '@nozbe/watermelondb/decorators'
import Card from './Card'

export default class Deck extends Model {
    static table = 'decks'
    static associations = {
        cards: { type: 'has_many', foreignKey: 'deck_id' },
    } as const

    @field('name') name!: string
    @field('language') language!: string
    @date('created_at') createdAt!: Date

    @children('cards') cards!: any

    @writer async addCard(front: string, back: string, type: 'vocab' | 'phrase' | 'grammar' = 'vocab') {
        const carsCollection = this.collections.get<Card>('cards')
        return await carsCollection.create(card => {
            card.deckId = this.id
            card.front = front
            card.back = back
            card.type = type
            card.createdAt = new Date()
        })
    }

    @writer async deleteDeck() {
        await this.markAsDeleted()
    }
}
