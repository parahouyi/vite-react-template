import { Hono, type Context, type Next } from "hono";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

type Bindings = {
	simon_blog_db: D1Database;
	JWT_SECRET: string;
};

type AdminPayload = { sub: string; username: string };

type AppEnv = {
	Bindings: Bindings;
	Variables: { admin: AdminPayload };
};

const app = new Hono<AppEnv>();

app.get("/api/", (c) => c.json({ name: "Cloudflare", version: "1.0" }));

function getSecret(c: Context<AppEnv>): Uint8Array {
	const raw = c.env.JWT_SECRET || "dev-fallback-secret-please-set-in-production";
	return new TextEncoder().encode(raw);
}

async function signToken(
	c: Context<AppEnv>,
	payload: AdminPayload,
): Promise<string> {
	return new SignJWT({ username: payload.username })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(payload.sub)
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(getSecret(c));
}

async function verifyToken(
	c: Context<AppEnv>,
	token: string,
): Promise<AdminPayload> {
	const { payload } = await jwtVerify(token, getSecret(c));
	return {
		sub: String(payload.sub ?? ""),
		username: String(payload.username ?? ""),
	};
}

async function authMiddleware(c: Context<AppEnv>, next: Next) {
	const header = c.req.header("Authorization");
	if (!header?.startsWith("Bearer ")) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	const token = header.slice(7).trim();
	try {
		const admin = await verifyToken(c, token);
		c.set("admin", admin);
		await next();
	} catch {
		return c.json({ error: "Invalid or expired token" }, 401);
	}
}

app.post("/api/auth/login", async (c) => {
	const db = c.env.simon_blog_db;
	let body: { username?: string; password?: string };
	try {
		body = (await c.req.json()) as { username?: string; password?: string };
	} catch {
		return c.json({ error: "Invalid JSON" }, 400);
	}
	const username = String(body.username ?? "").trim();
	const password = String(body.password ?? "");

	if (!username || !password) {
		return c.json({ error: "请填写用户名和密码" }, 400);
	}

	const admin = await db
		.prepare("SELECT id, username, password_hash FROM admins WHERE username = ?")
		.bind(username)
		.first<{ id: number; username: string; password_hash: string }>();

	if (!admin) {
		return c.json({ error: "用户名或密码错误" }, 401);
	}

	const ok = await bcrypt.compare(password, admin.password_hash);
	if (!ok) {
		return c.json({ error: "用户名或密码错误" }, 401);
	}

	const token = await signToken(c, {
		sub: String(admin.id),
		username: admin.username,
	});
	return c.json({ token, username: admin.username });
});

app.get("/api/auth/me", authMiddleware, (c) => {
	const admin = c.get("admin");
	return c.json({ username: admin.username });
});

interface ArticleRow {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	cover_image: string | null;
	tags: string | null;
	author: string;
	views: number;
	created_at: string;
	category_name: string | null;
	category_slug: string | null;
}

interface ArticleDetailRow extends ArticleRow {
	content: string;
	updated_at: string;
}

interface CountRow {
	total: number;
}

interface Category {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	sort_order: number;
}

function parseTags(raw: string | null): string[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
}

function jsonifyTags(row: ArticleRow | ArticleDetailRow) {
	return { ...row, tags: parseTags(row.tags) };
}

app.get("/api/articles", async (c) => {
	const db = c.env.simon_blog_db;
	const page = Math.max(1, Number(c.req.query("page") ?? "1"));
	const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? "12")));
	const offset = (page - 1) * limit;
	const category = c.req.query("category");
	const tag = c.req.query("tag");
	const search = c.req.query("search");

	const where: string[] = ["a.published = 1"];
	const params: (string | number)[] = [];

	if (category) {
		where.push("c.slug = ?");
		params.push(category);
	}

	if (tag) {
		where.push('a.tags LIKE ?');
		params.push(`%"${tag}"%`);
	}

	if (search) {
		where.push("(a.title LIKE ? OR a.excerpt LIKE ?)");
		const like = `%${search}%`;
		params.push(like, like);
	}

	const whereSql = where.join(" AND ");

	const listSql = `
		SELECT a.id, a.slug, a.title, a.excerpt, a.cover_image,
		       a.tags, a.author, a.views, a.created_at,
		       c.name AS category_name, c.slug AS category_slug
		FROM articles a
		LEFT JOIN categories c ON a.category_id = c.id
		WHERE ${whereSql}
		ORDER BY a.created_at DESC
		LIMIT ? OFFSET ?
	`;

	const countSql = `
		SELECT COUNT(*) AS total
		FROM articles a
		LEFT JOIN categories c ON a.category_id = c.id
		WHERE ${whereSql}
	`;

	const [listRes, countRes] = await Promise.all([
		db.prepare(listSql).bind(...params, limit, offset).all<ArticleRow>(),
		db.prepare(countSql).bind(...params).first<CountRow>(),
	]);

	const total = countRes?.total ?? 0;
	const articles = (listRes.results ?? []).map(jsonifyTags);

	return c.json({
		articles,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		},
	});
});

