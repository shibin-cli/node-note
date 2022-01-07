---
sidebar_position: 2
---

# koa 中间键的洋葱模型

在 koa 源码中，可以看到引入了 [koa-compose](https://github.com/koajs/compose)

## 模拟实现 koa 中间键的洋葱模型

实现 koa 中间键的洋葱模型非常简单

### 实现思路

实现思路就是每次执行中间键 `await next()` ，都要等到下次中间键执行完毕再往后执行

```js
function middleware1() {
  return async (ctx, next) => {
    console.log('logger1', ctx.path)
    // 等待下个中间键执行完毕
    await next()
    console.log('logger1', ctx.body)
  }
}
```

### 实现代码

实现代码也非常简单

```js
/**
 * @param {Array} middleware
 * @return {Function}
 */
function compose(middlewares) {
  return (context, next) => {
    return dispatch(0)
    function dispatch(i) {
      let fn = middlewares[i]
      if (i === middlewares.length) fn = next
      if (!fn) return Promise.resolve()
      // 返回一个Promise
      // fn(context, dispatch.bind(null, i+1))
      // context 上下文对象
      // dispatch.bind(null, i+1) 就是next ,可以将next传递给中间键
      return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
    }
  }
}
```

下面是 [koa-compose](https://github.com/koajs/compose) 的源码

```js
'use strict'

/**
 * Expose compositor.
 */

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```
