-- 0004_seed_admin.sql
-- 默认管理员账户（用户名 admin / 密码 admin123）
-- ⚠️ 首次登录后请立即通过后台"设置"页面修改密码

INSERT OR IGNORE INTO admins (username, password_hash, created_at) VALUES
  (
    'admin',
    '$2b$10$vUn/g2VGnY4mbuHDHHzxYudjbWkPmJNtJis/XvOSR3HnYkxFSKojK',
    datetime('now')
  );