app.get("/api/articles/:slug", async (c) => {
	const db = c.env.simon_blog_db;
	const slug = c.req.param("slug");

	const row = await db
		.prepare(
			`SELECT a.*, c.name AS category_name, c.slug AS category_slug
			 FROM articles a
			 LEFT JOIN categories c ON a.category_id = c.id
			 WHERE a.slug = ? AND a.published = 1`,
		)
		.bind(slug)
		.first<ArticleDetailRow>();

	if (!row) return c.json({ error: "Article not found" }, 404);

	await db
		.prepare("UPDATE articles SET views = views + 1 WHERE id = ?")
		.bind(row.id)
		.run();

	return c.json({ article: jsonifyTags(row) });
});

app.get("/api/categories", async (c) => {
	const db = c.env.simon_blog_db;
	const { results } = await db
		.prepare(
			`SELECT c.id, c.name, c.slug, c.description, c.sort_order,
			        COUNT(a.id) AS article_count
			 FROM categories c
			 LEFT JOIN articles a ON a.category_id = c.id AND a.published = 1
			 GROUP BY c.id
			 ORDER BY c.sort_order ASC, c.id ASC`,
		)
		.all<{
			id: number;
			name: string;
			slug: string;
			description: string | null;
			sort_order: number;
			article_count: number;
		}>();

	return c.json({ categories: results ?? [] });
});

interface CommentRow {
	id: number;
	article_id: number;
	parent_id: number | null;
	author_name: string;
	author_email: string | null;
	author_website: string | null;
	content: string;
	created_at: string;
}

function parseArticleId(raw: string): number | null {
	const n = Number(raw);
	return Number.isInteger(n) && n > 0 ? n : null;
}

app.get("/api/articles/:id/comments", async (c) => {
	const db = c.env.simon_blog_db;
	const articleId = parseArticleId(c.req.param("id"));
	if (!articleId) return c.json({ error: "Invalid article id" }, 400);

	const { results } = await db
		.prepare(
			`SELECT id, article_id, parent_id, author_name, author_email,
			        author_website, content, created_at
			 FROM comments
			 WHERE article_id = ? AND approved = 1
			 ORDER BY created_at ASC`,
		)
		.bind(articleId)
		.all<CommentRow>();

	return c.json({ comments: results ?? [] });
});

app.post("/api/articles/:id/comments", async (c) => {
	const db = c.env.simon_blog_db;
	const articleId = parseArticleId(c.req.param("id"));
	if (!articleId) return c.json({ error: "Invalid article id" }, 400);

	let body: Record<string, unknown>;
	try {
		body = (await c.req.json()) as Record<string, unknown>;
	} catch {
		return c.json({ error: "Invalid JSON body" }, 400);
	}

	// Honeypot: bots auto-fill hidden fields, real users never see them
	if (typeof body._gotcha === "string" && body._gotcha.length > 0) {
		return c.json({ comment: { id: 0 }, ignored: true }, 201);
	}

	const authorName = String(body.author_name ?? "").trim();
	const content = String(body.content ?? "").trim();
	const authorEmail = String(body.author_email ?? "").trim();
	const authorWebsite = String(body.author_website ?? "").trim();
	const parentId = body.parent_id ? Number(body.parent_id) : null;

	if (!authorName || authorName.length > 50) {
		return c.json({ error: "请填写姓名（1-50 字符）" }, 400);
	}
	if (!content || content.length > 2000) {
		return c.json({ error: "请填写评论内容（1-2000 字符）" }, 400);
	}
	if (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
		return c.json({ error: "邮箱格式不正确" }, 400);
	}
	if (authorWebsite && !/^https?:\/\//i.test(authorWebsite)) {
		return c.json({ error: "网站必须以 http:// 或 https:// 开头" }, 400);
	}

	// Validate article exists & is published
	const article = await db
		.prepare("SELECT id FROM articles WHERE id = ? AND published = 1")
		.bind(articleId)
		.first<{ id: number }>();
	if (!article) return c.json({ error: "文章不存在" }, 404);

	// Validate parent comment belongs to same article
	if (parentId) {
		const parent = await db
			.prepare(
				"SELECT article_id FROM comments WHERE id = ? AND approved = 1",
			)
			.bind(parentId)
			.first<{ article_id: number }>();
		if (!parent || parent.article_id !== articleId) {
			return c.json({ error: "父评论无效" }, 400);
		}
	}

	const insertResult = await db
		.prepare(
			`INSERT INTO comments
			   (article_id, parent_id, author_name, author_email, author_website, content, approved)
			 VALUES (?, ?, ?, ?, ?, ?, 1)`,
		)
		.bind(
			articleId,
			parentId,
			authorName,
			authorEmail || null,
			authorWebsite || null,
			content,
		)
		.run<CommentRow>();

	const newId = insertResult.meta?.last_row_id;
	const created = await db
		.prepare(
			`SELECT id, article_id, parent_id, author_name, author_email,
			        author_website, content, created_at
			 FROM comments WHERE id = ?`,
		)
		.bind(newId)
		.first<CommentRow>();

	return c.json({ comment: created }, 201);
});

