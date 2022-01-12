---
sidebar_position: 1
---

# Monorepo

Monorepo 是一种将多个项目代码存储在一个仓库里的软件开发策略，一个项目仓库管理多个模块/包

## yarn workplace

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

private 设置为 true，是为了禁止把当前根目录的内容发布， workspaces 是工作区

给工作区根目录安装开发依赖

```bash
yarn add test -d -w
```

给指定工作区安装依赖

```bash
yarn workspace xxx add a
```

给所有工作区安装依赖

```bash
yarn install
```

## pnpm worksapce

安装[pnpm](https://pnpm.io)

```bash
npm i pnpm -g
```

使用 pnpm 安装依赖

```bash
pnpm install
```

新建 `pnpm-workspace.yaml` 文件

```yaml
packages:
  - 'packages/**'
```

给工作区根目录安装开发依赖

```
pnpm install react react-dom -w
```

给指定工作区安装依赖

```
pnpm i dayjs -r --filter @test/web
```

## Lerna

```bash
npm i lerna -g
lerna init
# 发布
lerna publish
```
