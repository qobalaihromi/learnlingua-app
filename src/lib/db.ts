import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from '@/model/schema'
import Deck from '@/model/Deck'
import Card from '@/model/Card'
import Script from '@/model/Script'
import ScriptLine from '@/model/ScriptLine'

// Define the adapter
const adapter = new LokiJSAdapter({
    schema,
    // (Optional) onIndexedDBFetchStart: () => {}, // only for iOS Safari
    useWebWorker: false, // Recommended to turn off for initial setup simplicity
    useIncrementalIndexedDB: true,
    // dbName: 'linguaspacedb', // optional db name
})

// Database instance
export const database = new Database({
    adapter,
    modelClasses: [
        Deck,
        Card,
        Script,
        ScriptLine,
    ],
})
