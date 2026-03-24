---
title: "非交互式安装"
description: 使用命令行参数安装 BMad，适用于 CI/CD 流水线和自动化部署
sidebar:
  order: 2
---

使用命令行参数（flags）以非交互方式安装 BMad。适用于以下场景：

## 使用场景

- 自动化部署和 CI/CD 流水线
- 脚本化安装
- 使用已知配置的快速安装

:::note[前置条件]
需要 [Node.js](https://nodejs.org) v20+ 和 `npx`（随 npm 附带）。
:::

## 可用参数（Flags）

| 参数 | 描述 |
|------|-------------|
| `--force` | 覆盖现有安装 |
| `--debug` | 启用安装过程的调试输出 |

## 安装

BMad 全局安装到 `~/.claude/skills/bmad/`，无需任何交互提示：

```bash
bmad install
```

或使用参数：

```bash
bmad install --force --debug
```

如果你没有全局安装该包，使用 npx：

```bash
npx bmad-method install --force
```

## 示例

### CI/CD 流水线安装

```bash
#!/bin/bash
# install-bmad.sh

npm install -g bmad-method
bmad install --force
```

### 更新现有安装

```bash
bmad install --force
```

## 安装结果

- 完全配置的 `~/.claude/skills/bmad/` 目录，包含智能体、工作流和模块
- `~/.claude/skills/bmad/manifest.yaml` 跟踪安装状态
- 项目本地的 `_bmad-output/` 文件夹由工作流运行时自动创建，用于存放生成产物

## 卸载

完全移除 BMad：

```bash
bmad uninstall
```

跳过确认：

```bash
bmad uninstall --force
```

这将完全删除 `~/.claude/skills/bmad/`。

:::tip[最佳实践]
- 使用 `--force` 实现真正的无人值守安装
- 如果在安装过程中遇到问题，使用 `--debug`
:::

## 故障排除

### 安装失败

- 确保你对 `~/.claude/skills/bmad/` 有写入权限
- 使用 `--debug` 获取详细输出

:::note[仍然卡住了？]
使用 `--debug` 获取详细输出，或在 <https://github.com/bmad-code-org/BMAD-METHOD/issues> 提交反馈。
:::
