# 使用基础

[Egg.js](https://eggjs.org/zh-cn) 是基于 [Koa](https://github.com/koajs/koa) 开发，为企业级框架和应用而生

Egg 奉行 **『约定优于配置』**，按照一套 [统一的约定](https://eggjs.org/zh-cn/advanced/loader.html) 进行应用开发，团队内部采用这种方式可以减少开发人员的学习成本，开发人员不再是『钉子』，可以流动起来。同时还有很高的扩展性，可以按照团队的约定定制框架。使用 [Loader](https://eggjs.org/zh-cn/advanced/loader.html) 可以让框架根据不同环境定义默认配置，还可以覆盖 Egg 的默认约定。

更多介绍查看 [Egg.js 是什么](https://eggjs.org/zh-cn/intro/index.html)

## 快速开始

查看 [官网文档](https://eggjs.org/zh-cn/intro/quickstart.html)

## 使用脚手架创建项目

```bash
pnpm init egg --type=simple
pnpm i
npm run dev
# 打开 http://127.0.0.1:7001
```

## 手动创建项目

```bash
mkdir egg-example
cd egg-example
npm init
npm i egg
npm i egg-bin -D
```

```json
{
  "name": "egg-example",
  "scripts": {
    "dev": "egg-bin dev"
  }
}
```

如果你熟悉 Web 开发或 MVC，肯定猜到我们第一步需要编写的是 Controller 和 Router。

### 编写 Controller

```js
// app/controller/home.js
const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'Hello world'
  }
}

module.exports = HomeController
```

### 编写 Router

```js
// app/router.js
module.exports = (app) => {
  const { router, controller } = app
  router.get('/', controller.home.index)
}
```

### 添加配置文件

```js
// config/config.default.js
exports.keys = <此处改为你自己的 Cookie 安全字符串>;
```

创建之后你的目录结构如下

```
egg-example
├── app
│   ├── controller
│   │   └── home.js
│   └── router.js
├── config
│   └── config.default.js
└── package.json
```

然后运行启动命令

```bash
npm run dev
# 打开 http://localhost:7001
```

然后创建其他目录结构，参考 [文档](https://eggjs.org/zh-cn/intro/quickstart.html#%E9%80%90%E6%AD%A5%E6%90%AD%E5%BB%BA)

## 目录结构

框架目录可以参考 [egg 官方文档](https://eggjs.org/zh-cn/basics/structure.html)

- `app/router.js` 用于配置 URL 路由规则，具体参见 [Router](https://eggjs.org/zh-cn/basics/router.html)。
- `app/controller/**` 用于解析用户的输入，处理后返回相应的结果，具体参见 [Controller](https://eggjs.org/zh-cn/basics/controller.html)。
- `app/service/**` 用于编写业务逻辑层，可选，建议使用，具体参见 [Service](https://eggjs.org/zh-cn/basics/service.html)。
- `app/middleware/**` 用于编写中间件，可选，具体参见 [Middleware](https://eggjs.org/zh-cn/basics/middleware.html)。
- `app/public/**` 用于放置静态资源，可选，具体参见内置插件 [egg-static](https://github.com/eggjs/egg-static)。
- `app/extend/**` 用于框架的扩展，可选，具体参见[框架扩展](https://eggjs.org/zh-cn/basics/extend.html)。
- `config/config.{env}.js` 用于编写配置文件，具体参见[配置](https://eggjs.org/zh-cn/basics/config.html)。
- `config/plugin.js` 用于配置需要加载的插件，具体参见[插件](https://eggjs.org/zh-cn/basics/plugin.html)。
- `test/**` 用于单元测试，具体参见[单元测试](https://eggjs.org/zh-cn/core/unittest.html)。
- `app.js` 和 `agent.js` 用于自定义启动时的初始化工作，可选，具体参见启动自定义。关于 `agent.js` 的作用参见 [Agent 机制](https://eggjs.org/zh-cn/core/cluster-and-ipc.html#agent-%E6%9C%BA%E5%88%B6)。

由内置插件约定的目录：

- `app/public/**` 用于放置静态资源，可选。
- `app/schedule/**` 用于定时任务，可选。

若需自定义自己的目录规范，参见 [Loader API](https://eggjs.org/zh-cn/advanced/loader.html)

- `app/view/**` 用于放置模板文件，可选，由模板插件约定，具体参见[模板渲染](https://eggjs.org/zh-cn/core/view.html)。
- `app/model/**` 用于放置领域模型，可选，由领域类相关插件约定，如 [egg-sequelize](https://github.com/eggjs/egg-sequelize)。

## 内置对象

框架中内置的一些基础对象，包括从 Koa 继承而来的 4 个对象（Application, Context, Request, Response) 以及框架扩展的一些对象（Controller, Service, Helper, Config, Logger）

### Application

Application 是全局应用对象，在一个应用中，只会实例化一个，它继承自 `Koa.Application`，在它上面我们可以挂载一些全局的方法和对象。我们可以轻松的在插件或者应用中扩展 Application 对象。

#### 事件

在框架运行时，会在 Application 实例上触发一些事件，应用开发者或者插件开发者可以监听这些事件做一些操作。作为应用开发者，我们一般会在启动自定义脚本中进行监听

- server: 该事件一个 worker 进程只会触发一次，在 HTTP 服务完成启动后，会将 HTTP server 通过这个事件暴露出来给开发者。
- error: 运行时有任何的异常被 onerror 插件捕获后，都会触发 error 事件，将错误对象和关联的上下文（如果有）暴露给开发者，可以进行自定义的日志记录上报等处理。
- request 和 response: 应用收到请求和响应请求时，分别会触发 request 和 response 事件，并将当前请求上下文暴露出来，开发者可以监听这两个事件来进行日志记录。

```js
// app.js
module.exports = (app) => {
  app.once('server', (server) => {
    // websocket
  })
  app.on('error', (err, ctx) => {
    // report error
  })
  app.on('request', (ctx) => {
    // log receive request
  })
  app.on('response', (ctx) => {
    // ctx.starttime is set by framework
    const used = Date.now() - ctx.starttime
    // log total cost
  })
}
```

### 获取方式

启动自定义脚本

```js
// app.js
module.exports = (app) => {
  app.cache = new Cache()
}
```

controller 中获取

```js
// app/controller/user.js
class UserController extends Controller {
  async fetch() {
    this.ctx.body = this.app.cache.get(this.ctx.query.id)
    // 通过 ctx.app 访问到 Application 对象 this.ctx.app.cache.get(this.ctx.query.id)
    // this.ctx.body = this.ctx.app.cache.get(this.ctx.query.id)
  }
}
```

### Context

Context 是一个请求级别的对象，继承自 Koa.Context。

在每一次收到用户请求时，框架会实例化一个 Context 对象，这个对象封装了这次用户请求的信息，并提供了许多便捷的方法来获取请求参数或者设置响应信息。框架会将所有的 Service 挂载到 Context 实例上，一些插件也会将一些其他的方法和对象挂载到它上面（egg-sequelize 会将所有的 model 挂载在 Context 上）

### 获取方式

- Controller 中的获取方式在上面的例子中已经展示过了
- 在 Service 中获取和 Controller 中获取的方式一样，
- 在 Middleware 中获取 Context 实例则和 Koa 框架在中间件中获取 Context 对象的方式一致

```js
// app/controller/user.js
class UserController extends Controller {
  async fetch() {
    this.ctx.body = xxxx
    xxx
  }
}
```

```js
// Koa v1
function* middleware(next) {
  // this is instance of Context
  console.log(this.query)
  yield next
}

// Koa v2
async function middleware(ctx, next) {
  // ctx is instance of Context
  console.log(ctx.query)
}
```

除了在请求时可以获取 Context 实例之外， 在有些非用户请求的场景下我们需要访问 service / model 等 Context 实例上的对象，我们可以通过 Application.createAnonymousContext() 方法创建一个匿名 Context 实例：

```js
// app.js
module.exports = (app) => {
  app.beforeStart(async () => {
    const ctx = app.createAnonymousContext()
    // preload before app start
    await ctx.service.posts.load()
  })
}
```

在定时任务中的每一个 task 都接受一个 Context 实例作为参数，以便我们更方便的执行一些定时的业务逻辑：

```js
// app/schedule/refresh.js
exports.task = async (ctx) => {
  await ctx.service.posts.refresh()
}
```

### Request & Response

Request 继承自 Koa.Request，Response 继承自 Koa.Response

可以在 Context 的实例上获取到当前请求的 Request(ctx.request) 和 Response(ctx.response) 实例。

```js
// app/controller/user.js
class UserController extends Controller {
  async fetch() {
    const { app, ctx } = this
    const id = ctx.request.query.id
    ctx.response.body = app.cache.get(id)
  }
}
```

:::tip 提示

- Koa 会在 Context 上代理一部分 Request 和 Response 上的方法和属性，参见 Koa.Context。
- 如上面例子中的 ctx.request.query.id 和 ctx.query.id 是等价的，ctx.response.body= 和 ctx.body= 是等价的。
- **注意**，获取 POST 的 body 应该使用 **ctx.request.body**，而不是 ctx.body。

:::

### Controller

- ctx - 当前请求的 Context 实例。
- app - 应用的 Application 实例。
- config - 应用的配置。
- service - 应用所有的 service。
- logger - 为当前 controller 封装的 logger 对象。

在 Controller 文件中，可以通过两种方式来引用 Controller 基类

推荐使用从 egg 上获取

```js
// app/controller/user.js

// 从 egg 上获取（推荐）
const Controller = require('egg').Controller
class UserController extends Controller {
  // implement
  async user() {
    //   this.ctx
    //   this.app
    console.log(this.config.keys)
    this.ctx.body = {
      status: 0,
      user: await this.service.user.findUser(1)
    }
  }
}
module.exports = UserController

// 从 app 实例上获取
module.exports = (app) => {
  return class UserController extends app.Controller {
    // implement
    // app.ctx
  }
}
```

### Service

```js
// app/service/user.js

// 从 egg 上获取（推荐）
const Service = require('egg').Service
class UserService extends Service {
  // implement
  async findUser(id) {
    //   xxxx
    console.log(this.ctx.xxx)
  }
}
module.exports = UserService

// 从 app 实例上获取
module.exports = (app) => {
  return class UserService extends app.Service {
    // implement
  }
}
```

### Helper

Helper 用来提供一些实用的 utility 函数。它的作用在于我们可以将一些常用的动作抽离在 helper.js 里面成为一个独立的函数，这样可以用 JavaScript 来写复杂的逻辑，避免逻辑分散各处，同时可以更好的编写测试用例。

Helper 自身是一个类，有和 Controller 基类一样的属性，它也会在每次请求时进行实例化，因此 Helper 上的所有函数也能获取到当前请求相关的上下文信息。

```js
class UserController extends Controller {
  async fetch() {
    ...
    ctx.body = ctx.helper.format(xxx)
  }
}
```

```js
// app/extend/helper.js
module.exports = {
  format() {
    xxx
    return xxx
  }
}
```
