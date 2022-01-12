const Koa = require('./lib/koa')
const Router = require('./lib/router')

const app = new Koa()
const router = new Router()

router.get('/hello', async (ctx, next) => {
  console.log('hello123')
  ctx.body = '<h1>Hello</h1>'
})
router.get('/world', async (ctx, next) => {
  ctx.body = '<h1>world</h1>'
})
router.get('/world/:id', async (ctx, next) => {
  console.log(ctx.query)
  ctx.body = `id:${ctx.params.id}`
})
app.use(router.routes())
app.listen(3000, () => {
  console.log('sever listen http://localhost:3000')
})
