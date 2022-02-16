---
sidebar_position: 3
---

# Webpack4
## 模块打包工具的由来
* ES Modules存在环境兼容问题
* 模块文件过多，网络请求频繁
* 所有前端资源都需要模块化
勿容置疑，模块化是必要的
* 新特性代码编译
* 模块化Javascript打包
* 支持不同类型资源的模块
## 模块打包工具
* 模块打包器
* 模块加载器(loader)
* 代码拆分
* 资源模块化(Asset Module)  

打包工具解决的是前端整体的模块化，并不单指JavaScript模块化
## webpack 快速上手
src创建一个index.js,index.js引入另一个js文件
```
npm install webpack webpack-cli --save-dev
webpack
```
webpack默认会将src下的index.js文件作为入口文件，打包后的文件默认放在dist目录下
就会将src目录下的文件打包到dist目录下
## webpack配置文件
新建webpack.config.js文件
```js
const path = require('path')
module.exports = {
    entry: './src/main.js', //入口文件
    output: {
        filename: 'bundle.js', //输出文件名称
        path: path.join(__dirname, 'output') //输出文件目录
    }
}
```
### 工作模式(mode)
[mode](https://www.webpackjs.com/concepts/mode/):
    - production 
    - development
    - none
```
webpack --mode=production
```
或
```js
module.exports = {
  mode: 'production'
}
```
### Webpack打包结果运行原理
将webpack的工作模式设置为none   

webpack.config.js
```js
const path = require('path')
module.exports = {
    entry: './src/index.js', //入口文件
    mode:'none',
    output: {
        filename: 'bundle.js', //输出文件名称
        path: path.join(__dirname, 'output') //输出文件目录
    }
}
```
创建入口文件index.js
```js
import createHeading from "./heading.js"

const heading = createHeading()
document.body.append(heading)
```  
下面是header.js
```js
export default ()=>{
    const element=document.createElement('h1')
    element.textContent='Hello Webpack'
    element.addEventListener('click',()=>{
        console.log('webpack')
    })
    return element
}
```
打包
```
yarn webpack
```
打包后生成bundle.js  

打包后的文件就是一个立即执行的函数
![打包后的文件](/img/webpack4/1.png)
![打包后的文件](/img/webpack4/2.png)
![打包后的文件](/img/webpack4/3.png)
![打包后的文件](/img/webpack4/4.png)
### 资源模块加载
webpack内部loader只能处理js文件   

打包css文件
```js
const path = require('path')
module.exports = {
    entry: './src/index.css', //入口文件
    mode: 'none',
    output: {
        filename: 'bundle.js', //输出文件名称
        path: path.join(__dirname, 'output') //输出文件目录
    },
    module: {
        rules: [{
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        }]
    }
}
```

### 导入资源模块

```js
import './style.css'
```
webpack 根据代码的需要动态导入资源，需要资源的不是应用，而是代码  

JavaScript驱动整个前端应用
* 逻辑合理，js确实需要这些文件资源
* 确保上线资源不缺失，都是必要的

### 加载器
#### 文件资源加载器
```js
const imgEl = new Image()
imgEl.src = img
document.body.append(imgEl)
```
```js
const path = require('path')
module.exports = {
    entry: './src/index.js', //入口文件
    mode: 'none',
    output: {
        filename: 'bundle.js', //输出文件名称
        path: path.join(__dirname, 'output'), //输出文件目录
        publicPath:'output/'
    },
    module: {
        rules: [{
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        },{
            test:/.png$/,
            use:'url-loader'
        }]
    }
}
```
![文件加载器](/img/webpack4/5.jpg)
#### URL加载器
url-loader  

DataURLS  `data[mediatype][;base64]<data>`

```js
module.exports = {
    entry: './src/index.js', //入口文件
    mode: 'none',
    output: {
        filename: 'bundle.js', //输出文件名称
        path: path.join(__dirname, 'output'), //输出文件目录
        publicPath:'output/'
    },
    module: {
        rules: [{
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        },{
            test:/.png$/,
            use: {
                loader: 'url-loader',//url-loader 必须先安装file-loader 
                options: {
                    limit: 10 * 1024
                }
            }
        }]
    }
}
```
#### 常用加载器分类
* 编译转换类
* 文件操作类型
* 代码检查类

#### webpack与es6
webpack默认并不会将es6代码编译为es5，如果需要，需要配置相应的加载器  

因为模块打包需要，所以会处理import和export  


```js
module.exports = {
    entry: './src/index.js', //入口文件
    mode: 'none',
    output: {
        filename: 'bundle.js', //输出文件名称
        path: path.join(__dirname, 'output'), //输出文件目录
        publicPath: 'output/'
    },
    module: {
        rules: [{
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /.png$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 10 * 1024
                }
            }
        }, {
            test: /.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    }
}
```
* webpack只是打包工具
* 加载器可以用来编译转换代码

#### Webpack加载资源的方式
1. 遵循ES Modules标准的import声明
2. 遵循CommonJS标椎的require函数
3. 遵循AMD标椎的define函数和require函数
4. Loader加载的非JavaScript也会触发资源加载
   - 样式代码中@import指令和url函数
   - html代码中图片标签的src属性
```html
<footer>
    <img src="./1.png" >
    <a href="./1.png">adfdsf</a>
</footer>
```  
```js
import footer from './footer.html'
document.write(footer)
```
webpack.config.js。需要用到[html-loader](https://webpack.docschina.org/loaders/html-loader/)
```js
{
    test:/.html$/,
    use:{
        loader:'html-loader',
        options:{
            attributes:{
                list:[{
                    tag:'img',
                    attribute:'src',
                    type:'src'
                },{
                    tag:'a',
                    attribute:'href',
                    type:'src'
                }]
            }
        }
    }
}
```

### Webpack核心工作原理
Loader机制是webpack的核心

#### 开发一个loader
webpack.config.js
```js
const path = require('path')
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        publicPath: path.join(__dirname, 'dist')
    },
    mode: 'none',
    module: {
        rules: [{
            test: /.md$/,
            use: ['html-loader', './markdown-loader.js'],
        }]
    }
}
```
loader负责资源的文件从输入到输出的转换
```js
const marked = require('marked')
module.exports = source => {
    const html = marked(source)
    return html
}
```
#### wbepack插件机制
Loader专注实现资源模块加载，Plugin解决其他自动化工作
##### 自动清除输出目录插件
```js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        publicPath: path.join(__dirname, 'dist')
    },
    mode: 'none',
    plugins:[
        new CleanWebpackPlugin()
    ]
}
```
##### 自动生成html插件 
```js
const path = require('path')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    mode: 'none',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin()
    ]
}
```
修改webpack
```js
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'webpack plugin',
            meta: {
                viewport: 'width=device-width'
            },
            template:'./index.html'
        })
    ]
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%=htmlWebpackPlugin.options.title%></title>
</head>
<body>
    <h2><%=htmlWebpackPlugin.options.title%></h2>
</body>
</html>
```
##### webpack常用插件
```js
const CopyWebpackPlugin=require('copy-webpack-plugin')
...
        new CopyWebpackPlugin({
            patterns:['public']
        })
...
```
##### 开发一个插件
通过在生命周期的钩子中挂载函数实现拓展
```js
class MyPlugin {
    apply(compiler) {
        console.log('MyPlugin 启动了')
        compiler.hooks.emit.tap('MyPlugin', compilation => {
            for (let name in compilation.assets) {
                if (name.endsWith('.js')) {
                    const contents = compilation.assets[name].source()
                    const res = contents.replace(/\/\*\*+\*\//g, '')
                    compilation.assets[name] = {
                        source: () => res,
                        size: () => res.length
                    }
                }
            }
        })
    }
}
```
### Webpack 开发
#### Webpack 开发问题
* 以http环境运行
* 自动编译+自动刷新
* 提供source map支持
webpack 自动编译
```
yarn webpack --watch
```
使用browser-sync 自动刷新
```
browser-sync dist --files '**/*'
```
这种操作太麻烦，效率也很低

##### Webpack Dev Server
提供用于开发的http server,集成自动编译和自动刷新浏览器等功能
```
yarn webpack-dev-server 
```
###### 静态资源访问
[devServer.contentBase](https://www.webpackjs.com/configuration/dev-server/#devserver-contentbase)
    - 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
    - 默认情况下，将使用当前工作目录作为提供内容的目录
```js
...
    devServer: {
        contentBase: 'public'
    }
...
```
###### 代理API
[devServer.proxy](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)
在 localhost:3000 上有后端服务的话，你可以这样启用代理：

```js
proxy: {
  "/api": "https://api.github.com"
}
```
请求到 /api/users 现在会被代理到请求 https://api.github.com/api/users。 

如果你不想始终传递 /api ，则需要重写路径：
```js
proxy: {
  "/api": {
    target: "https://api.github.com",
    pathRewrite: {"^/api" : ""}//重写路径
  }
}
```
###### Source Map
Source Map 映射源代码与装换过后文件的关系
  - 解决了源代码与运行代码不一致所产生的问题
```js
{
    "version": 3,//版本
    "source":["jquery-3.4.1.js"],//转换之前源文件的名称
    "name":[
        "global",
        "factory",
        "module",
        ...
    ],//源代码的成员名称(如开发阶段有意义的变量替换为简短的字符)
    "mapping":[...]//扎转换过后代码的字符与转换之前的映射关系
}
```
通过在代码最后一行添加注释可以引入Source Map文件
```
//# sourceMappingURL=jquery-3.4.1.min.map
```
webpack 配置Source Map  

* [devtool](https://www.webpackjs.com/configuration/devtool/)
    - eval 显示那个文件出错了，并不能显示出错的行数
    - eval-source-map   行数能够正确映射，因为会映射到原始代码中。它会生成用于开发环境的最佳品质的 source map。
    - cheap-eval-source-map 只能映射到行，没有列的信息
    - cheap-module-eval-source-map   类似 cheap-eval-source-map，没有经过loader处理
    - nosources-source-map - 创建的 source map 不包含 sourcesContent(源代码内容)。它可以用来映射客户端上的堆栈跟踪，而无须暴露所有的源代码。你可以将 source map 文件部署到 web 服务器  
  
其他模式参考官方文档https://www.webpackjs.com/configuration/devtool/  

**Source Map选择**  

开发环境 
* 可以选择cheap-module-eval-source-map   

生产环境
* 生产环境不要暴露源代码，可以none或nosources-source-map
* 尽量选择none,尽量将问题放在开发环境中去解决
##### webpack自动刷新问题
模块热更新（Hot Module Replacement）
    - 应用运行过程中实时替换某个模块
js模块热替换
```js

 {
    devServer: {
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
}   
```
webpack中的hmr需要手动处理模块热替换逻辑
* 为什么样式文件热更新开箱即用
    - 样式文件style-loader件自动处理  
* 我的项目没有手动处理，js照样可以热替换
    - 使用了某个框架，框架下开发，每个文件都是有规律的
    - 通过脚手架创建的项目内部都集成了HME方案
所以，我们需要手动处理js模块热更新之后的热替换

在代码中追加module.hot.accept可以手动处理热替换逻辑
```js
module.hot.accept('./edit',()=>{
    console.log('edit 模块更新了,这里手动处理热替换逻辑')
})
```
**HMR注意事项**
1. 处理HMR的代码报错会导致自动刷新（使用hotOnly解决）
2. 没启用HMR的情况下，HMR API报错(使用了hot或hotOnly，但是没有使用HotModuleReplacementPlugin)
3. 代码中多了与业务无关的代码
    - 在生产环境下关闭hot和hotObly的情况下，会生成```if(false){}```这样的空代码，在压缩处理后，就没有了，所以对生产环境没有影响
```js
 devServer: {
    hotOnly: true
}
```
```js
if(module.hot){
    ...
}
```
#### Webpack不同环境下的配置 
生产环境注重运行效率，开发环境注重开发效率
* 模式mode
* 为不同的工作环境创建不同的配置

webpack不同环境下的配置
* 配置文件根据环境不同导出不同配置
* 一个环境对应一个配置文件
##### 根据环境不同导出不同配置
```js
module.exports = (env)=>{
    //通用配置
    const config = {
        ...
    }
    // 生产配置
    if(env === 'production'){
        config.mode = 'production'
        ...
    }
}
```
这种方式只适合小型项目，项目越复杂，配置文件就会越来越复杂
##### 不同环境下多配置文件
通用配置文件
```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: `main.js`,
        path: path.join(__dirname, 'dist')
    },
    mode: 'none',
    devtool: 'source-map',
    module: {
        rules: [{
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: `./index.html`,
            template: './src/index.html',
            title: 'hmr'
        })
    ]
}
```
生产配置文件
```js
const common = require('./webpack.common')
const {
    merge
} = require('webpack-merge')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common,{
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: ['public']
        })
    ]
})
```
#### DefinePlugin
[DefinePlugin](https://www.webpackjs.com/plugins/define-plugin/)
    - 为代码注入全局成员 (production模式下默认会启动，会注入process.env.NODE_ENV这个常量)  
  
webpack使用DefinePlugin
```js
  plugins: [
        new webpack.DefinePlugin({
            API_BASE_URL: JSON.stringify('https://api.axample.com')
        })
    ]
```
代码中引用常量
```js
console.log(API_BASE_URL)
```
webpack编译处理后
```js
console.log("https://api.axample.com")
```
#### Tree Shaking
用于描述移除 JavaScript 上下文中的未引用代码(dead-code)  

Tree Shaking并不是某个配置选项，一组功能搭配使用后的效果，production模式下自动开启

```js
module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
    },
    optimization: {
        usedExports: true,//告知 webpack 去决定每个模块使用的导出内容，未使用的导出内容不会被生成  production 模式下，这里默认是 true
        minimize: true//压缩代码，去除没有用到的代码  production 模式下，这里默认是 true  
    }
}
```
#### Webpack合并模块
[concatenateModules](https://webpack.docschina.org/configuration/optimization/#optimizationconcatenatemodules) 告知 webpack 去寻找模块图形中的片段，哪些是可以安全地被合并到单一模块中
    - 在 生产 模式 下被启用，而在其它情况下被禁用
```js
module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
    },
    optimization: {
        usedExports: true,
        // minimize: true,
        concatenateModules:true
    }
}
```
concatenateModules的作用就是尽可能的将所有的模块合并输出到一个函数中，这样既提升了运行效率，又减少了代码的体积。又被称为Scope Hoisting

#### Tree Shaking与babel
babel-loader默认会关闭ES Module转换
```js
module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
    },
    module: {
        rules: [{
            test: /.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            modules: 'commonjs'
                        }]
                    ]
                }
            }
        }]
    },
    optimization: {
        usedExports: true,
        // minimize: true,
        // concatenateModules:true
    }
}
```
#### sideEffects
副作用：模块执行时除了导出成员之外所做的事情  

sideEffects一般用于npm包标记是否有副作用

```js
module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
    },
    module: {
        rules: [{
            test: /.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env']
                    ]
                }
            }
        }]
    },
    optimization: {
        sideEffects:true//开启功能
    }
}
```
在package.json文件中加上
```
"sideEffects": false
```
package.json中的sideEffects是标识代码没有副作用，而在webpack配置文件中是标识是否开启该功能  

**注意**
确保代码没有副作用，否则可能会删掉有副作用的代码。
```js
import './date'
const date = new Date()
console.log(date.format())
```
date.js
```js
Date.prototype.format = function () {
    let year = this.getFullYear()
    let month = this.getMonth + 1
    let day = this.getDate()
    return `${year}${month}-${day}`
}
```
上面开启sideEffects，代码打包后date.js的内容就会被忽略掉  

可以通过关闭sideEffects或在package.json文件中声明要忽略的文件
```
 "sideEffects":[
    "./src/date.js"
  ]
```
导入css也是有副作用的代码
#### Webpack代码分割
上面我们所有代码都会打包到一起，这样可能会导致打包输出的文件体积非常大。通常情况下，应用在开始工作时，并不是每个模块在启动时都是必要的，这就导致所有模块都加载完成才能使用。  

所以更合理的办法是分包，按需加载  

webpack分包
* 多入口打包
* 动态导入

##### 多入口打包
多入口打包我们需要给每个页面添加
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')

module.exports = {
    entry: {
        index: './src/index/index.js',
        about: './src/about/index.js'
    },
    output: {
        filename: '[name].bundle.js'
    },
    mode: 'none',
    module: {
        rules: [{
            test: /.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index/index.html',
            filename: 'index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './src/about/about.html',
            filename: 'about.html',
            chunks: ['about']
        })
    ]
}
```
提取公共模块(提取多个页面公用的css和js)
```js
...
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
...
```
#### 按需加载
需要用到某个模块时，再加载这个模块。webpack中支持动态导入，动态导入的模块会被自动分包
```js
import About from './about'
import Home from './index/index'
const render = () => {
    const hash = window.location.hash || '#home'
    if (hash === '#about') {
        document.body.append(About())
    } else {

        document.body.append(Home())
    }
}
render()
window.addEventListener('hashchange', render)
```
上面代码中会将index和about两个页面的代码打包到一个文件中，不管打开那个页面都会加载所有的代码。  

我们可以使用动态导入的方式加载当前页面所需要的js模块
```js
const render = () => {
    const hash = window.location.hash || '#home'

    if (hash === '#about') {
        import('./about').then(({
            default: About
        }) => {
            document.body.append(About())
        })
    } else {
        import('./index/index').then(({
            default: Home
        }) => {
            document.body.append(Home())
        })
    }
}
render()
window.addEventListener('hashchange', render)
```
#### webpack魔法注释

```js
 import( /* webpackChunkName: "about" */ './about').then(({
    default: About
  }) => {
    document.body.append(About())
 })
```
在注释中使用了 webpackChunkName。这样做会导致我们的 bundle 被命名为 lodash.bundle.js 

#### 提取css
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
...
 module: {
        rules: [{
            test: /.css$/,
            use: [
                // 'style-loader', 
                MiniCssExtractPlugin.loader,
                'css-loader'
            ]
        }]
    },
...
plugins:[
    ...
    new MiniCssExtractPlugin()
    ...
]
```
#### 压缩css文件
默认情况下，webpack在生产环境下，只会压缩js文件，并不会压缩css文件  

使用optimize-css-assets-webpack-plugin压缩css文件
```js
 const HtmlWebpackPlugin = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[contenthash:8].bundle.js'
    },
    mode: 'production',
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    //配置minimizer的情况下会覆盖webpack默认在生产情况的压缩js文件功能，所以还需要手动配置压缩插件
    optimization: {
        minimizer: [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    },
    module: {
        rules: [{
            test: /.css$/,
            use: [
                // 'style-loader', 
                MiniCssExtractPlugin.loader,
                'css-loader'
            ]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:8].css'
        }),
    ]
}
```
#### Webpack输出文件名 Hash
* hash  
  - hash是跟整个项目的构建相关，只要项目里有文件更改，整个项目构建的hash值都会更改，并且全部文件都共用相同的hash值
* chunkhash 
  - 同一个模块，就算将js和css分离，其哈希值也是相同的，修改一处，js和css哈希值都会变
* contenthash
  - 只有文件内容不一样，产生的哈希值才会不一样,
所以缓存最好的就是contenthash