const express = require('express')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')

dotenv.config()
const URL = process.env.DBURL
const router = express.Router()

let currentDatabase = null

const queryRegex = /select (\w+) from (\w+) where (\w+) (>|<|=|>=|<=) (\d+)/i
const stringSelectRegex = /select (\w+) from (\w+) where (\w+) = '([^']+)'/i
const updateRegex = /update (\w+) set (\w+) = '([^']+)' where (\w+) = '([^']+)'/i
const updateDoubleRegex = /update (\w+) set (\w+) = '([^']+)' ,  (\w+) = '([^']+)' where (\w+) = '([^']+)'/i
const updateTripleRegex = /update (\w+) set (\w+) = '([^']+)' , (\w+) = '([^']+)' ,  (\w+) = '([^']+)' where (\w+) = '([^']+)'/i

router.post('/', async (req, res) => {
    const client = new MongoClient(URL)

    try {
        await client.connect()
        const adminDb = client.db().admin()
        const { query } = req.body

        if (query.trim().toLowerCase() === 'show databases') {
            const databaseList = await adminDb.listDatabases()
            return res.json(databaseList)
        }

        if (query.trim().toLowerCase().startsWith('use')) {
            const dbName = query.trim().split(' ')[1]
            currentDatabase = dbName
            const db = client.db(dbName)
            const collections = await db.listCollections().toArray()

            if (collections.length === 0) {
                return res.status(404).json({ error: 'Database not found' })
            }

            const dbInfoPromises = collections.map(async (collection) => {
                const collectionName = collection.name
                const coll = db.collection(collectionName)
                const documentCount = await coll.countDocuments()
                const sampleDocument = await coll.findOne()
                const fields = sampleDocument ? Object.keys(sampleDocument) : []
                const rowCount = documentCount
                const columnCount = fields.length

                return {
                    collectionName,
                    documentCount,
                    columnCount,
                    rowCount,
                    fields,
                }
            })

            const dbInfo = await Promise.all(dbInfoPromises)

            return res.json({
                database: dbName,
                collections: dbInfo,
            })
        }

        if (query.trim().toLowerCase().startsWith('select')) {
            if (!currentDatabase) {
                return res.status(400).json({ error: 'No database selected. Please use a database first.' })
            }

            const db = client.db(currentDatabase)
            let match = query.match(queryRegex)

            if (match) {
                const [_, field, tableName, filterField, operator, value] = match

                const collections = await db.listCollections().toArray()
                const collectionExists = collections.some(coll => coll.name === tableName)

                if (!collectionExists) {
                    return res.status(404).json({ error: `No table with Name: ${tableName}` })
                }

                const collection = db.collection(tableName)

                let mongoOperator
                switch (operator) {
                    case '>':
                        mongoOperator = '$gt'
                        break
                    case '<':
                        mongoOperator = '$lt'
                        break
                    case '=':
                        mongoOperator = '$eq'
                        break
                    case '>=':
                        mongoOperator = '$gte'
                        break
                    case '<=':
                        mongoOperator = '$lte'
                        break
                    default:
                        return res.status(400).json({ error: 'Invalid operator' })
                }

                const mongoQuery = {
                    [filterField]: { [mongoOperator]: parseInt(value, 10) }
                }

                try {
                    const results = await collection.find(mongoQuery).toArray()
                    return res.json(results)
                } catch (err) {
                    return res.status(500).json({ error: 'Error executing query', details: err.message })
                }

            } else {
                match = query.match(stringSelectRegex)
                if (match) {
                    const [_, field, tableName, filterField, filterValue] = match

                    const collections = await db.listCollections().toArray()
                    const collectionExists = collections.some(coll => coll.name === tableName)

                    if (!collectionExists) {
                        return res.status(404).json({ error: `No table with Name: ${tableName}` })
                    }

                    const collection = db.collection(tableName)

                    const mongoQuery = {
                        [filterField]: filterValue
                    }

                    try {
                        const results = await collection.find(mongoQuery).toArray()
                        return res.json(results)
                    } catch (err) {
                        return res.status(500).json({ error: 'Error executing query', details: err.message })
                    }
                } else {
                    const parts = query.trim().split(' from ')
                    if (parts.length === 2) {
                        const tableName = parts[0].replace('select ', '').trim()
                        const dbName = parts[1].trim()

                        const collection = client.db(dbName).collection(tableName)
                        const count = await collection.countDocuments()

                        if (count === 0) {
                            return res.json({ error: `No table with name ${tableName} was found in the database` })
                        }

                        const data = await collection.find().toArray()
                        return res.json(data)
                    } else {
                        return res.status(400).json({ error: 'Invalid query format' })
                    }
                }
            }
        } else {
            return res.status(400).json({ error: 'Invalid query' })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'An unexpected error occurred', details: err.message })
    } finally {
        await client.close()
    }
})

router.post('/update', async (req, res) => {
    const client = new MongoClient(URL)

    try {
        await client.connect()
        const { query } = req.body

        if (!currentDatabase) {
            return res.status(400).json({ error: 'No database selected. Please use a database first.' })
        }

        const db = client.db(currentDatabase)

        const match = query.match(updateRegex || updateDoubleRegex || updateTripleRegex)
        if (match) {
            const [_, tableName, updateField, updateValue, conditionField, conditionValue] = match
            const collection = db.collection(tableName)

            if (tableName === 'users'){
                return res.status(403).json({ error: 'Error 403 - FORBIDDEN', details: 'Its forbidden to alter data in this particular table' })
            }

            const updateQuery = { [conditionField]: conditionValue }
            const updateData = { $set: { [updateField]: updateValue } }

            try {
                const result = await collection.updateMany(updateQuery, updateData)
                const updatedDocuments = await collection.find(updateQuery).toArray()
                return res.status(200).json(updatedDocuments)
            } catch (err) {
                return res.status(500).json({ error: 'Error updating documents', details: err.message })
            }
        } else {
            return res.status(400).json({ error: 'Invalid update query format' })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'An unexpected error occurred', details: err.message })
    } finally {
        await client.close()
    }
})

module.exports = router
