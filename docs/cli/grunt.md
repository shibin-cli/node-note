---
sidebar_position: 2
---
# 自动化构建
一切重复工作本应自动化
自动化构建工作流
脱离运行环境兼容带来的问题
使用提高效率的语法、规范和标准
自动化构建工具构建转换那些不被支持的特性
## 自动化构建初体验
```
npm install sass --save-dev
```
创建一个scss文件
```scss
$color:red;

body {
    color: $color;
}
```
在package.json添加script
```json
  "scripts": {
    "build-sass": "sass code/scss/style.scss code/css/style.css"
  }
```
执行
```
npm run build-sass
```
安装browser-sync
```
npm install browser-sync --save-dev
```
在当前目录下创建```index.html```
在package.json添加script
```json
  "scripts": {
    "build-sass": "sass code/scss/style.scss code/css/style.css",
    "serve": "browser-sync ."
  }
```
```
npm run serve
```
安装npm-run-all
```
npm install npm-run-all --save-dev
```
执行完build-sass执行完后再执行serve
```json
 "scripts": {
    "build-sass": "sass code/scss/style.scss code/css/style.css --watch",
    "serve": "browser-sync . --files \"./code/css/*.css\"",
    "start":"run-p build-sass serve"
  }
```
其中```--files \"./code/css/*.css\"```是监听css文件变化
## 常用的自动化构建工具
* Grunt
     - 插件生态比较完善
     - 工作过程基于临时文件，所以构建速度相对较慢
* Gulp
    - 文件处理环节都是在内存中实现的
    - 支持同时执行多个任务
* FIS
    - 项目中典型的需求尽可能都集成在内部
