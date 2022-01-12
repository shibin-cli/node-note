---
sidebar_position: 3
---

# Koa 的实现

实现一个简易的 Koa

## 初始化

### 初始化 Koa 对象

```js
const Emitter = require('events')

class Koa extends Emitter {
  constructor() {
    super()
    this.middlewares = []
  }
}
```

### 初始化 context

```js
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
  }
  ...
}
```

```js
class Koa extends Emitter {
  constructor() {
    ...
    this.context = Object.create(context)
  }
}
```

### 中间键

```js
class Koa extends Emitter {
  constructor() {
    ...
    this.middlewares = []
  }
  use(middleware) {
    ...
    this.middlewares.push(middleware)
  }
}
```

### 启动 http 服务

```js
class Koa extends Emitter {
  callback(req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World')
  }
  listen() {
    const server = http.createServer(this.callback)
    return server.listen(...arguments)
  }
}
```

### http 服务结合 compose 使用

```js
class Koa extends Emitter {
  constructor() {
    super()
    this.middlewares = []
    this.ctx = Object.create(context)
  }
  use(middleware) {
    this.middlewares.push(middleware)
  }
  callback(req, res) {
    res.statusCode = 200
    this.ctx.req = req
    this.ctx.res = res
    compose(this.middlewares)(this.ctx)
  }
  listen() {
    const server = http.createServer(this.callback.bind(this))
    return server.listen(...arguments)
  }
}
```

### 完整源码

通过上面几个步骤，我们得到了下面的代码

```js
const http = require('http')
const Emitter = require('events')
const compose = require('./compose') //参考上页内容

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
  }
}
class Koa extends Emitter {
  constructor() {
    super()
    this.middlewares = []
    this.ctx = Object.create(context)
  }
  use(middleware) {
    this.middlewares.push(middleware)
  }
  callback(req, res) {
    res.statusCode = 200
    this.ctx.req = req
    this.ctx.res = res
    compose(this.middlewares)(this.ctx)
  }
  listen() {
    const server = http.createServer(this.callback.bind(this))
    return server.listen(...arguments)
  }
}

module.exports = Koa
```

其中 compose 的源码可以参考 [koa 中间键的洋葱模型](https://shibin-cli.github.io/node-note/docs/koa/koa-compose) ，也可以使用 [koa-compose](https://github.com/koajs/compose)

测试代码

```js
const Koa = require('./koa')
const app = new Koa()
function middleware1() {
  return async (ctx, next) => {
    console.log('middleware1 start')
    await next()
    console.log('middleware1 end')
  }
}
function middleware2() {
  return async (ctx, next) => {
    console.log('middleware2 start')
    await next()
    console.log('middleware2 end')
  }
}

app.use(middleware1())
app.use(middleware2())
app.use(async (ctx, next) => {
  ctx.body = {
    status: 1
  }
})
console.log(app.middlewares)
app.listen(3000, () => {
  console.log('sever listen http://localhost:3000')
})
```

访问 [http://localhost:3000](http://localhost:3000) ，控制台会输出,同时页面会显示 `{"status": 1}`

```js
middleware1 start
middleware2 start
middleware2 end
middleware1 end
```

## 完善

### 完善请求处理

```js
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

function creatContext(req, res) {
  const ctx = Object.create(context)
  ctx.req = req
  ctx.res = res
  return ctx
}
```

### 重定向

```js
const context = {
  ...
  redirect(url) {
    this.res.statusCode = 302
    this.set('Location', url)
    this.body = `Redirecting to ${url}.`
  }
  ...
}
```

### 完善 url 解析和 query 参数处理

```js
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
  get path() {
    return new URL(this.req.url, 'http://localhost').pathname
  },
  // 将?a=1&b=2 解析为 {a: "1", b: "2"}
  get query() {
    return parseQuery(new URL(this.req.url, 'http://localhost').search)
  }
}
```

### 其他

```js
const context = {
  ...
   get url() {
    return this.req.url
  },
  set(filed, val) {
    this.res.setHeader(filed, val)
  },
  throw(code, text) {
    this.res.statusCode = code
    this.res.end(text || 'Error')
  },
  get path() {
    return this.req.url
  }
  ...
}
```

### 完整代码

```js
// koa.js
const Emitter = require('events')
const http = require('http')
const creatContext = require('./lib/context')
const compose = require('./lib/compose')

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
    // console.log(middleware)
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
```

上下文 context

```js
// context.js
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
```

compose

```js
// compose.js
function compose(middlewares) {
  console.log(middlewares)
  return (context, next) => {
    return dispatch(0)
    function dispatch(i) {
      let fn = middlewares[i]
      if (i === middlewares.length) fn = next
      if (!fn) return Promise.resolve()
      return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
    }
  }
}
module.exports = compose
```