// ============================================================================
// Admin API (protected)
// ============================================================================

// ============================================================================
// Admin API (protected)
// ============================================================================

interface AdminArticleRow extends ArticleRow {
	content: string;
	updated_at: string;
}

function slugify(input: string): string {
	const ascii = input
		.toLowerCase()
		.trim()
		.replace(/['"`]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (ascii) return ascii;
	const cjk = input.trim().replace(/\s+/g, "-").replace(/[^一-鿿-]+/g, "");
	return cjk || `post-${Date.now()}`;
}

async function parseJsonBody<T>(c: Context<AppEnv>): Promise<T | null> {
	try {
		return (await c.req.json()) as T;
	} catch {
		return null;
	}
}

function normalizeTags(input: unknown): string | null {
	if (Array.isArray(input)) {
		const cleaned = input.map((t) => String(t).trim()).filter(Boolean);
		return cleaned.length ? JSON.stringify(cleaned) : null;
	}
	if (typeof input === "string") {
		const cleaned = input
			.split(/[,，]/)
			.map((t) => t.trim())
			.filter(Boolean);
		return cleaned.length ? JSON.stringify(cleaned) : null;
	}
	return null;
}

const admin = new Hono<AppEnv>();
admin.use("*", authMiddleware);

admin.get("/stats", async (c) => {
	const db = c.env.simon_blog_db;
	const [totalRes, commentsRes, viewsRes, draftsRes, recentA, recentC] =
		await Promise.all([
			db
				.prepare("SELECT COUNT(*) AS c FROM articles")
				.first<{ c: number }>(),
			db
				.prepare("SELECT COUNT(*) AS c FROM comments")
				.first<{ c: number }>(),
			db
				.prepare("SELECT COALESCE(SUM(views), 0) AS c FROM articles")
				.first<{ c: number }>(),
			db
				.prepare("SELECT COUNT(*) AS c FROM articles WHERE published = 0")
				.first<{ c: number }>(),
			db
				.prepare(
					"SELECT id, slug, title, published, views, created_at FROM articles ORDER BY created_at DESC LIMIT 5",
				)
				.all<{
					id: number;
					slug: string;
					title: string;
					published: number;
					views: number;
					created_at: string;
				}>(),
			db
				.prepare(
					`SELECT c.id, c.author_name, c.content, c.created_at,
					        a.title AS article_title, a.slug AS article_slug
					 FROM comments c
					 LEFT JOIN articles a ON c.article_id = a.id
					 ORDER BY c.created_at DESC LIMIT 5`,
				)
				.all<{
					id: number;
					author_name: string;
					content: string;
					created_at: string;
					article_title: string | null;
					article_slug: string | null;
				}>(),
		]);

	const total = totalRes?.c ?? 0;
	const drafts = draftsRes?.c ?? 0;
	return c.json({
		stats: {
			total_articles: total,
			published_articles: total - drafts,
			draft_articles: drafts,
			total_comments: commentsRes?.c ?? 0,
			total_views: viewsRes?.c ?? 0,
		},
		recent_articles: recentA.results ?? [],
		recent_comments: recentC.results ?? [],
	});
});

admin.get("/categories", async (c) => {
	const db = c.env.simon_blog_db;
	const { results } = await db
		.prepare(
			"SELECT id, name, slug, description, sort_order FROM categories ORDER BY sort_order ASC, id ASC",
		)
		.all<Category>();
	return c.json({ categories: results ?? [] });
});

admin.get("/articles", async (c) => {
	const db = c.env.simon_blog_db;
	const { results } = await db
		.prepare(
			`SELECT a.id, a.slug, a.title, a.excerpt, a.cover_image, a.tags,
			        a.author, a.published, a.views, a.created_at, a.updated_at,
			        c.name AS category_name, c.slug AS category_slug
			 FROM articles a
			 LEFT JOIN categories c ON a.category_id = c.id
			 ORDER BY a.created_at DESC`,
		)
		.all<AdminArticleRow & { category_name: string | null; category_slug: string | null }>();
	const articles = (results ?? []).map((r) => ({
		...r,
		tags: parseTags(r.tags),
	}));
	return c.json({ articles });
});

admin.get("/articles/:id", async (c) => {
	const db = c.env.simon_blog_db;
	const id = parseArticleId(c.req.param("id"));
	if (!id) return c.json({ error: "Invalid article id" }, 400);

	const row = await db
		.prepare(
			`SELECT a.*, c.name AS category_name, c.slug AS category_slug
			 FROM articles a
			 LEFT JOIN categories c ON a.category_id = c.id
			 WHERE a.id = ?`,
		)
		.bind(id)
		.first<AdminArticleRow & { category_name: string | null; category_slug: string | null }>();
	if (!row) return c.json({ error: "文章不存在" }, 404);

	return c.json({ article: { ...row, tags: parseTags(row.tags) } });
});

admin.post("/articles", async (c) => {
	const db = c.env.simon_blog_db;
	const body = await parseJsonBody<Record<string, unknown>>(c);
	if (!body) return c.json({ error: "Invalid JSON" }, 400);

	const title = String(body.title ?? "").trim();
	const content = String(body.content ?? "").trim();
	if (!title) return c.json({ error: "标题必填" }, 400);
	if (!content) return c.json({ error: "内容必填" }, 400);

	const slug = String(body.slug ?? "").trim() || slugify(title);
	const existing = await db
		.prepare("SELECT id FROM articles WHERE slug = ?")
		.bind(slug)
		.first<{ id: number }>();
	if (existing) return c.json({ error: `Slug "${slug}" 已存在` }, 409);

	const excerpt = String(body.excerpt ?? "").trim() || null;
	const coverImage = String(body.cover_image ?? "").trim() || null;
	const categoryId = body.category_id ? Number(body.category_id) : null;
	const tagsJson = normalizeTags(body.tags);
	const published = body.published ? 1 : 0;

	const result = await db
		.prepare(
			`INSERT INTO articles
			   (slug, title, excerpt, content, cover_image, category_id, tags, author, published)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			slug,
			title,
			excerpt,
			content,
			coverImage,
			categoryId,
			tagsJson,
			"Simon Zhang",
			published,
		)
		.run();

	return c.json({ id: Number(result.meta.last_row_id), slug }, 201);
});

admin.put("/articles/:id", async (c) => {
	const db = c.env.simon_blog_db;
	const id = parseArticleId(c.req.param("id"));
	if (!id) return c.json({ error: "Invalid id" }, 400);

	const body = await parseJsonBody<Record<string, unknown>>(c);
	if (!body) return c.json({ error: "Invalid JSON" }, 400);

	const exists = await db
		.prepare("SELECT id FROM articles WHERE id = ?")
		.bind(id)
		.first<{ id: number }>();
	if (!exists) return c.json({ error: "文章不存在" }, 404);

	const title = String(body.title ?? "").trim();
	const content = String(body.content ?? "").trim();
	if (!title) return c.json({ error: "标题必填" }, 400);
	if (!content) return c.json({ error: "内容必填" }, 400);

	const slug = String(body.slug ?? "").trim() || slugify(title);
	const conflict = await db
		.prepare("SELECT id FROM articles WHERE slug = ? AND id != ?")
		.bind(slug, id)
		.first<{ id: number }>();
	if (conflict) return c.json({ error: `Slug "${slug}" 已被其他文章使用` }, 409);

	const excerpt = String(body.excerpt ?? "").trim() || null;
	const coverImage = String(body.cover_image ?? "").trim() || null;
	const categoryId = body.category_id ? Number(body.category_id) : null;
	const tagsJson = normalizeTags(body.tags);
	const published = body.published ? 1 : 0;

	await db
		.prepare(
			`UPDATE articles SET
			   title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?,
			   category_id = ?, tags = ?, published = ?, updated_at = datetime('now')
			 WHERE id = ?`,
		)
		.bind(
			title,
			slug,
			excerpt,
			content,
			coverImage,
			categoryId,
			tagsJson,
			published,
			id,
		)
		.run();

	return c.json({ success: true, slug });
});

admin.delete("/articles/:id", async (c) => {
	const db = c.env.simon_blog_db;
	const id = parseArticleId(c.req.param("id"));
	if (!id) return c.json({ error: "Invalid id" }, 400);

	await db.prepare("DELETE FROM comments WHERE article_id = ?").bind(id).run();
	await db.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
	return c.json({ success: true });
});

admin.get("/comments", async (c) => {
	const db = c.env.simon_blog_db;
	const { results } = await db
		.prepare(
			`SELECT c.*, a.title AS article_title, a.slug AS article_slug
			 FROM comments c
			 LEFT JOIN articles a ON c.article_id = a.id
			 ORDER BY c.created_at DESC`,
		)
		.all<{
			id: number;
			article_id: number;
			parent_id: number | null;
			author_name: string;
			content: string;
			created_at: string;
			article_title: string | null;
			article_slug: string | null;
		}>();
	return c.json({ comments: results ?? [] });
});

app.route("/api/admin", admin);

// ============================================================================
// Public feeds (sitemap, RSS, robots)
// ============================================================================

function xmlEscape(input: string): string {
	return input.replace(/[&<>"']/g, (c) => {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&apos;",
		};
		return map[c] ?? c;
	});
}

function originOf(c: Context<AppEnv>): string {
	return new URL(c.req.url).origin;
}

app.get("/api/feed.xml", async (c) => {
	const db = c.env.simon_blog_db;
	const { results } = await db
		.prepare(
			`SELECT a.slug, a.title, a.excerpt, a.content, a.cover_image,
			        a.created_at, a.updated_at, a.author, c.name AS category_name
			 FROM articles a
			 LEFT JOIN categories c ON a.category_id = c.id
			 WHERE a.published = 1
			 ORDER BY a.created_at DESC
			 LIMIT 50`,
		)
		.all<{
			slug: string;
			title: string;
			excerpt: string | null;
			content: string;
			cover_image: string | null;
			created_at: string;
			updated_at: string;
			author: string;
			category_name: string | null;
		}>();

	const origin = originOf(c);
	const items = (results ?? [])
		.map((a) => {
			const desc = (a.excerpt || a.content.slice(0, 280))
				.replace(/[#*`>_~-]+/g, "")
				.trim();
			return `    <item>
      <title>${xmlEscape(a.title)}</title>
      <link>${origin}/articles/${a.slug}</link>
      <guid isPermaLink="true">${origin}/articles/${a.slug}</guid>
      <description>${xmlEscape(desc)}</description>
      ${a.category_name ? `<category>${xmlEscape(a.category_name)}</category>` : ""}
      <dc:creator>${xmlEscape(a.author)}</dc:creator>
      <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
    </item>`;
		})
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Simon&apos;s Blog</title>
    <link>${origin}</link>
    <description>记录技术、思考与生活。一个跑在 Cloudflare 边缘网络上的个人博客。</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

	return c.body(xml, 200, {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=600",
	});
});

