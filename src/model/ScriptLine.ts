import { Model } from '@nozbe/watermelondb'
import { field, date, text, relation } from '@nozbe/watermelondb/decorators'

export default class ScriptLine extends Model {
    static table = 'script_lines'
    static associations = {
        scripts: { type: 'belongs_to', key: 'script_id' },
    } as const

    @field('script_id') scriptId!: string
    @relation('scripts', 'script_id') script!: any

    @text('speaker') speaker!: string
    @text('text') text!: string
    @text('translation') translation!: string
    @field('order') order!: number

    @date('created_at') createdAt!: Date
}
