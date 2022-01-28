const express = require('express')
const controller = require('../controller')
const { validate } = require('../utils/index')
const router = new express.Router()


// 创建文档
router.post('/article', validate({
    title: 'string',
    description: 'string',
    content: 'string'
}), controller.articles.createArticle)

// 获取文章列表
router.get('/article', controller.articles.getArticles)

// 获取文章详情
router.get('/article/:id', controller.articles.getArticle)

// 更新文章
router.patch('/article/:id', controller.articles.updateArticle)

// 删除文章
router.delete('/article/:id', controller.articles.deleteArticle)

module.exports = router