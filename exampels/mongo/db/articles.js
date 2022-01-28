const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ArticleSchema = new Schema({
    title: String,
    description: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
})
ArticleSchema.pre('save', function (next) {
    this.updateAt = new Date()
    next()
})
const Article = mongoose.model('Article', ArticleSchema)
module.exports = Article