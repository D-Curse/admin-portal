const dotenv = require('dotenv')
const mongoose = require('mongoose')
const colors = require('colors')

dotenv.config()

const URL = process.env.DBURL

const Connection = async() => {
    try {
        await mongoose.connect(URL)
        console.log(`CONNECTED TO DB`.bgGreen)
        return true
    }
    catch (error) {
        console.log(`UNABLE TO CONNECT TO DB DUE TO ERROR : ${error}`.bgRed)
        return false
    }
}

module.exports = Connection