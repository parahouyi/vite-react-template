import { api } from "./client";
import type { Article, ArticleDetail, Pagination, Category } from "./types";

export interface ArticlesQuery {
	page?: number;
	limit?: number;
	category?: string;
	tag?: string;
	search?: string;
}

export interface ArticlesResponse {
	articles: Article[];
	pagination: Pagination;
}

export function fetchArticles(
	query: ArticlesQuery = {},
): Promise<ArticlesResponse> {
	return api<ArticlesResponse>("/articles", { query });
}

export function fetchArticleBySlug(slug: string): Promise<{ article: ArticleDetail }> {
	return api<{ article: ArticleDetail }>(`/articles/${encodeURIComponent(slug)}`);
}

export function fetchCategories(): Promise<{ categories: Category[] }> {
	return api<{ categories: Category[] }>("/categories");
}