-- 0003_seed_comments.sql
-- 示例评论（直接显示模式）
-- 用 INSERT OR IGNORE 让迁移可重复执行（按 article_id+author_name+content 判重）

INSERT OR IGNORE INTO comments (article_id, parent_id, author_name, author_email, author_website, content, approved, created_at) VALUES
  (
    1, NULL, '张小明', 'zhang@example.com', NULL,
    '写得很清晰！正好想搭一个类似的博客，参考价值很大 👍',
    1, datetime('now', '-4 days', '-3 hours')
  ),
  (
    1, 1, '李雷', NULL, 'https://example.com',
    '同意，期待更多 Cloudflare 相关的实战分享！',
    1, datetime('now', '-4 days', '-1 hour')
  ),
  (
    1, NULL, 'Anonymous', NULL, NULL,
    '请问 D1 的免费额度具体是多少？够个人博客用吗？',
    1, datetime('now', '-3 days')
  ),
  (
    1, 3, 'Simon', 'simon@example.com', NULL,
    '回复：每天 500 万次读 + 10 万次写，对个人博客绰绰有余 ✨',
    1, datetime('now', '-2 days', '-5 hours')
  ),
  (
    2, NULL, '王芳', NULL, NULL,
    'Markdown 语法总结得非常清晰，建议收藏！',
    1, datetime('now', '-2 days')
  ),
  (
    3, NULL, '陈昊', NULL, NULL,
    'Composition API 真的让代码好维护多了，期待下一篇。',
    1, datetime('now', '-12 hours')
  );