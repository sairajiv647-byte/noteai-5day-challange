---
description: 如何将应用部署到 Vercel
---

# 部署到 Vercel 指南

将你的 Next.js 应用部署到 Vercel 非常简单。请按照以下步骤操作：

## 1. 准备工作

确保你的代码已经提交到了 Git 仓库（如 GitHub）。

> [!IMPORTANT]
> 检查 `.gitignore` 文件中是否包含 `.env.local`。我们不应该将敏感的 API 密钥提交到公共仓库。

## 2. 在 Vercel 上创建项目

1. 登录 [Vercel 官网](https://vercel.com/)。
2. 点击 **"Add New..."** -> **"Project"**。
3. 选择你的 GitHub 仓库并点击 **"Import"**。

## 3. 配置环境变量 (关键步骤)

在部署配置页面的 **"Environment Variables"** 部分，添加以下变量：

| Key | Value (从 .env.local 复制) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase 匿名 Key |
| `GOOGLE_GEMINI_API_KEY` | 你的 Gemini API 密钥 |

> [!TIP]
> 确保 `GOOGLE_GEMINI_API_KEY` 使用的是我们纠正后的版本（带字母 `O` 而非数字 `0`）。

## 4. 部署

点击 **"Deploy"** 按钮。Vercel 会自动构建并部署你的应用。

## 5. 后续更新

以后当你向 GitHub 提交代码（`git push`）时，Vercel 会自动检测到更改并重新部署，非常方便。

---

如果部署过程中遇到构建错误（Build Error），通常是因为环境变量没配置对或者某些代码在服务端运行时报错。请随时把错误信息发给我。
