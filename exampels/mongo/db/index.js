const mongoose = require('mongoose')
const env = require('dotenv').config()
if (env.error) {
    throw env.error
}
const config = env.parsed
async function connect() {
    try {
        await mongoose.connect(`mongodb://localhost:27017`, {
            dbName: config.DB_NAME,
            user: config.DB_USER,
            pass: config.DB_PASS,
        })
        console.log('connect success')
    } catch (e) {
        console.log('mongoose connect error ', e)
    }
}
module.exports = connect