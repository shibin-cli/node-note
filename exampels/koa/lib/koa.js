const http = require('http')
const Emitter = require('events')
const compose = require('./compose')
const creatContext = require('./context')

class Koa extends Emitter {
  constructor() {
    super()
    this.middlewares = []
  }
  callback() {
    const fn = compose(this.middlewares)
    const handleRequest = (req, res) => {
      const ctx = creatContext(req, res)
      this.handleRequest(ctx, fn)
    }
    return handleRequest
  }
  use(middleware) {
    this.middlewares.push(middleware)
  }
  handleRequest(ctx, fnMiddleware) {
    fnMiddleware(ctx).then(() => {
      if (!ctx.body) {
        ctx.throw(404, 'Not Found')
      }
      ctx.res.end(ctx.body)
    })
  }
  listen() {
    const server = http.createServer(this.callback())
    server.listen(...arguments)
  }
}
module.exports = Koa
