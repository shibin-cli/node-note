// const Koa = require('koa')

// const app = new Koa()
// app.use(logger1())
// app.use(logger2())

// app.use(async (ctx, next) => {
//     ctx.body = 'hello'
// })

// function logger1() {
//     return async (ctx, next) => {
//         console.log(ctx.path)
//         await next()
//         console.log(ctx.body)
//     }
// }
// function logger2() {
//     return async (ctx, next) => {
//         console.log('logger2',ctx.path)
//         await next()
//         console.log('logger2',ctx.body)
//     }
// }
// app.listen(3000, () => {
//     console.log('serve listen http://localhost:3000')
// })
const app = new Koa()
function middleware1(){
    return async (ctx, next) => {
        console.log('middleware1 start')
        await next()
        console.log('middleware1 end')
    }
}
function middleware1(){
    return async (ctx, next) => {
        console.log('middleware1 start')
        await next()
        console.log('middleware1 end')
    }
}
function middleware1(){
    return async (ctx, next) => {
        console.log('middleware1 start')
        await next()
        console.log('middleware1 end')
    }
}
app.use()