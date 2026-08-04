-- 0002_seed_data.sql
-- 初始示例数据（仅用于开发查看效果）

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('技术', 'tech', '技术文章与教程', 1),
  ('生活', 'life', '生活随笔', 2),
  ('项目', 'projects', '项目分享', 3);

INSERT INTO articles (slug, title, excerpt, content, cover_image, category_id, tags, published, views, created_at) VALUES
  (
    'welcome-to-my-blog',
    '欢迎来到我的个人博客',
    '这是博客的第一篇文章，介绍一下这个网站是如何搭建的。',
    '# 欢迎来到我的博客

这是我用 **Vue 3 + Hono + Cloudflare Workers** 搭建的个人博客，运行在全球边缘网络上。

## 技术栈

- **Vue 3** - 前端框架
- **Hono** - 后端框架
- **Cloudflare D1** - SQLite 数据库
- **Cloudflare R2** - 图片存储
- **TypeScript** - 类型安全

## 后续计划

会持续更新技术笔记与生活随笔，欢迎留言交流！

```javascript
console.log("Hello, world!");
```

> 这是一段引用文本，用来测试样式。
',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    1,
    '["Vue", "Cloudflare", "博客"]',
    1,
    42,
    datetime('now', '-5 days')
  ),
  (
    'cloudflare-d1-intro',
    'Cloudflare D1 入门指南',
    'D1 是 Cloudflare 提供的分布式 SQLite 数据库，非常适合中小型项目。',
    '# D1 入门

D1 是基于 SQLite 的全球分布式数据库，让你的数据就近服务用户。

## 优势

- 免费额度大（每天 500 万次读）
- 全球边缘节点
- SQL 完全兼容
- 自动复制与备份

## 示例查询

```sql
SELECT * FROM articles WHERE published = 1;
```

非常适合个人博客。
',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    1,
    '["Cloudflare", "D1", "数据库"]',
    1,
    28,
    datetime('now', '-3 days')
  ),
  (
    'vue3-composition-api',
    'Vue 3 Composition API 完全指南',
    '深入理解 Vue 3 的 Composition API，写出更优雅的代码。',
    '# Composition API

Composition API 是 Vue 3 的核心特性，让代码组织更灵活。

## 核心 API

- `ref` - 基础响应式
- `reactive` - 对象响应式
- `computed` - 计算属性
- `watch` / `watchEffect` - 监听变化

## 示例

```typescript
import { ref, computed } from ''vue'';

const count = ref(0);
const double = computed(() => count.value * 2);
```

组合式 API 让逻辑复用更简单。
',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    1,
    '["Vue", "前端"]',
    1,
    15,
    datetime('now', '-1 day')
  ),
  (
    'hono-framework-review',
    'Hono 框架使用体验',
    '一个超轻量、跨平台的 Web 框架。',
    '# Hono

Hono 是一个在边缘计算场景下表现优异的 Web 框架。

## 特点

- 极小的体积
- 多运行时（Node、Bun、Workers、Deno）
- 优秀的 TypeScript 支持
- 内置中间件生态

非常推荐用于 Cloudflare Workers 项目。
',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    3,
    '["Hono", "后端"]',
    1,
    8,
    datetime('now', '-12 hours')
  );