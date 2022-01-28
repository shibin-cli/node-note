const Article = require('../db/articles')

module.exports = {
    async createArticle(req, res, next) {
        try {
            const article = new Article(req.body)
            const data = await article.save()
            res.status(201).json({
                status: 1,
                article: data
            })
        } catch (err) {
            next(err)
        }
    },
    async getArticles(req, res) {
        const { page = 1, size = 5 } = req.query
        const articles = await Article.find().skip((page - 1) * size).limit(size)
        const count = await Article.count()
        res.json({
            status: 1,
            data: articles,
            count
        })
    },
    async getArticle(req, res) {
        const article = await Article.findById(req.params.id)
        res.json({
            status: 1,
            data: article
        })
    },
    // 更新文章
    async updateArticle(req, res, next) {
        try {
            await Article.updateOne({
                _id: req.params.id
            }, req.body)
            res.json({
                status: 1,
                msg: '更新成功'
            })
        } catch (err) {
            next(err)
        }

    },
    // 删除文章
    async deleteArticle(req, res, next) {
        try {
            await Article.deleteOne({
                _id: req.params.id
            })
            res.json({
                status: 1,
                article: '删除成功'
            })
        } catch (err) {
            next(err)
        }
    }
}