import { Model } from '@nozbe/watermelondb'
import { field, date, children, writer } from '@nozbe/watermelondb/decorators'
import ScriptLine from './ScriptLine'

export default class Script extends Model {
    static table = 'scripts'
    static associations = {
        script_lines: { type: 'has_many', foreignKey: 'script_id' },
    } as const

    @field('title') title!: string
    @field('language') language!: string
    @date('created_at') createdAt!: Date

    @children('script_lines') lines!: any

    @writer async addLine(speaker: string, text: string, translation: string, order: number) {
        const linesCollection = this.collections.get<ScriptLine>('script_lines')
        return await linesCollection.create(line => {
            line.scriptId = this.id
            line.speaker = speaker
            line.text = text
            line.translation = translation
            line.order = order
            line.createdAt = new Date()
        })
    }
}
