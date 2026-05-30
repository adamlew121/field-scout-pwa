import { openDB } from 'idb'

const DB_NAME = 'field-scout'
const DB_VERSION = 1

let db = null

export function getDb() {
  if (!db) {
    db = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const store = database.createObjectStore('logs', {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('time', 'time')
      }
    })
  }
  return db
}

export async function getLogs() {
  const db = await getDb()
  const all = await db.getAll('logs')
  return all.reverse()
}

export async function addLog(log) {
  const db = await getDb()
  return db.add('logs', log)
}

export async function deleteLog(id) {
  const db = await getDb()
  return db.delete('logs', id)
}
