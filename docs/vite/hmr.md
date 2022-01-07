---
sidebar_position: 2
---

# 热更新

热更新就是页面加载完成后，修改页面代码后，不需要重新刷新页面，就可以在运行更新后的代码，同时还能尽可能的保持之前的状态

HMR 之所以现在在前端界这么流行，一个很大的原因就是 React 的崛起，这其中有两个主要原因：

- 端应用变得愈加复杂，并且状态变得非常多，重新刷新页面的成本变得越来越大
- React 是纯粹的 `state => UI` 的前端框架，每次前端的交互都代表着 state 的变化，保留状态对于开发有非常大的意义

这些大大提高了我们的开发效率

## 如何实现

hmr 其实就是重新加载一个文件

```html
<script src="main.js">
```

hmr 需要做的事就是

- 知道这个 js 文件什么时候被修改了
- 重新加载修改之后的文件

对于第一点业界基本就是选择使用 Websocket 来创建客户端和服务端之间的长链接，在服务端进行文件变化的监听，当服务端监听到文件变化之后把对应的信息发送到客户端，客户端接收到通知之后进行对应的更新操作。

更新的过程就是在 DOM 上挂载一个新的 script 标签并加载更新之后的文件来运行新代码。但是简单地这么做会有很明显的问题

- 前一个脚本文件没有卸载，如果没有模块管理功能，会造成命名冲突。同时也存在着内存无法释放的问题。
- 如果有另外一个模块引用当前模块，那么如果没有什么特殊的操作，另一模块仍然会使用模块闭包内的引用，不会更新。

## webpack 中的 hmr

webpack 本身就是一个基于 commonjs 模块管理的构建工具，当然后续其也实现了 ESM 的模块管理功能

假设有 a 和 b 两个 js 文件，而 b 中引入了 a 。

```js
// b.js
const a = require("./a");

a();
```

```js
// a.js
module.exports = () => {
  console.log("hello world");
};
```

如果 a.js 发生了修改，需要如何更新呢？ 很简单，只需要这时候去加载新的 a.js 文件，那么 b 模块执行的结果就是最新的

webpack 编译会生成这样的代码

```js
webpack__modules[0] = { moduleA };
webpack__modules[1] = { moduleB };
webpack__modules[2] = { moduleC };

const a = __webpack__require__(0);
```

如果 a 模块发生了更改

```js
socket.on("update", (path) => {
  loadScript(path).then((newModule) => {
    webpack__modules[0] = newModule;
  });
});
```

这样就更新了 webpack 缓存中的 A 模块

那么 b 模块中可以这样

```js
if (module.hot) {
  module.accept("./a", (newA) => {
    newA();
  });
}
```

这个代码就在 webpack 中注册了一个对于 a 模块的热更新事件监听，当 webpack 接收到了更新事件，就会通知这个回调，并且把新的模块传入，我们就可以根据需要进行更新。