app.get("/sitemap.xml", async (c) => {
	const db = c.env.simon_blog_db;
	const { results } = await db
		.prepare(
			`SELECT slug, created_at, updated_at FROM articles WHERE published = 1`,
		)
		.all<{ slug: string; created_at: string; updated_at: string }>();

	const origin = originOf(c);
	const now = new Date().toISOString().slice(0, 10);

	const staticUrls = [
		{ loc: "/", lastmod: now, priority: "1.0", changefreq: "daily" },
		{ loc: "/articles", lastmod: now, priority: "0.8", changefreq: "daily" },
		{ loc: "/categories", lastmod: now, priority: "0.6", changefreq: "weekly" },
		{ loc: "/about", lastmod: now, priority: "0.5", changefreq: "monthly" },
	];

	const articleUrls = (results ?? []).map((a) => ({
		loc: `/articles/${a.slug}`,
		lastmod: (a.updated_at || a.created_at).slice(0, 10),
		priority: "0.7",
		changefreq: "weekly",
	}));

	const allUrls = [...staticUrls, ...articleUrls];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
	.map(
		(u) => `  <url>
    <loc>${origin}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>`;

	return c.body(xml, 200, {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600",
	});
});

app.get("/robots.txt", (c) => {
	const origin = originOf(c);
	return c.body(
		`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${origin}/sitemap.xml\n`,
		200,
		{ "Content-Type": "text/plain; charset=utf-8" },
	);
});

export default app;