-- 0005_seed_more_categories.sql
-- 新增 5 个分类

INSERT INTO categories (name, slug, description, sort_order, created_at) VALUES
  ('编程', 'programming', '编程语言、框架、工具与最佳实践', 4, datetime('now')),
  ('AI', 'ai', '人工智能、机器学习、大语言模型', 5, datetime('now')),
  ('中医', 'tcm', '传统中医、养生、经络与中药', 6, datetime('now')),
  ('音乐', 'music', '音乐赏析、乐器学习与创作', 7, datetime('now')),
  ('历史', 'history', '历史事件、人物、文化与考古', 8, datetime('now'));