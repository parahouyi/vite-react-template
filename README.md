# Simon's Blog

一个用 **Vue 3 + Hono + Cloudflare Workers** 搭建的全栈个人博客。
所有数据存储在 **D1**，图片可以放 **R2**，整套架构跑在全球边缘网络上。

## ✨ 特性

- ⚡️ **边缘渲染** — Cloudflare Workers 全球部署，毫秒级响应
- 🎨 **现代简约风** — 亮/暗主题、毛玻璃顶栏、流畅动画
- 📝 **Markdown 编辑器** — 后台实时预览 + 代码高亮
- 💬 **嵌套评论** — 蜜罐防刷、无需登录即可评论
- 🔐 **JWT 鉴权** — bcrypt 密码哈希、HttpOnly cookie 思路
- 📡 **RSS / Sitemap** — `/api/feed.xml`、`/sitemap.xml` 自动生成
- 🏷️ **分类 / 标签** — 多维内容组织
- 📱 **响应式** — 桌面 / 平板 / 手机自适应
- 🔍 **SEO 友好** — 完整的 Open Graph + Twitter Card meta

## 🧱 技术栈

| 类别 | 技术 |
|---|---|
| 前端 | Vue 3.5 + TypeScript + Vite 7 |
| 路由 | vue-router 4 |
| 状态 | Pinia 3 |
| Markdown | marked + DOMPurify + highlight.js |
| 后端 | Hono 4（运行在 Workers） |
| 数据库 | Cloudflare D1（SQLite） |
| 鉴权 | JWT (jose) + bcryptjs |
| 部署 | Wrangler 4 |

## 🚀 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化本地数据库

```bash
npx wrangler d1 execute simon-blog-db --local --file=./migrations/0001_init_schema.sql
npx wrangler d1 execute simon-blog-db --local --file=./migrations/0002_seed_data.sql
npx wrangler d1 execute simon-blog-db --local --file=./migrations/0003_seed_comments.sql
npx wrangler d1 execute simon-blog-db --local --file=./migrations/0004_seed_admin.sql
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:5173

默认管理员账户：

```
用户名: admin
密码:   admin123
```

> ⚠️ **生产部署前务必修改密码**（后台暂时未提供改密 UI，可在 D1 控制台手动更新 bcrypt 哈希）

### 4. 其他脚本

```bash
npm run lint       # ESLint
npm run build      # 类型检查 + 生产构建
npm run preview    # 本地预览生产构建
```

## 🌐 部署到 Cloudflare

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

### 2. 创建远程 D1 数据库

```bash
npx wrangler d1 create simon-blog-db
```

复制返回的 `database_id`，替换 `wrangler.json` 里的占位符：

```jsonc
"d1_databases": [{
  "binding": "simon_blog_db",
  "database_name": "simon-blog-db",
  "database_id": "你的真实 ID",   // ← 改这里
  "migrations_dir": "./migrations"
}]
```

### 3. 在远程 D1 执行迁移

```bash
npx wrangler d1 execute simon-blog-db --remote --file=./migrations/0001_init_schema.sql
npx wrangler d1 execute simon-blog-db --remote --file=./migrations/0002_seed_data.sql
npx wrangler d1 execute simon-blog-db --remote --file=./migrations/0003_seed_comments.sql
npx wrangler d1 execute simon-blog-db --remote --file=./migrations/0004_seed_admin.sql
```

### 4. （可选）创建 R2 存储桶

如果想用 R2 存图片：

```bash
npx wrangler r2 bucket create simon-blog-images
```

然后在 `wrangler.json` 里更新 R2 桶名。

### 5. 设置 JWT 密钥

```bash
npx wrangler secret put JWT_SECRET
# 输入一个强随机字符串，例如：openssl rand -hex 32 的输出
```

> 这会覆盖 `wrangler.json` 里的 `vars.JWT_SECRET`。**生产环境必须设置**，不能用默认的开发密钥。

### 6. 部署

```bash
npm run deploy
```

部署成功后 Wrangler 会输出类似：

```
Published simon-blog (x.xx sec)
  https://simon-blog.你的子域名.workers.dev
```

### 7. 绑定自定义域名（可选）

在 Cloudflare 控制台 → Workers → 你的 Worker → Settings → Triggers → Add Custom Domain。

## 📁 项目结构

```
.
├── migrations/                   # D1 数据库迁移（按文件名顺序执行）
│   ├── 0001_init_schema.sql      # 4 张表 + 索引
│   ├── 0002_seed_data.sql        # 3 分类 + 4 示例文章
│   ├── 0003_seed_comments.sql    # 6 示例评论（含嵌套）
│   └── 0004_seed_admin.sql       # 默认管理员
├── public/
│   └── favicon.svg
├── src/
│   ├── vue-app/                  # 前端 SPA
│   │   ├── main.ts               # 入口（挂载 Vue + Pinia + Router）
│   │   ├── App.vue               # 根布局
│   │   ├── router.ts             # 路由 + 鉴权守卫
│   │   ├── api/                  # 后端 API 客户端
│   │   ├── stores/               # Pinia 状态（auth, ui）
│   │   ├── composables/          # useMeta 等
│   │   ├── utils/                # markdown / reading-time
│   │   ├── components/           # ArticleCard / CommentList / ...
│   │   └── views/                # 页面（Home / Article / admin/*）
│   └── worker/
│       └── index.ts              # Hono 后端（公开 API + admin API + feeds）
├── index.html                    # 静态入口（含初始 meta）
├── wrangler.json                 # Cloudflare 配置（D1 + R2 + JWT_SECRET）
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🔐 安全提醒

1. **修改默认密码**：admin/admin123 仅供本地开发，生产前必须改
2. **设置强 JWT_SECRET**：用 `openssl rand -hex 32` 生成
3. **不要把密钥提交到 git**：`wrangler secret put` 设置的是加密 secret，不会入库
4. **R2 公开访问**：默认 R2 桶是私有的，需要在 Worker 里签名 URL 才能访问（图片上传功能暂未接入 R2，使用外链图片更简单）

## 📊 配额（免费版）

| 资源 | 免费额度 |
|---|---|
| Workers 请求 | 每天 10 万次 |
| D1 读 | 每天 500 万次 |
| D1 写 | 每天 10 万次 |
| D1 存储 | 5 GB |
| R2 存储 | 10 GB / 月 |
| R2 读 | 1000 万次 / 月 |

个人博客绰绰有余。

## 🛠 常用命令速查

```bash
# 本地开发
npm run dev

# 构建 + 检查
npm run check        # 类型检查 + 构建 + dry-run 部署

# 部署
npm run deploy

# 数据库
npx wrangler d1 execute simon-blog-db --local --command="SELECT * FROM articles;"
npx wrangler d1 execute simon-blog-db --remote --file=./migrations/0001_init_schema.sql

# 实时查看 Worker 日志（生产）
npx wrangler tail

# 类型生成（更新 worker-configuration.d.ts）
npm run cf-typegen
```

## 📝 许可

MIT