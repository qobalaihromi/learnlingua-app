import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from '@/model/schema'
import Deck from '@/model/Deck'
import Card from '@/model/Card'

// Define the adapter
const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    dbName: 'flashlinguadb',
})

// Database instance
export const database = new Database({
    adapter,
    modelClasses: [
        Deck,
        Card,
    ],
})

