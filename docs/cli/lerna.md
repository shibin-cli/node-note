---
sidebar_position: 3
---
# lerna

## 原生脚手架开发的痛点
* 多package，重复操作
  * 依赖安装
  * 单元测试
  * 本地link
  * 代码提交
  * 代码发布
* 版本一致性
  * 发布时代码一致性
  * 发布后相互版本依赖升级
package越多，管理复杂度越高
## lerna的介绍和使用
[Lerna](https://github.com/lerna/lerna)是一款基于git + npm 的多 package 项目的管理工具
* 大幅度减少重复操作
* 提升操作的标准化

lerna的常用操作
```bash
# 创建package
lerna create core
# 安装依赖到所有package
lerna add @dev-cli/utils
# 删除所有package依赖
lerna clean
# 安装依赖到指定package
lerna add @dev-cli/utils packages/core
# 重装所有依赖
lerna bootstrap
# 链接依赖
lerna link
# 执行所有package的shell命令 
lerna exec -- <command> [..args]
# 执行所有package的命令
lerna run <command>
```
[lerna](https://github.com/lerna/lerna)的文档地址 https://github.com/lerna/lerna
## lerna源码分析
### 准备
* 首先把源码下载到本地
* 安装依赖，这里使用 pnpm
  * lerna 使用了workspace，所以需要配置`pnpm-workspace`
  * 安装依赖,执行 `pnpm install`
* 找到入口文件，lerna的入口文件在`core/lerna/cli.js`

`pnpm-workspace.yml` 文件配置
```yml
packages:
  - 'commands/*'
  - 'core/*'
  - 'utils/*'
```
## lerna初始化过程
`core/lerna/cli.js`文件中引入了`core/lerna/index.js`
```js
#!/usr/bin/env node

"use strict";

/* eslint-disable import/no-dynamic-require, global-require */
const importLocal = require("import-local");

if (importLocal(__filename)) {
  require("npmlog").info("cli", "using local version of lerna");
} else {
  require(".")(process.argv.slice(2));
}
```
`core/lerna/index.js`
```js
"use strict";

const cli = require("@lerna/cli");

const addCmd = require("@lerna/add/command");
const bootstrapCmd = require("@lerna/bootstrap/command");
const changedCmd = require("@lerna/changed/command");
const cleanCmd = require("@lerna/clean/command");
const createCmd = require("@lerna/create/command");
const diffCmd = require("@lerna/diff/command");
const execCmd = require("@lerna/exec/command");
const importCmd = require("@lerna/import/command");
const infoCmd = require("@lerna/info/command");
const initCmd = require("@lerna/init/command");
const linkCmd = require("@lerna/link/command");
const listCmd = require("@lerna/list/command");
const publishCmd = require("@lerna/publish/command");
const runCmd = require("@lerna/run/command");
const versionCmd = require("@lerna/version/command");

const pkg = require("./package.json");

module.exports = main;

function main(argv) {
  const context = {
    lernaVersion: pkg.version,
  };

  return cli()
    .command(addCmd)
    .command(bootstrapCmd)
    .command(changedCmd)
    .command(cleanCmd)
    .command(createCmd)
    .command(diffCmd)
    .command(execCmd)
    .command(importCmd)
    .command(infoCmd)
    .command(initCmd)
    .command(linkCmd)
    .command(listCmd)
    .command(publishCmd)
    .command(runCmd)
    .command(versionCmd)
    .parse(argv, context);
}
```
通过调试执行，最终会进入上面的`main`函数中

点击cli跳转到'core/cli.js'文件中
```js
function lernaCLI(argv, cwd) {
  const cli = yargs(argv, cwd);

  return globalOptions(cli)
    .usage("Usage: $0 <command> [options]")
    .demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
    .recommendCommands()
    .strict()
    .fail((msg, err) => {
      // certain yargs validations throw strings :P
      const actual = err || new Error(msg);

      // ValidationErrors are already logged, as are package errors
      if (actual.name !== "ValidationError" && !actual.pkg) {
        // the recommendCommands() message is too terse
        if (/Did you mean/.test(actual.message)) {
          log.error("lerna", `Unknown command "${cli.parsed.argv._[0]}"`);
        }

        log.error("lerna", actual.message);
      }

      // exit non-zero so the CLI can be usefully chained
      cli.exit(actual.exitCode > 0 ? actual.exitCode : 1, actual);
    })
    .alias("h", "help")
    .alias("v", "version")
    .wrap(cli.terminalWidth()).epilogue(dedent`
      When a command fails, all logs are written to lerna-debug.log in the current working directory.

      For more information, find our manual at https://github.com/lerna/lerna
    `);
}
```
我们看到使用了 [yargs](https://github.com/yargs/yargs)
### lerna解决依赖问题
在`core/lerna/package.json`，我们可以看到lerna的本地依赖是这样写的
```json
{
...
  "dependencies": {
    "@lerna/add": "file:../../commands/add",
    "@lerna/bootstrap": "file:../../commands/bootstrap",
    "@lerna/changed": "file:../../commands/changed",
    "@lerna/clean": "file:../../commands/clean",
    "@lerna/cli": "file:../cli",
    "@lerna/create": "file:../../commands/create",
    "@lerna/diff": "file:../../commands/diff",
    "@lerna/exec": "file:../../commands/exec",
    "@lerna/import": "file:../../commands/import",
    "@lerna/info": "file:../../commands/info",
    "@lerna/init": "file:../../commands/init",
    "@lerna/link": "file:../../commands/link",
    "@lerna/list": "file:../../commands/list",
    "@lerna/publish": "file:../../commands/publish",
    "@lerna/run": "file:../../commands/run",
    "@lerna/version": "file:../../commands/version",
    "import-local": "^3.0.2",
    "npmlog": "^4.1.2"
  }
}
```
这样写的好处是不用到处执行 `npm link` 了，也节省了空间

在发布时，lerna就会把本地链接解析成线上的链接，这样就解决了线上使用问题
```js
  resolveLocalDependencyLinks() {
    // resolve relative file: links to their actual version range
    const updatesWithLocalLinks = this.updates.filter((node) =>
      Array.from(node.localDependencies.values()).some((resolved) => resolved.type === "directory")
    );

    return pMap(updatesWithLocalLinks, (node) => {
      for (const [depName, resolved] of node.localDependencies) {
        // regardless of where the version comes from, we can't publish "file:../sibling-pkg" specs
        const depVersion = this.updatesVersions.get(depName) || this.packageGraph.get(depName).pkg.version;

        // it no longer matters if we mutate the shared Package instance
        node.pkg.updateLocalDependency(resolved, depVersion, this.savePrefix);
      }

      // writing changes to disk handled in serializeChanges()
    });
  }
```
### yargs的使用
在看lerna源码时，我们看到使用了yargs,所以需要先了解下yargs的使用

lerna中使用了 [yargs](https://github.com/yargs/yargs)

首先创建一个脚手架项目，在package文件中配置脚手架的命令和入口文件
```json
{
  "bin": {
    "dev": "index.js"
  }
}
```
在入口文件，先写下下面代码
```js
#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = hideBin(process.argv)

yargs(argv)
.argv
```
在控制台输入
```bash
dev --help
```
可以看到控制台会输出
```bash
选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]
```
我们还可以输入
```bash
dev --version 
```
我们可以看到yargs会帮我们默认生成两个命令
```js
yargs(argv)
.usage("Usage: <command> [options]")
.argv
```
执行--help后
```diff
+Usage: <command> [options]

选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]
```
```js
yargs.demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
```
输入dev，控制台就会输出下面内容。当我们输入没有注册的命令时就会有下面提示
```
Usage: <command> [options]

选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]

A command is required. Pass --help to see all available commands and options.
```
alias用来设置别名，例如可以将`dev -v`,就相当于输入了'dev --version'
```js
yargs
.alias('h', 'help')
.alias('v', 'version')
```
wrap可以设置控制台的快读
```js
const cli = yargs(argv)

//wrap设置为 cli.terminalWidth()，可以使控制台输出的信息充满控制台
cli
.usage("Usage: <command> [options]")
.demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
.alias('h', 'help')
.alias('v', 'version')
.wrap(cli.terminalWidth())
.argv
```
epilogue用来在控制台末尾输出信息
```js
const dedent = require('dedent')

cli
.usage("Usage: <command> [options]")
.demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
.alias('h', 'help')
.alias('v', 'version')
.wrap(cli.terminalWidth())
.epilogue(dedent`aaa
  aaa
`)
.argv
// 不使用dedent输出
// aaa
//   aaa
// 使用dedent输出
// aaa
// aaa
```
这里使用dedent是为了去除换行前的控制

options用来定义选项
```js
yargs.options({
    debug:{
        type: 'boolean',
        describe: 'Boostrap debug mode',
        alias: 'd'
    }
})
```
执行 `dev -h` 控制台会输出
```bash
选项：
  -d, --debug    Boostrap debug mode                                                                                                     [布尔]
  -h, --help     显示帮助信息                                                                                                            [布尔]
  -v, --version  显示版本号                                                                                                              [布尔]

```

也可以使用option来替代
```js
yargs
.option('debug', {
    type: 'boolean',
    describe: 'Boostrap debug mode',
    alias: 'd'
})
```
group用来把option进行分组
```js
yargs
.group(['d'], 'dev')
```
```
dev
  -d, --debug  Boostrap debug mode                                                                                                       [布尔]

选项：
  -h, --help     显示帮助信息                                                                                                            [布尔]
  -v, --version  显示版本号   
```
command用来注册命令
```js
yargs
  .command('init [name]', 'Do init a project', yargs => {
    // init命令的选项 builder
        yargs.option('name', {
            type: 'string',
            describe: 'Name of project',
            alias: 'n'
        })
    }, argv => {
      // 用来处理该命令的操作 handler
        console.log(argv)
    })
```
command的第二种写法
```js
  .command({
        command: 'list',
        aliases: ['ls', 'la', 'll'],
        describe: 'List local package',
        builder: yargs => {

        },
        handler: argv => {
            console.log(argv)
        }
    })
```
recommendCommands，当我们输错命令时，添加recommendCommands就会帮我们查找最接近输入命令的命令提示给我们
```js
yargs.recommendCommands()
```
例如当我们输入一个不存在的命令dev ini 
```js
   
Usage: <command> [options]

命令：
  index.js init [name]  Do init a project
  index.js list         List local package                                                                                [aliases: ls, la, ll]

dev
  -d, --debug  Boostrap debug mode                                                                                                       [布尔]

选项：
  -h, --help     显示帮助信息                                                                                                            [布尔]
  -v, --version  显示版本号                                                                                                              [布尔]

aaa
aaa

是指 init?
```
fail用来处理失败信息
```js
    yargs.fail(err => {
        console.log(err)
    })
```
```bash
# 输入
 dev ini
#  输出
是指 init?
```
parse用来把参数进行解析合并,
```js
const context = {
    devVersion: '1.0.0'
}
yargs
// 会把process.argv和context进行合并
  .parse(process.argv.slice(2), context)
```
例如当我们输入`dev ls`，解析后的argv
```
{
  _: [ 'ls' ],
  devVersion: '1.0.0',
  '$0': 'D:\\tools\\nodejs\\node_modules\\@dev-cli\\core\\lib\\index.js'
}
```
## import-local
在lerna的入口文件引入了`import-local`这个库
```js
const importLocal = require("import-local");

if (importLocal(__filename)) {
  require("npmlog").info("cli", "using local version of lerna");
} else {
  require(".")(process.argv.slice(2));
}
```
首先使用了 [pkg-dir](https://github.com/sindresorhus/pkg-dir) 这个库，找到当前包的根目录
```js
const path = require('path');
const {fileURLToPath} = require('url');
const resolveCwd = require('resolve-cwd');
const pkgDir = require('pkg-dir');

// filename 就是当前文件的路径
module.exports = filename => {
	const normalizedFilename = filename.startsWith('file://') ? fileURLToPath(filename) : filename;
  // 找到包含package.json文件的目录，也就是项目的根目录
	const globalDir = pkgDir.sync(path.dirname(normalizedFilename));
	const relativePath = path.relative(globalDir, normalizedFilename);
	const pkg = require(path.join(globalDir, 'package.json'));
	const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));
	const localNodeModules = path.join(process.cwd(), 'node_modules');

	const filenameInLocalNodeModules = !path.relative(localNodeModules, normalizedFilename).startsWith('..') &&
		// On Windows, if `localNodeModules` and 	`normalizedFilename` are on different partitions, `path.relative()` returns the value of `normalizedFilename`, resulting in `filenameInLocalNodeModules` incorrectly becoming `true`.
		path.parse(localNodeModules).root === path.parse(normalizedFilename).root;

	// Use `path.relative()` to detect local package installation,
	// because __filename's case is   on Windows
	// Can use `===` when targeting Node.js 8
	// See https://github.com/nodejs/node/issues/6624
	return !filenameInLocalNodeModules && localFile && path.relative(localFile, normalizedFilename) !== '' && require(localFile);
};
```

### pkg-dir
[pkg-dir](https://github.com/sindresorhus/pkg-dir) 这个库的源码很简单，就下面几行代码。

它的作用就是找到当前文件包含 `package.json` 文件的目录，也就是项目的根目录, 他直接调用了[find-up](https://github.com/sindresorhus/find-up) `findUp.sync` 方法，findup的作用就是遍历父目录去查找对用文件的路径
```js
'use strict';
const path = require('path');
const findUp = require('find-up');

const pkgDir = async cwd => {
	const filePath = await findUp('package.json', {cwd});
	return filePath && path.dirname(filePath);
};

module.exports = pkgDir;
// TODO: Remove this for the next major release
module.exports.default = pkgDir;

module.exports.sync = cwd => {

	const filePath = findUp.sync('package.json', {cwd});
	return filePath && path.dirname(filePath);
};

```

find-up的使用
```js
const path = require('path');
const findUp = require('find-up');
// 会从当前父级目录开始一级一级往上查找package.json文件，知道找到为止
const filePath = findUp.sync('package.json', {
    cwd: process.cwd()
});
	// return filePath && path.dirname(filePath);
console.log(filePath)

```

```js
module.exports.sync = (name, options = {}) => {
	let directory = path.resolve(options.cwd || '');
	const {root} = path.parse(directory);
	const paths = [].concat(name);

	const runMatcher = locateOptions => {
		if (typeof name !== 'function') {
			return locatePath.sync(paths, locateOptions);
		}

		const foundPath = name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath.sync([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const foundPath = runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}
    // 找到就返回文件的绝对路径
		if (foundPath) {
			return path.resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}
    // 往父级查找
		directory = path.dirname(directory);
	}
};
```
```js
'use strict';
const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const pLocate = require('p-locate');

const fsStat = promisify(fs.stat);
const fsLStat = promisify(fs.lstat);

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile'
};

function checkType({type}) {
	if (type in typeMappings) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}
// 这里typeMappings[type]就是isFile，调用isFile方法判断是否是文件
const matchType = (type, stat) => type === undefined || stat[typeMappings[type]]();

module.exports.sync = (paths, options) => {
	options = {
		cwd: process.cwd(),
		allowSymlinks: true,
		type: 'file',
		...options
	};
	checkType(options);
	const statFn = options.allowSymlinks ? fs.statSync : fs.lstatSync;

	for (const path_ of paths) {
		try {
			const stat = statFn(path.resolve(options.cwd, path_));
			// 调用isFile是否是文件 ，是否建就发那会path_
			if (matchType(options.type, stat)) {
				return path_;
			}
		} catch (_) {
		}
	}
};

```
### resolve-from
```js
const resolveCwd = require('resolve-cwd');
...
const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));
```
resolve-cwd 的源码很简单，就调用了[resolve-from]()的方法
```js

const resolveFrom = require('resolve-from');

module.exports = moduleId => resolveFrom(process.cwd(), moduleId);
module.exports.silent = moduleId => resolveFrom.silent(process.cwd(), moduleId);

```
下面是 `resolve-from `的源码中，调用了 `Module._nodeModulePaths` 和 `Module._resolveFilename` 。需要先搞懂 `Module._nodeModulePaths` 和 `Module._resolveFilename` 的用法
```js
'use strict';
const path = require('path');
const Module = require('module');
const fs = require('fs');

const resolveFrom = (fromDirectory, moduleId, silent) => {
	try {
		fromDirectory = fs.realpathSync(fromDirectory);
	} catch (error) {
		if (error.code === 'ENOENT') {
			fromDirectory = path.resolve(fromDirectory);
		} else if (silent) {
			return;
		} else {
			throw error;
		}
	}

	const fromFile = path.join(fromDirectory, 'noop.js');

	const resolveFileName = () => Module._resolveFilename(moduleId, {
		id: fromFile,
		filename: fromFile,
		paths: Module._nodeModulePaths(fromDirectory)
	});

	if (silent) {
		try {
			return resolveFileName();
		} catch (error) {
			return;
		}
	}

	return resolveFileName();
};

```
#### Module._nodeModulePaths
`Module._resolveFilename` 方法是为了解析文件的真实路径

这里参照阮一峰的 [require() 源码解读](http://www.ruanyifeng.com/blog/2015/05/require.html)

`Module._nodeModulePaths` 方法的实现
```js
Module._nodeModulePaths = function(from) {
  // 生成绝对路径
    from = path.resolve(from)
    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\//;
    var paths = [];
    var parts = from.split(splitRe);
    for (var tip = parts.length - 1; tip >= 0; tip--) {
      //如果文件名为 node_modules ， 就跳过
      if (parts[tip] === 'node_modules') continue;
      var dir = parts.slice(0, tip + 1).concat('node_modules').join(path.sep);
      paths.push(dir);
    }
    return paths;
  };
```
在 win 下输入'a/b/c/d',就会输出
```
[
  '磁盘名称:\\a\\b\\c\\node_modules',
  '磁盘名称:\\a\\b\\node_modules',
  '磁盘名称:\\a\\node_modules',
  '磁盘名称:\\node_modules'
]
```

#### Module._resolveFilename
下面阮一峰的 [require() 源码解读](http://www.ruanyifeng.com/blog/2015/05/require.html) 中 `Module.resolveFilename` 的解析

在 `Module.resolveFilename` 方法内部，又调用了两个方法 `Module.resolveLookupPaths()` 和 `Module._findPath()` ，前者用来列出可能的路径，后者用来确认哪一个路径为真。
```js 
Module._resolveFilename = function(request, parent) {

  // 第一步：如果是内置模块，不含路径返回
  if (NativeModule.exists(request)) {
    return request;
  }

  // 第二步：确定所有可能的路径
  var resolvedModule = Module._resolveLookupPaths(request, parent);
  var id = resolvedModule[0];
  var paths = resolvedModule[1];

  // 第三步：确定哪一个路径为真
  var filename = Module._findPath(request, paths);
  if (!filename) {
    var err = new Error("Cannot find module '" + request + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }
  return filename;
};
```
下面截取了部分 `Module._resolveLookupPaths` 源码
```js
Module._resolveLookupPaths = function(request, parent) {
  // 是否是原生模块
  if (NativeModule.exists(request)) {
    return [request, []];
  }

  var start = request.substring(0, 2);
  // 相对路径
  if (start !== './' && start !== '..') {
    // modulePaths 就是环境变量中的 node_modules
    var paths = modulePaths;
    // 这里的 parent.paths 指定就是所有可能node_modules的目录
    if (parent) {
      if (!parent.paths) parent.paths = [];
      // 跟环境变量中的node_modules的目录合并后返回
      paths = parent.paths.concat(paths);
    }
    return [request, paths];
  }
  ...
};
```
```js
odule._findPath = function(request, paths) {

  // 列出所有可能的后缀名：.js，.json, .node
  var exts = Object.keys(Module._extensions);

  // 如果是绝对路径，就不再搜索
  if (request.charAt(0) === '/') {
    paths = [''];
  }

  // 是否有后缀的目录斜杠
  var trailingSlash = (request.slice(-1) === '/');

  // 第一步：如果当前路径已在缓存中，就直接返回缓存
  var cacheKey = JSON.stringify({request: request, paths: paths});
  if (Module._pathCache[cacheKey]) {
    return Module._pathCache[cacheKey];
  }

  // 第二步：依次遍历所有路径
  for (var i = 0, PL = paths.length; i < PL; i++) {
    var basePath = path.resolve(paths[i], request);
    var filename;

    if (!trailingSlash) {
      // 第三步：是否存在该模块文件
      filename = tryFile(basePath);

      if (!filename && !trailingSlash) {
        // 第四步：该模块文件加上后缀名，是否存在
        filename = tryExtensions(basePath, exts);
      }
    }

    // 第五步：目录中是否存在 package.json 
    if (!filename) {
      filename = tryPackage(basePath, exts);
    }

    if (!filename) {
      // 第六步：是否存在目录名 + index + 后缀名 
      filename = tryExtensions(path.resolve(basePath, 'index'), exts);
    }

    // 第七步：将找到的文件路径存入返回缓存，然后返回
    if (filename) {
      Module._pathCache[cacheKey] = filename;
      return filename;
    }
  }

  // 第八步：没有找到文件，返回false 
  return false;
};
```

```js
function tryFile(requestPath, isMain) {
  const rc = stat(requestPath);
  if (rc !== 0) return;
  if (preserveSymlinks && !isMain) {
    return path.resolve(requestPath);
  }
  return toRealPath(requestPath);
}

function toRealPath(requestPath) {
  return fs.realpathSync(requestPath, {
    [internalFS.realpathCacheKey]: realpathCache
  });
}

// Given a path, check if the file exists with any of the set extensions
function tryExtensions(p, exts, isMain) {
  for (let i = 0; i < exts.length; i++) {
    const filename = tryFile(p + exts[i], isMain);

    if (filename) {
      return filename;
    }
  }
  return false;
}
```
