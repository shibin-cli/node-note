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
class Router {
  constructor() {
    this.methods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']
    this.stack = []
    this.initMethods()
  }
  initMethods() {
    this.methods.forEach((method) => {
      this[method] = this[method.toLowerCase()] = (path, middleware) => {
        this.register(path, [method], middleware)
      }
    })
  }
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
        if (routeItem.match(ctx.path, ctx.req.method)) {
          route = stack[i].middleware
          ctx.params = routeItem.getParams(ctx.path)
          break
        }
      }
      if (typeof route === 'function') {
        route(ctx, next)
      }
      await next()
    }
  }
  use() {
    return this
  }
}
module.exports = Router
