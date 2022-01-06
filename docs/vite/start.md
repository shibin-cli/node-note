---
sidebar_position: 1
---

# Vite 使用入门

[Vite](https://cn.vitejs.dev) 的中文官网 https://cn.vitejs.dev

## Vite 介绍

[Vite](https://cn.vitejs.dev) 是一种新型前端构建工具，能够显著提升前端开发体验

- 一个开发服务器，它基于 [原生 ES 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 提供了 丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。
- 一套构建指令,它使用 [Rollup](https://rollupjs.org) 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

[Vite](https://cn.vitejs.dev) 的特点

- 简单
- 速度快
- 易于拓展

[Vite](https://cn.vitejs.dev) 的优势

- High Level
- 不包含编译能力（底层编译能力源自 [esbuild](https://esbuild.github.io)、[Rollup](https://rollupjs.org)）
- 开发时基于 esm 加载

减少的工作

- dev serve
- 各类 loader
- build 命令

## Vite 的优势

Vite 对比 [vue-cli](https://cli.vuejs.org/zh/) 、[create-react-app](https://create-react-app.dev)

- 配置简单
- 修改配置文件、
  - [React](https://react.docschina.org) 需要 eject
  - [Vue](https://cn.vuejs.org) 需要在 `vue.config.js` 中修改 `configureWebpack` 和 `chainWebpack`
- 有自身的插件系统，同时兼容 rollup 插件
- 构建速度快
  - Vite 只有在加载时才会构建
  - Webpack 启动时候会直接编译所有文件
  - 使用 [esbuild](https://esbuild.github.io) 进行文件编译

## 使用 Vite 创建项目

```bash
npm init vite@latest
```

根据提示创建对应的项目即可

## css

Vite 不需要任何配置，就支持 css

由于 Vite 的目标仅为现代浏览器，因此建议使用原生 [CSS 变量](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties) 和实现 CSSWG 草案的 PostCSS 插件

```css
:root {
  --main-bg-color: #282c34;
}
.app {
  background-color: var(--main-bg-color);
}
```

### 配置 postcss

只需要安装对应的插件，配置 [postcss](https://github.com/postcss/postcss) 即可

```js
// postcss.config.js
module.exports = {
  plugins: [require("autoprefixer"), require("postcss-preset-env")],
};
```

### css module

任何以 .module.css 为后缀名的 CSS 文件都被认为是一个 [CSS modules](https://github.com/css-modules/css-modules) 文件

```css
.red {
  color: red;
}
```

```jsx
import colors from "@/css/color.module.css";

<p className={colors.red}>red</p>;
```

### css 预处理

Vite 不需要任何配置，只需安装编译器即可

```bash
npm i sass -D
```

```scss
$bg-color: #282c34;
.App {
  color: $bg-color;
}
```

## TypeScript

Vite 天然支持引入 .ts 文件。

在开发环境下，Vite 使用 [esbuild](https://esbuild.github.io) 将 [TypeScript](https://www.tslang.cn/) 转译到 JavaScript,约是 tsc 速度的 20~30 倍,同时 HMR 更新反映到浏览器的时间小于 50ms。

但是 Vite 并**不执行任何类型检查**。只编译，不校验。

手动校验

```bash
tsc --noEmit
```

生成 ts 配置文件

```bash
tsc --init
```

以 react 项目为例，根据需要配置 ts 文件

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    // jsx
    "jsx": "react-jsx",
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    // 设置后，使用import.meta等就会有类型提示
    "types": ["vite/client"],
    "forceConsistentCasingInFileNames": true
  }
}
```

## eslint

```bash
npm install eslint --save-dev
./node_modules/.bin/eslint --init
```

然后根据提示,选择相应的规则或手动配置

```bash
? How would you like to use ESLint? ...
  To check syntax only> To check syntax and find problems
√ How would you like to use ESLint? · style
√ What type of modules does your project use? · esm√ Which framework does your project use? · react
√ Does your project use TypeScript? · No / Yes
√ Where does your code run? · browser√ How would you like to define a style for your project? · guide
√ Which style guide do you want to follow? · standard
√ What format do you want your config file to be in? · JavaScript
```

### 集成 eslint

安装 `vite-plugin-eslint`

```bash
vite-plugin-eslint
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig({
  plugins: [react(), eslintPlugin()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

下面是一个 react 项目的 eslint 配置

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "plugin:react/jsx-runtime", "standard"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "no-use-before-define": 0,
    "space-before-function-paren": 0,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
```

## [静态资源](https://cn.vitejs.dev/guide/assets.html)

Vite 无须配置，就可以引入图片、css 文件等

### 将资源引入为 URL

服务时引入一个静态资源会返回解析后的公共路径：

```js
import imgUrl from "./img.png";
document.getElementById("img").src = imgUrl;
```

### 显式 URL 引入

未被包含在内部列表或 assetsInclude 中的资源，可以使用 ?url 后缀显式导入为一个 URL

```js
import logo from "./assets/logo.svg?url";
console.log(logo); ///src/assets/logo.svg
```

### 将资源引入为字符串

资源可以使用 ?raw 后缀声明作为字符串引入。

```js
import logo from "./assets/logo.svg";
console.log(logo); //文件内容
```

## [环境变量](https://cn.vitejs.dev/guide/env-and-mode.html)

Vite 在一个特殊的 import.meta.env 对象上暴露环境变量

- import.meta.env.MODE: {string} 应用运行的模式。
- import.meta.env.BASE_URL: {string} 部署应用时的基本 URL。他由 base 配置项决定。
- import.meta.env.PROD: {boolean} 应用是否运行在生产环境。
- import.meta.env.DEV: {boolean} 应用是否运行在开发环境 (永远与 import.meta.env.PROD 相反)`。

Vite 使用 [dotenv](https://github.com/motdotla/dotenv) 从你的 环境目录 中的下列文件加载额外的环境变量：

```bash
.env                # 所有情况下都会加载
.env.local          # 所有情况下都会加载，但会被 git 忽略
.env.[mode]         # 只在指定模式下加载
.env.[mode].local   # 只在指定模式下加载，但会被 git 忽略
```

Vite 为了防止意外地将一些环境变量泄漏到客户端，只有以 VITE\_ 为前缀的变量才会暴露给经过 vite 处理的代码

```bash
DB_PASSWORD=foobar
VITE_SOME_KEY=123
```

只有 VITE_SOME_KEY 会被暴露为 import.meta.env.VITE_SOME_KEY 提供给客户端源码，而 DB_PASSWORD 则不会。

:::caution 安全注意事项

- .env.\*.local 文件应是本地的，可以包含敏感变量。你应该将 .local 添加到你的 .gitignore 中，以避免它们被 git 检入
- 由于任何暴露给 Vite 源码的变量最终都将出现在客户端包中，VITE\_\* 变量应该不包含任何敏感信息。

:::

相关文档地址 https://cn.vitejs.dev/guide/env-and-mode.html

## WebAssembly

[WebAssembly](https://developer.mozilla.org/zh-CN/docs/WebAssembly) 是一种新的编码方式，可以在现代的网络浏览器中运行 － 它是一种低级的类汇编语言，具有紧凑的二进制格式，可以接近原生的性能运行

预编译的 .wasm 文件可以直接被导入 —— 默认导出一个函数，返回值为所导出 wasm 实例对象的 Promise：

```js
import init from "./example.wasm";

init().then((exports) => {
  exports.test();
});
```

相关文档地址 https://cn.vitejs.dev/guide/features.html#webassembly
