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