## Grunt
```
npm install grunt --save-dev
```
注册任务
```js
/**
 * Grunt的入口文件
 * 用于定义一些需要Grunt自动执行的任务
 * 需要导出一个函数
 * 此函数接收一个Grunt形参，内部提供一些创建任务是可以用到的API
 */
module.exports = grunt => {
    // 注册任务
    grunt.registerTask('foo', () => {
        console.log('hello grunt')
    })
    grunt.registerTask('bar', '任务描述', () => {
        console.log('hello grunt')
    })

    // 注册异步任务
    // grunt默认支持同步模式，若要支持异步模式，
    // 必须使用this.async()得到一个回调函数，异步操作完成后调用诸葛异步函数
    grunt.registerTask('async-task', function () {
        const done = this.async()
        setTimeout(() => {
            console.log('async-task')
            done()
        }, 1000)
    })

    // 默认任务
    // grunt.registerTask('default', () => {
    //     console.log('default')
    // })

    grunt.registerTask('default', ['foo',  'async-task', 'bar'])
}
```
### 标记失败任务
可以在任务函数体返回false
```js
   grunt.registerTask('bad', () => {
        console.log('bad')
        return false
    })
```
多个任务出错后其他任务继续执行
```
npm grunt --force
```
异步任务标记失败
```js
   // 标记异步失败任务
    grunt.registerTask('bad-async-task', function () {
        const done = this.async()
        setTimeout(() => {
            console.log('bad-async-task')
            done(false)
        }, 1000)
    })
```
### Grunt的配置方法
```js
module.exports = grunt => {
    // 配置
    grunt.initConfig({
        foo: {
            name: 'foo'
        }
    })
    grunt.registerTask('foo', () => {
        console.log(grunt.config('foo'))//{ name: 'foo' }
    })
    grunt.registerTask('default', ['foo'])
}
```
### 多目标任务
```js
module.exports = grunt => {
    grunt.initConfig({
        build:{
            // 会作为任务的配置(不会作为task )  
            options:{
                foo:'aaa'
            },
            css:{
                name:'css',
                // 会合并任务配置中的options，如果存在相同属性，会覆盖
                options:{
                    foo:'css'
                }
            },
            js:'js'
        }
    })
    // 多目标模式
    grunt.registerMultiTask('build',function() {
        console.log('build')
        console.log('target:',this.target)
        console.log('data:',this.data)
        console.log('options:',this.options())
    })
}
```
### Grunt插件的使用
```
npm install grunt-contrib-clean --save-dev
```
```js
module.exports = grunt => {
    grunt.initConfig({
        clean: {
            temp: 'code/**/*.css'
        }
    })
    grunt.loadNpmTasks('grunt-contrib-clean')
}
```
```
npm grunt clean
```
### 常用的插件
grunt-sass
```
npm install grunt-sass sass --save-dev
```
```js
const sass = require('sass')

module.exports = grunt => {
    grunt.initConfig({
        sass: {
            options: {
                sourceMap:true,
                implementation: sass
            },
            main: {
                files: {
                    'dist/css/main.css': 'dist/scss/main.scss'
                }
            }
        }
    })
    grunt.loadNpmTasks('grunt-sass')
}
```
编译es6  
安装babel和load-grunt-tasks
```
 npm install grunt-babel @babel/core @babel/preset-env load-grunt-tasks --save-dev
```
```js
const sass = require('sass')
const loadGruntTasks = require('load-grunt-tasks')

module.exports = grunt => {
    grunt.initConfig({
        sass: {
            options: {
                sourceMap: true,
                implementation: sass
            },
            main: {
                files: {
                    'dist/css/main.css': 'src/scss/main.scss'
                }
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env']
            },
            main: {
                files: {
                    'dist/js/app.js': 'src/js/app.js'
                }
            }
        },
        watch: {
            js: {
                files: ['src/**/*.js'],
                tasks: ['babel']
            },
            css: {
                files: ['src/**/*.scss'],
                tasks: ['sass']
            }
        }
    })
    // 自动加载所有的grunt插件中的任务
    loadGruntTasks(grunt)
    grunt.registerTask('default', ['sass', 'babel', 'watch'])
}
```
## gulp
```
npm install gulp --save-dev
```
创建一个gulpfile.js文件
```js
module.exports = {
    foo(done) {
        console.log('qwe')
        done() //标识任务结束
    },
    // 默认任务
    default (done) {
        console.log('default')
        done()
    }
}

// gulp 4.0之前的用法，不推荐使用
const gulp = require('gulp')
gulp.task('bar', done => {
    console.log('bar working')
    done()
})
```
```
npm gulp foo
```
### gulp的组合任务
```js
const {
    series,
    parallel
} = require('gulp')

const task1 = done => {
    setTimeout(() => {
        console.log('task1 done')
        done()
    }, 1000)
}
const task2 = done => {
    setTimeout(() => {
        console.log('task2 done')
        done()
    }, 1000)
}
const task3 = done => {
    setTimeout(() => {
        console.log('task3 done')
        done()
    }, 1000)
}

module.exports = {
    foo: series(task1, task2, task3), //串行多个任务
    bar: parallel(task1, task2, task3) //并多个行任务
}
```
### gulp的组合任务
* 如果需要让任务（task）按顺序执行，请使用 ```series()``` 方法。
* 对于希望以最大并发来运行的任务（tasks），可以使用 ``parallel()`` 方法将它们组合起来。
```js
const {
    series,
    parallel
} = require('gulp')

const task1 = done => {
    setTimeout(() => {
        console.log('task1 done')
        done()
    }, 1000)
}
const task2 = done => {
    setTimeout(() => {
        console.log('task2 done')
        done()
    }, 1000)
}
const task3 = done => {
    setTimeout(() => {
        console.log('task3 done')
        done()
    }, 1000)
}

module.exports = {
    foo: series(task1, task2, task3), //串行多个任务
    bar: parallel(task1, task2, task3) //并多个行任务
}
```
### Gulp的异步任务
https://www.gulpjs.com.cn/docs/getting-started/async-completion/
```js
const fs = require('fs')

module.exports = {
    callback(done) {
        console.log('callback')
        done()
    },
    callback_error(done) {
        console.log('callback_error')
        done(new Error('task error'))
    },
    promise() {
        console.log('promise')
        return Promise.reject('promise error')
    },
    async async () {
        await timeout(2000)
        console.log('async task')
    },
    stream(done) {
        const readStream = fs.createReadStream('./package.json')
        const writeStream = fs.createWriteStream('package.txt')
        readStream.pipe(writeStream)
        // readStream.on('end',()=>{
        //     console.log('end')
        //     done()
        // })
        return readStream
    }
}
const timeout = time => new Promise(resolve => setTimeout(resolve, time))
```
### Gulp构建过程核心工作原理
模拟实现简单的css压缩功能
```js
const {
    createReadStream,
    createWriteStream
} = require('fs')
const {
    Transform
} = require('stream')

module.exports = {
    default () {
        const read = createReadStream('././src/css/style.css')
        const write = createWriteStream('./src/css/style.min.css')
        // 转换
        const transform = new Transform({
            transform(chunk, encoding, callback) {
                // 核心转换过程
                // chunk=> 读取流中读取到的内容（Buffer）
                const input = chunk.toString()
                const output = input.replace(/\s+/g, '').replace(/\/\*.+?\*\//g, '')
                callback(null, output)
            }
        })
        read
            .pipe(transform) //转换
            .pipe(write) //写入
        return read
    }
}
```
### Gulp文件操作API
* ```src()``` 接受 glob 参数，并从文件系统中读取文件然后生成一个 Node 流（stream）。它将所有匹配的文件读取到内存中并通过流（stream）进行处理。
* ```dest()``` 可以用在管道（pipeline）中间用于将文件的中间状态写入文件系统
```js
const {
    src,
    dest
} = require('gulp')
const cleanCss = require('gulp-clean-css')
const rename = require('gulp-rename')

module.exports = {
    default () {
        return src('src/css/*.css')
            .pipe(cleanCss())
            .pipe(rename({
                extname: '.min.css'
            }))
            .pipe(dest('dist/css'))
    }
}
```
### Gulp案例
#### 样式编译
安装[gulp-sass](https://github.com/dlmanning/gulp-sass)
```
npm install gulp-sass --save-dev
```
```js
const {
    src,
    dest
} = require('gulp')
const sass = require('gulp-sass')

const style = () => {
    return src('src/css/*.scss', {
            base: 'src'
        })
        .pipe(sass({
            outputStyle: 'expanded' //完全展开css
        }))
        .pipe(dest('dist'))
}
module.exports = {
    style
}
```
#### 脚本编译
```js
const script = () => {
    return src('src/js/*.js', {
            base: 'src'
        })
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest('dist'))
}
```
#### 模板编译
使用ejs模板引擎编译
```
npm install gulp-ejs --save-dev
```
```js
const {
    src,
    dest
} = require('gulp')
const ejs = require('gulp-ejs')

const page = () => {
    return src('src/*.html', {
            base: 'src'
        })
        .pipe(ejs({
            title: 'gulp页面模板编译'
        }))
        .pipe(dest('dist'))
}
```
#### 图片和字体文件转换
```
npm install imagemin --save-dev
```
```js
const {
    src,
    dest
} = require('gulp')
const imagemin = require('gulp-imagemin')
const assets = () => {
    return src('src/assets/**', {
            base: 'src'
        })
        .pipe(imagemin())
        .pipe(dest('dist'))
}
```
#### 其他文件及文件清除
```
npm install del --save-dev
```
```js
const clean = () => {
    return del(['dist'])
}
```
#### 自动加载插件
```
npm install gulp-load-plugins --save-dev
```
将之前require的gulp插件替换为plugins.**
```js
const {
    src,
    dest,
    parallel,
    series
} = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const del = require('del')

const style = () => {
    return src('src/css/*.scss', {
            base: 'src'
        })
        .pipe(plugins.sass({
            outputStyle: 'expanded' //完全展开css
        }))
        .pipe(dest('dist'))
}

const script = () => {
    return src('src/js/*.js', {
            base: 'src'
        })
        .pipe(plugins.babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest('dist'))
}

const page = () => {
    return src('src/*.html', {
            base: 'src'
        })
        .pipe(plugins.ejs({
            title: 'gulp页面模板编译',
        }, {
            rmWhitespace: false
        }))
        .pipe(dest('dist'))
}
const assets = () => {
    return src('src/assets/**', {
            base: 'src'
        })
        .pipe(imagemin())
        .pipe(dest('dist'))
}
const extra = () => {
    return src('src/public/**/*', {
            base: 'src'
        })
        .pipe(dest('dist'))
}
const clean = () => {
    return del(['dist'])
}

const compile = parallel(style, script, page, assets)
const build = series(clean, parallel(compile, extra))

module.exports = {
    build
}
```
#### 开发服务器
热更新开发服务器
```
npm install borwser-sync --save-dev
```

```js
const borwserSync = require('browser-sync')
const bs = borwserSync.create()

const serve = () => {
    return bs.init({
        notify: false,
        open: false,//是否打开浏览器
        // port  打开端口号
        files:'dist/**',//修改文件后 自动刷新
        server: {
            baseDir: 'dist',
            routes:{
                '/node_modules':'node_modules'
            }
        }
    })
}
```
#### 监视变化及构建优化
[gulp.watch()](https://www.gulpjs.com.cn/docs/api/watch/)  监听 globs 并在发生更改时运行任务。任务与任务系统的其余部分被统一处理。
```js
const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp')
const style = () => {
    return src('src/css/*.scss', {
            base: 'src'
        })
        .pipe(plugins.sass({
            outputStyle: 'expanded' //完全展开css
        }))
        .pipe(dest('dist'))
        // .pipe(bs.reload({stream:true}))  bs.init  files可以不写
}

const serve = () => {
    watch('src/css/*.scss', style)
    watch('src/js/*.js', script)
    watch('src/*.html', page)

    // 减少构建次数
    watch([
        'src/assets/**',
        'src/public/**/*'
    ], bs.reload)

  ...
}

const compile = parallel(style, script, page)//assets, extra开发阶段不编译
const build = series(clean, parallel(compile, assets, extra))
const dev = series(compile, serve)
```
#### useref文件处理引用
```js
const useref = () => {
    return src('dist/*.html', {
            base: 'dist'
        })
        .pipe(plugins.useref({
            searchPath: ['dist', '.']
        }))
        .pipe(dest('dist'))
}
```
[useref](https://github.com/jonkemp/gulp-useref)
```html
<html>
<head>
    <!-- build:css css/combined.css -->
    <link href="css/one.css" rel="stylesheet">
    <link href="css/two.css" rel="stylesheet">
    <!-- endbuild -->
</head>
<body>
    <!-- build:js scripts/combined.js -->
    <script type="text/javascript" src="scripts/one.js"></script>
    <script type="text/javascript" src="scripts/two.js"></script>
    <!-- endbuild -->
</body>
</html>
```
useref处理后
```html
<html>
<head>
    <link rel="stylesheet" href="css/combined.css"/>
</head>
<body>
    <script src="scripts/combined.js"></script>
</body>
</html>
```
#### 文件压缩
```
npm install gulp-if gulp-clean-css gulp-uglify gulp-htmlmin --save-dev
```
```js
const useref = () => {
    return src('dist/*.html', {
            base: 'dist'
        })
        .pipe(plugins.useref({
            searchPath: ['dist', '.']
        }))
        .pipe(plugins.if(/\.js$/,plugins.uglify()))
        .pipe(plugins.if(/\.css$/,plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/,plugins.htmlmin({
            collapseWhitespace:true,
            mimifyJS:true,
            minifyCSS:true
        })))
        .pipe(dest('release'))
}
```
#### 重新规划构建过程
```js
const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const del = require('del')
const borwserSync = require('browser-sync')
const bs = borwserSync.create()

const style = () => {
    return src('src/css/*.scss', {
            base: 'src'
        })
        .pipe(plugins.sass({
            outputStyle: 'expanded' //完全展开css
        }))
        .pipe(dest('temp'))
}

const script = () => {
    return src('src/js/*.js', {
            base: 'src'
        })
        .pipe(plugins.babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest('temp'))
}

const page = () => {
    return src('src/*.html', {
            base: 'src'
        })
        .pipe(plugins.ejs({
            title: 'gulp页面模板编译',
        }, {
            rmWhitespace: false
        }))
        .pipe(dest('temp'))
}
const assets = () => {
    return src('src/assets/**', {
            base: 'src'
        })
        // .pipe(imagemin())
        .pipe(dest('dist'))
}
const extra = () => {
    return src('src/public/**/*', {
            base: 'src'
        })
        .pipe(dest('dist'))
}
const useref = () => {
    return src('temp/*.html', {
            base: 'temp'
        })
        .pipe(plugins.useref({
            searchPath: ['temp', '.']
        }))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            mimifyJS: true,
            minifyCSS: true
        })))
        .pipe(dest('dist'))
}



const clean = () => {
    return del(['dist','temp'])
}
const serve = () => {
    watch('src/css/*.scss', style)
    watch('src/js/*.js', script)
    watch('src/*.html', page)

    watch([
        'src/assets/**',
        'src/public/**/*'
    ], bs.reload)

    bs.init({
        notify: false,
        open: false, //是否打开浏览器
        files: 'dist/**', //修改文件后 自动刷新
        server: {
            baseDir: ['temp', 'src'],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}
const compile = parallel(style, script, page)
const build = series(
    clean,
    parallel(
        (series(compile, useref)),
        assets,
        extra
    ))
const dev = series(compile, serve)
module.exports = {
    clean,
    build,
    dev
}
```
### 封装工作流
#### 提取gulpfile
* 新建一个项目A,执行```npm init```
* 将之前安装的gulp相关依赖安装到项目下
* 设置入口文件，并将之前写的gulpfile.js文件放到入口文件中
* 执行```yarn link```或```npm link```
* 执行```yarn link 项目A名称```或```npm link 项目A名称```
* 修改原来的项目下gulpfile.js文件
```js
module.exports = require('项目A名称')
```
* 执行```yarn gulp build```或```npm gulp build```
#### 解决模块中的问题
提取不应公共使用的部分模块  

可以新建一个js文件，将不在公共模块的内容提取到该文件  

项目配置文件pages.config.js
```js
module.exports = {
    title: 'gulp构建'
}
```

```js
let config = {
  title: ''
}
try {
  loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({}, config, loadConfig)
} catch (e) {

}
```
#### 抽象路径配置



## FIS
安装[fis3](http://fis.baidu.com/fis3/index.html)到项目目录下
```
npm install fis3 --save-dev
```
在项目目录下新建一个fis的配置文件```fis-conf.js```

 FIS3 配置文件（默认fis-conf.js）所在的目录为项目根目录
```fis3 release -d <path>```将资源发布到```<path>```  

```fis.match(selector, props)```   

 * selector： FIS3 把匹配文件路径的路径作为selector，匹配到的文件会分配给它设置的 props
*  props ：编译规则属性，包括文件属性和插件属性

```js
// 处理文件路径
fis.match('*.{js,scss,png}',{
    release:'./$0'
})
// 处理cs
fis.match('**/*.scss', {
    rExt:'.css',
    parser: fis.plugin('node-sass'),//需要安装fis-parser-node-sass
    optimizer:fis.plugin('clean-css')//内置插件
})
// 处理js
fis.match('**/*.js', {
    parser: fis.plugin('babel-6.x'),//需要安装fis-parser-babel-6.x
    optimizer:fis.plugin('uglify-js')//内置插件
})
```

## gulp自动化构建示例代码
```js
const {
  src,
  dest,
  series,
  parallel,
  watch
} = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const del = require('del')
const bs = require('browser-sync').create()

// 是否是生产环境
const isPro = process.argv[process.argv.length - 1] !== 'dev'

console.log(isPro)
const config = {
  input: 'src', //入口文件目录
  output: 'dist', //生成文件目录
  temp:'.temp'//文件临时目录
}


const _src = (path, base) => {
  return src(`${config.input}/${path}`, {
    base: base || config.input
  })
}

// 清除上次生成的文件
const clean = () => {
  return del([config.temp,config.output])
}

// 处理js文件
const script = () => {
  return _src('assets/**/*.js')
    .pipe(plugins.babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(plugins.if(isPro, plugins.uglify()))
    .pipe(dest(config.temp))
}

// 处理scss文件
const style = () => {
  return _src('assets/styles/*.scss')
    .pipe(plugins.sass({
      outputStyle: isPro ? 'compressed' : 'nested'
    }))
    .pipe(dest(config.temp))
}
const menus = [{
    name: 'Home',
    icon: 'aperture',
    link: 'index.html'
  },
  {
    name: 'Features',
    link: 'features.html'
  },
  {
    name: 'About',
    link: 'about.html'
  },
  {
    name: 'Contact',
    link: '#',
    children: [{
        name: 'Twitter',
        link: 'https://twitter.com/w_zce'
      },
      {
        name: 'About',
        link: 'https://weibo.com/zceme'
      },
      {
        name: 'divider'
      },
      {
        name: 'About',
        link: 'https://github.com/zce'
      }
    ]
  }
]
// 处理html
const page = () => {
  return _src('*.html')
    .pipe(plugins.swig({
      data: {
        pkg: require('./package.json'),
        date: new Date(),
        menus: menus
      }
    }))
    // .pipe(
    //   plugins.if(isPro, plugins.htmlmin({
    //     collapseWhitespace: true,
    //     minifyCSS: true,
    //     minifiJS: true
    //   }))
    // )
    .pipe(dest(config.temp))
}

// 处理 图片、字体文件
const imageAndFont = () => {
  return _src('assets/{images,fonts}/*') //处理images、fonts下的所有文件
    .pipe(plugins.imagemin())
    .pipe(dest(config.output))
}
//处理public目录
const public = () => {
  return src('src/public/**', {
      base: config.input
    })
    .pipe(plugins.imagemin())
    .pipe(dest(config.output))
}

// 处理引用文件  如bootstrap
const useref = () => {
  return src(`${config.temp}/*.html`, {
      base: config.temp
    })
    .pipe(plugins.useref({
      searchPath: [config.temp, '.']
    }))
    .pipe(
      plugins.if(/\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifiJS: true
        })
      )
    )
    .pipe(plugins.if(/\.js$/,plugins.uglify()))
    .pipe(dest(config.output))
}

const serve = () => {
  // 监听文件变化并处理
  watch(`${config.input}/assets/styles/*.scss`, style)
  watch(`${config.input}/assets/**/*.js`, script)
  watch(`${config.input}/*.html`, page)

  //开发环境不需要处理图片等文件的压缩，直接刷新
  watch([
    `${config.input}/assets/{images,fonts}/*`,
    `${config.input}/public/**`
  ], bs.reload)

  bs.init({
    open: false, //启动时是否打开浏览器
    notify: false,
    files: `${config.temp}/**`, //监听文件变化
    server: {
      baseDir: [config.temp, 'src', '.'] //文件加载地址（先加载dist目录，如果dist目录不存在该文件，会到src目录文件,src找不到，会到当前目录）
    }
  })
}

const compile = parallel(script, style, page)
const build = series(
  clean,
  parallel(
    series(compile, useref),
    imageAndFont,
    public
  )
)
const dev = series(compile, serve)
module.exports = {
  script,
  style,
  page,
  imageAndFont,
  public,
  useref,
  clean,
  compile,
  build,
  dev
}

```