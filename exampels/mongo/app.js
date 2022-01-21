const express = require('express')
const router = require('./router')

const app = express()

app.use('/api', router)

app.listen(3000, () => {
    console.log('server listen http://localhost:3000')
})