const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan')

const Connection = require('./configure')
const authRoutes = require('./routes/userRoutes')
const formRoutes = require('./routes/dataRoutes')
const queryRoutes = require('./routes/queryRoutes')
const authMiddleware = require('./middlewares/auth');

const app = express();

app.use(morgan('dev'))
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));


app.use(express.json())
const startServer = async () => {
    try {
        const isConnected = await Connection()
        if (isConnected) {
            app.listen(3000, () => {
                console.log('SERVER IS RUNNING ON PORT 3000'.bgGreen)
            })
        } else {
            console.error('FAILED TO CONNECT TO THE DB. SERVER NOT STARTED'.bgRed)
        }
    } catch (error) {
        console.error(`ERROR CONNECTING TO THE DB : ${error}`.bgRed)
    }
}
startServer()

app.use('/api/auth', authRoutes)
app.use('/api/form', formRoutes)
app.use('/api/query', queryRoutes)

app.get('/api/home', authMiddleware, (req, res) => {
    res.json({ message: `Welcome, ${req.user.role}` });
})
