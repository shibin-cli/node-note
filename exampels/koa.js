const http = require('http')
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
        this.req.end(this._body)
    },
    get method() {
        return this.req.method
    },
    get url() {
        return this.req.url
    },
    set(headerName, header) {

    }

}
class Koa extends Emitter {
    constructor() {
        super()
        this.middlewares = []
        this.context = Object.create(context)
    }
    use(middleware) {
        this.middlewares.push(middleware)
    }
    callback() {

    }
    listen(args) {
        const server = http.createServer(this.callback())
        return server.listen(...args)
    }
}