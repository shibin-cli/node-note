---
sidebar_position: 4
---

# koa-router

## 使用

```js
var Koa = require('koa')
var Router = require('koa-router')

var app = new Koa()
var router = new Router()

router.get('/', (ctx, next) => {
  // ctx.router available
})
router.get('/:category/:title', (ctx, next) => {
  console.log(ctx.params)
  // => { category: 'programming', title: 'how-to-node' }
})
app.use(router.routes()).use(router.allowedMethods())
```

## 实现

调用`route.get('/xxx', middleware)`、`route.post('/xxx', middleware)`等时,会将注册的方法和中间键都保存起来

调用`app.use(router.routes())`后，当有请求过来时，就会处理我们注册的路由，当访问路径和方法都匹配时，就执行该中间键

```js
router.get('/', (ctx, next) => {
  // ctx.router available
})
router.get('/aa', middleware)
app.use(router.routes())
```

```js
class Router {
  routes() {
    return async (ctx, next) => {
      for (let i = 0, len = stack.length; i < len; i++) {
        const routeItem = stack[i]
        // 方法和路径都匹配
        if (routeItem.path === ctx.path && routeItem.method === ctx.method) {
          route = stack[i].middleware
          route(ctx, next)
          break
        }
      }
      await next()
    }
  }
}
```

```js
class Layer {
  constructor(path, methods, middleware, opts) {
    this.path = path
    this.methods = methods
    this.middleware = middleware
  }
}
class Router {
  constructor() {
    this.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']
    this.stack = []
    this.initMethods()
  }
  initMethods() {
    this.methods.forEach((method) => {
      // 当调用router.get...,就是注册路由
      this[method] = this[method.toLowerCase()] = (path, middleware) => {
        this.register(path, [method], middleware)
      }
    })
  }
  // 路由注册，会将方法和中间键保存下来
  register(path, methods, middleware, opts) {
    let route = new Layer(path, methods, middleware, opts)
    this.stack.push(route)
    return this
  }
  routes() {
    return async (ctx, next) => {
      let stack = this.stack
      let route
      for (let i = 0, len = stack.length; i < len; i++) {
        const routeItem = stack[i]
        if (
          routeItem.path === ctx.path &&
          routeItem.methods.indexOf(ctx.method) > -1
        ) {
          route = stack[i].middleware
          break
        }
      }
      if (typeof route === 'function') {
        route(ctx, next)
      }
      await next()
    }
  }
}
```

下面实现动态路由

- 实现思路就是根据注册的路由生产动态正则
  - /a/:id 生成正则`/^\/a\/([^/]+?)[/]?$/`，并保存动态的键`[id]`
  - 发送请求时，根据正则去匹配，获取对应 id 的值，并将值添加到上下文对象上,如`{id: 1}`

```js
class Layer {
  constructor(path, methods, middleware, opts) {
    this.path = path
    this.methods = methods
    this.middleware = middleware
    this.pathRegStrList = []
    this.pathPramsKeyList = []
    this.initPathToRegxExpConfig(path)
  }
  // 生产动态正则和参数
  initPathToRegxExpConfig(path) {
    const pathItemReg = /\/([^\/]{2,})/g
    const paramsKeyReg = /\/\:([\w\_]+)/
    // 所有地址
    const pathItems = path.match(pathItemReg)
    // 用来保存动态地址
    const pathPramsKeyList = []
    // 路径匹配正则数组
    const pathRegList = []
    if (Array.isArray(pathItems)) {
      pathItems.forEach((path) => {
        if (paramsKeyReg.test(path)) {
          pathRegList.push(`/([^\/]+?)`)
          pathPramsKeyList.push(path.replace(/\/\:/g, ''))
        } else {
          pathRegList.push(path)
        }
      })
    }
    this.pathPramsKeyList = pathPramsKeyList
    this.pathReg = new RegExp(`^${pathRegList.join('')}[\/]?$`)
  }
  match(path, method) {
    return this.methods.indexOf(method) > -1 && this.pathReg.test(path)
  }
  getParams(path) {
    const execRes = this.pathReg.exec(path)
    if (!execRes) {
      return {}
    }
    const res = {}
    this.pathPramsKeyList.forEach((item, index) => {
      res[item] = execRes[index + 1]
    })
    return res
  }
}
```
