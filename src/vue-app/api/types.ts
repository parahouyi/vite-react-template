export interface Article {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	cover_image: string | null;
	tags: string[];
	author: string;
	views: number;
	created_at: string;
	category_name: string | null;
	category_slug: string | null;
}

export interface ArticleDetail extends Article {
	content: string;
	updated_at: string;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	sort_order: number;
	article_count: number;
}

export interface Comment {
	id: number;
	article_id: number;
	parent_id: number | null;
	author_name: string;
	author_email: string | null;
	author_website: string | null;
	content: string;
	created_at: string;
}