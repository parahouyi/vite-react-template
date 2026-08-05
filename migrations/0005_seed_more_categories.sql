-- 0005_seed_more_categories.sql
-- 新增 5 个分类 + 每类 1 篇示例文章
-- 用 INSERT OR IGNORE 让迁移可重复执行（不会因重复报错）

-- 分类
INSERT OR IGNORE INTO categories (name, slug, description, sort_order, created_at) VALUES
  ('编程', 'programming', '编程语言、框架、工具与最佳实践', 4, datetime('now')),
  ('AI', 'ai', '人工智能、机器学习、大语言模型', 5, datetime('now')),
  ('中医', 'tcm', '传统中医、养生、经络与中药', 6, datetime('now')),
  ('音乐', 'music', '音乐赏析、乐器学习与创作', 7, datetime('now')),
  ('历史', 'history', '历史事件、人物、文化与考古', 8, datetime('now'));

-- 文章（5 篇示例）
INSERT OR IGNORE INTO articles (slug, title, excerpt, content, cover_image, category_id, tags, published, views, created_at) VALUES
  (
    'hello-programming',
    '为什么我喜欢写代码',
    '聊聊我从入行到现在的感受。',
    '# 写代码这件事

从第一次写出 `Hello World` 到现在，已经过去了很多年。每当有人问我"学编程难不难"，我都会先问他们一个问题：**你想用它做什么？**

> "Programs must be written for people to read, and only incidentally for machines to execute." —— Harold Abelson

## 编程给我的东西

- **解决问题的能力** —— 任何问题都可以拆解成更小的步骤
- **创造的快感** —— 从 0 到 1 构建一个能用的东西
- **持续学习的习惯** —— 技术每天都在变，但学习的元能力不变

## 一个简单的例子

这是我博客文章的 slug 生成函数：

```typescript
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s一-鿿]+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-");
}
```

短短几行，但解决了一个真实的问题：**让文章 URL 干净、可读、SEO 友好**。
',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    4,
    '["编程", "随想"]',
    1,
    12,
    datetime('now', '-2 days')
  ),
  (
    'ai-eras-intro',
    'AI 时代的开始',
    '我们正站在一个新十年的起点。',
    '# AI 时代的开始

2022 年底 ChatGPT 发布以来，AI 从实验室走进了每个人的生活。

## 几个观察

1. 大语言模型的能力每几个月翻一倍
2. 编程、医疗、教育是被改变最快的几个行业
3. 不会用 AI 的人，正在被会用 AI 的人"卷"

## 我的看法

工具永远在变，但**思考能力**和**品味**不会变。

> 好的输入 = 好的输出。在 AI 时代尤其重要。
',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    5,
    '["AI", "随想"]',
    1,
    28,
    datetime('now', '-1 day')
  ),
  (
    'tcm-yangsheng-basics',
    '中医养生入门',
    '聊聊中医里的"治未病"思想。',
    '# 治未病

中医最核心的理念之一是"治未病"——在疾病发生之前就调理好身体。

> 上工治未病，不治已病，此之谓也。 ——《黄帝内经》

## 三个基本原则

- **顺应四时** —— 春夏养阳，秋冬养阴
- **调和饮食** —— 五味入五脏，不过偏不过废
- **起居有常** —— 子时前睡觉，晨起适度运动
',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    6,
    '["中医", "养生"]',
    1,
    7,
    datetime('now', '-12 hours')
  ),
  (
    'music-appreciation-101',
    '古典音乐入门指南',
    '如何开始欣赏古典音乐。',
    '# 古典音乐入门

很多人觉得古典音乐"听不懂"，其实只是没找到入口。

## 推荐入门顺序

1. **巴赫** ——《G 弦上的咏叹调》
2. **莫扎特** —— 钢琴奏鸣曲 K.545
3. **贝多芬** ——《命运交响曲》

## 听的时候

> 不要做任何事。躺着、闭眼、让音乐流过去就好。
',
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
    7,
    '["音乐", "古典"]',
    1,
    5,
    datetime('now', '-8 hours')
  ),
  (
    'history-why-study',
    '为什么要读历史',
    '历史不是过去的尘埃，是现在的镜子。',
    '# 学历史有什么用

- **理解现在** —— 所有的"今天"都是由"昨天"变来的
- **培养判断力** —— 看清一个事件需要纵深
- **对抗遗忘** —— 不学历史的人，会重复前人的错误

> History does not repeat itself, but it does rhyme. —— Mark Twain
',
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80',
    8,
    '["历史", "随想"]',
    1,
    9,
    datetime('now', '-6 hours')
  );