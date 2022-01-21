const express = require('express')

const router = new express.Router()

router.get('/', function (req, res) {
    res.send('Hello World')
})
router.post('/articles', function (req, res) {
    res.send('POst articles')
})



module.exports = router