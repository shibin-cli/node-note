const express = require('express')
const router = require('./router')
const connect = require('./db')
const app = express()

async function start() {
    await connect()
    app.use(express.json())
    app.use('/api/v1', router)
    app.use(express.static('static'))
    app.use((err, req, res, next) => {
        res.status(500).json({
            error: err.message
        })
    })
    app.listen(3000, () => {
        console.log('server listen http://localhost:3000')
    })
}
start()