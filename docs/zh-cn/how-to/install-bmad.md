---
title: "如何安装 BMad"
description: 在项目中安装 BMad 的分步指南
sidebar:
  order: 1
---

使用 `bmad install` 命令在你的机器上全局安装 BMad。

## 何时使用

- 首次安装 BMad
- 更新现有的 BMad 安装

:::note[前置条件]
- **Node.js** 20+（安装程序必需）
- **AI 工具**（Claude Code、Cursor 或类似工具）
:::

## 步骤

### 1. 安装包

```bash
npm install -g bmad-method
```

或直接运行而无需全局安装：

```bash
npx bmad-method install
```

### 2. 运行安装程序

```bash
bmad install
```

安装程序无需任何交互提示，直接将所有 BMad skills 全局安装到 `~/.claude/skills/bmad/`。

强制重新安装（覆盖现有文件）：

```bash
bmad install --force
```

查看安装过程的详细输出：

```bash
bmad install --debug
```

## 你将获得

```text
~/.claude/skills/bmad/
├── bmm/            # BMad Method 模块
│   └── config.yaml # 模块设置
├── core/           # 必需核心模块
├── manifest.yaml   # 安装清单
└── ...

your-project/
└── _bmad-output/       # 生成产物（项目本地）
```

## 验证安装

运行 `bmad-help` 来验证一切正常并查看下一步操作。

**BMad-Help 是你的智能向导**，它会：
- 确认你的安装正常工作
- 根据你安装的模块显示可用内容
- 推荐你的第一步

你也可以向它提问：
```
bmad-help 我刚安装完成，应该先做什么？
bmad-help 对于 SaaS 项目我有哪些选项？
```

## 故障排除

**安装程序抛出错误**——将输出复制粘贴到你的 AI 助手中，让它来解决问题。

**安装程序工作正常但后续出现问题**——你的 AI 需要 BMad 上下文才能提供帮助。请参阅[如何获取关于 BMad 的答案](./get-answers-about-bmad.md)了解如何将你的 AI 指向正确的来源。

