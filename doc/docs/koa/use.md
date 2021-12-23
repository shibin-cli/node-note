---
sidebar_position: 1
---
# Koa的使用
[koa](https://github.com/koajs/koa)是一个web框架，通过利用 async 函数，Koa 帮你丢弃回调函数，并有力地增强错误处理
## 使用koa
``` js
const Koa = require('koa')

const app = new Koa()

app.use(async (ctx, next) => {
    ctx.body = 'hello'
})

app.listen(3000, () => {
    console.log('serve listen http://localhost:3000')
})
```
## 中间键
``` js
const Koa = require('koa')

const app = new Koa()

function logger1() {
    return async (ctx, next) => {
        console.log('logger1', ctx.path)
        await next()
        console.log('logger1', ctx.body)
    }
}
function logger2() {
    return async (ctx, next) => {
        console.log('logger2',ctx.path)
        await next()
        console.log('logger2',ctx.body)
    }
}
function logger3() {
    return async (ctx, next) => {
        console.log('logger3',ctx.path)
        await next()
        console.log('logger3',ctx.body)
    }
}

app.use(logger1())
app.use(logger2())

app.use(async (ctx, next) => {
    ctx.body = 'hello'
})


app.listen(3000, () => {
    console.log('serve listen http://localhost:3000')
})
```
访问 [http://localhost:3000](http://localhost:3000) ，控制台会打印下面内容
``` bash
logger1 /
logger2 /
logger3 /
logger3 hello
logger2 hello
logger1 hello
 ```
 koa的中间键的执行过程是个洋葱模型