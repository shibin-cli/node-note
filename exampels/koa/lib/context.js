const { URL } = require('url')

function parseQuery(str) {
  const res = Object.create(null)

  str
    .substr(1)
    .split('&')
    .forEach((item) => {
      if (item) {
        const i = item.search('=')
        const key = item.substr(0, i)
        const val = item.substr(i + 1)
        res[key] = res[key]
          ? Array.isArray(res[key])
            ? [...res[key], val]
            : [res[key], val]
          : val
      }
    })
  return res
}
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
    // this.res.end(this._body)
  },
  get method() {
    return this.req.method
  },
  set(filed, val) {
    this.res.setHeader(filed, val)
  },
  throw(code, text) {
    this.res.statusCode = code
    this.res.end(text || 'Error')
  },
  redirect(url) {
    this.res.statusCode = 302
    this.set('Location', url)
    this.body = `Redirecting to ${url}.`
  },
  get path() {
    return new URL(this.req.url, 'http://localhost').pathname
  },
  get query() {
    return parseQuery(new URL(this.req.url, 'http://localhost').search)
  }
}
function creatContext(req, res) {
  const ctx = Object.create(context)
  ctx.req = req
  ctx.res = res
  return ctx
}
module.exports = creatContext
