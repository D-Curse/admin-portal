const express = require('express')
const dotenv = require('dotenv')

const URL = process.env.DBURL
const router = express.Router()
const form = require('../models/form');

let {MongoClient} = require('mongodb')
dotenv.config()


router.post('/', async (req, res) => {
    console.log('form request hit')

    const { name, age, gender } = req.body
    const newData = new form({ name, age, gender})

    try {
        const savedData = await newData.save()
        res.json(savedData)
    } catch (err) {
        res.status(400).json({ error: err.message})
    }
})

router.get('/', async (req, res) => {
    try {
        const forms = await form.find()
        res.json(forms)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/database', async (req, res) => {
    const client = new MongoClient(URL)

    try {
        await client.connect()
        const db = client.db()
        const adminDb = client.db().admin()
        const databasesList = await adminDb.listDatabases()
        console.log(databasesList)

        const collections = await db.listCollections().toArray()

        const collectionsDetails = []

        for (let collection of collections) {
            const collectionName = collection.name
            const coll = db.collection(collectionName)

            const numberOfDocuments = await coll.countDocuments()
            const oneDocument = await coll.findOne()
            const fieldNames = oneDocument ? Object.keys(oneDocument) : []

            collectionsDetails.push({
                collectionName,
                numberOfDocuments,
                fieldNames
            })
        }

        res.json(collectionsDetails)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch DB data', details: err.message })
    } finally {
        await client.close()
    }
})

const queryRegex = /select (\w+) from (\w+) where (\w+) (>|<|=) (\d+)/i;
const stringSelectRegex = /select (\w+) from (\w+) where (\w+) = '([^']+)'/i;

const numericDeleteRegex = /delete from (\w+) where (\w+) (>|<|=) (\d+)/i;
const stringDeleteRegex = /delete from (\w+) where (\w+) = '([^']+)'/i;


router.post('/query', async (req, res) => {
    const { query } = req.body;
    console.log('QUERY : ', query);

    if (typeof query !== 'string') {
        return res.status(400).json({ error: 'Query must be a string' });
    }

    let match = query.match(queryRegex);
    if (match) {
        const [_, field, tableName, filterField, operator, value] = match;
        
        if (tableName.toLowerCase() !== 'form') {
            return res.status(400).json({ error: 'Invalid table name' });
        }

        let mongoOperator;
        switch (operator) {
            case '>':
                mongoOperator = '$gt';
                break;
            case '<':
                mongoOperator = '$lt';
                break;
            case '=':
                mongoOperator = '$eq';
                break;
            default:
                return res.status(400).json({ error: 'Invalid operator' });
        }

        const mongoQuery = {
            [filterField]: { [mongoOperator]: parseInt(value, 10) }
        };

        try {
            const results = await form.find(mongoQuery);
            res.json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        match = query.match(stringSelectRegex);
        if (match) {
            const [_, field, tableName, filterField, filterValue] = match;

            if (tableName.toLowerCase() !== 'form') {
                return res.status(400).json({ error: 'Invalid table name' });
            }

            const mongoQuery = {
                [filterField]: filterValue
            };

            try {
                const results = await form.find(mongoQuery);
                res.json(results);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        } else {
            return res.status(400).json({ error: 'Invalid query format' });
        }
    }
});

router.post('/query121', async (req, res) => {
    const { query } = req.body;
    console.log('Received DELETE Query:', query);

    let match = query.match(numericDeleteRegex);
    console.log(match, "numeric")
    if (match) {
        const [_, tableName, filterField, operator, value] = match;
        const mongoOperator = operator === '=' ? '$eq' : (operator === '>' ? '$gt' : '$lt');
        const mongoQuery = { [filterField]: { [mongoOperator]: parseInt(value, 10) } };

        if (tableName.toLowerCase() === 'form') {
            try {
                const result = await form.deleteMany(mongoQuery);
                return res.json({ message: `${result.deletedCount} record(s) deleted` });
            } catch (err) {
                return res.status(500).json({ error: err.message });
            }
        } else {
            return res.status(400).json({ error: 'Invalid table name' });
        }
    }

    match = query.match(stringDeleteRegex);
    console.log(match, "IDK")
    if (match) {
        const [_, tableName, filterField, filterValue] = match;

        if (tableName.toLowerCase() === 'form') {
            try {
                const result = await form.deleteMany({ [filterField]: filterValue });
                return res.json({ message: `${result.deletedCount} record(s) deleted` });
            } catch (err) {
                return res.status(500).json({ error: err.message });
            }
        } else {
            return res.status(400).json({ error: 'Invalid table name' });
        }
    }

    return res.status(400).json({ error: 'Invalid query format' });
});

module.exports = router;