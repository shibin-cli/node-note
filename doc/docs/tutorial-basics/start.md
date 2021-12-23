---
sidebar_position: 1
---
# 开始
首先下载安装NodeJs
## 下载安装NodeJS

下载nodejs https://nodejs.org ，安装即可

* node --version检查node版本
* 通过npm install 模块名1 模块名2...或npm i 模块名1 模块名2...进行安装相应的包

如果想让npm安装速度快点，通过config命令安装，修改地址为淘宝镜像的地址
``` bash
npm config set registry https://registry.npm.taobao.org
```
查看npm镜像地址
``` bash
npm config get registry
```
## 使用nvm包管理nodejs版本
安装之前可以先卸载掉之前安装的NodeJs.
### 下载
安装nvm。[点击到nvm下载地址](https://github.com/coreybutler/nvm-windows/releases)

### 使用方法
下载安装完成后，安装指定版本的node
``` bash
nvm install <version> 
```

切换指定的node版本
``` bash
nvm use <version> 
```

查看当前已安装的node版本
``` bash
nvm ls
```

删除指定的node版本
``` bash
nvm uninstall <version>
```
修改nvm镜像
``` bash
# node镜像地址
nvm node_mirror https://npm.taobao.org/mirrors/node/ 
# npm镜像地址
nvm npm_mirror https://npm.taobao.org/mirrors/npm/
```
## 修改npm全局安装路径和缓存路径
* `npm config set prefix` 全局安装路径
* `npm config set cache` 全局缓存路径
``` bash
npm config set prefix "D:\Software\nodejs\node_global"
npm config set cache "D:\Software\nodejs\node_cache"
```

**注意**，如果windows电脑安装后，发现命令无法使用，需要配置环境变量