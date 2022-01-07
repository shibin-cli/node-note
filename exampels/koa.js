const http = require('http')
const Emitter = require('events')
const compose = require('./compose')

const context = {
  _body: null,
  req: null,
  res: null,
  get body() {
    return this._body
  },
  set body(val) {
    if (typeof val !== 'string') {
      val = JSON.stringify(val)
    }
    this._body = val
    this.res.end(this._body)
  },
  get method() {
    return this.req.method
  },
  get url() {
    return this.req.url
  },
  set(headerName, header) {},
  throw(code, text) {
    this.res.statusCode = code
    this.res.end(text || 'Error')
  }
}
class Koa extends Emitter {
  constructor() {
    super()
    this.middlewares = []
  }
  use(middleware) {
    this.middlewares.push(middleware)
  }
  callback(req, res) {
    const ctx = Object.create(context)
    ctx.req = req
    ctx.res = res
    compose(this.middlewares)(ctx).then(() => {
      if (!ctx.body) {
        ctx.throw(404, 'Not Found')
      }
    })
  }
  listen() {
    const server = http.createServer(this.callback.bind(this))
    return server.listen(...arguments)
  }
}

module.exports = Koa
