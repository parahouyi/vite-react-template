import { api } from "./client";
import type { Category } from "./types";

export interface AdminStats {
	total_articles: number;
	published_articles: number;
	draft_articles: number;
	total_comments: number;
	total_views: number;
}

export interface RecentArticle {
	id: number;
	slug: string;
	title: string;
	published: number;
	views: number;
	created_at: string;
}

export interface RecentComment {
	id: number;
	author_name: string;
	content: string;
	created_at: string;
	article_title: string | null;
	article_slug: string | null;
}

export interface AdminStatsResponse {
	stats: AdminStats;
	recent_articles: RecentArticle[];
	recent_comments: RecentComment[];
}

export interface AdminArticleListItem {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	cover_image: string | null;
	tags: string[];
	author: string;
	published: number;
	views: number;
	created_at: string;
	updated_at: string;
	category_name: string | null;
	category_slug: string | null;
}

export interface AdminCommentListItem {
	id: number;
	article_id: number;
	parent_id: number | null;
	author_name: string;
	content: string;
	created_at: string;
	article_title: string | null;
	article_slug: string | null;
}

export interface AdminArticleDetail extends AdminArticleListItem {
	content: string;
}

export interface AdminArticlePayload {
	title: string;
	slug?: string;
	content: string;
	excerpt?: string;
	cover_image?: string;
	category_id?: number | null;
	tags?: string[] | string;
	published?: boolean;
}

export function fetchAdminStats() {
	return api<AdminStatsResponse>("/admin/stats");
}

export function fetchAdminArticles() {
	return api<{ articles: AdminArticleListItem[] }>("/admin/articles");
}

export function fetchAdminArticle(id: number) {
	return api<{ article: AdminArticleDetail }>(`/admin/articles/${id}`);
}

export function fetchAdminComments() {
	return api<{ comments: AdminCommentListItem[] }>("/admin/comments");
}

export function fetchAdminCategories() {
	return api<{ categories: Category[] }>("/admin/categories");
}

export function createArticle(payload: AdminArticlePayload) {
	return api<{ id: number; slug: string }>("/admin/articles", {
		method: "POST",
		body: payload,
	});
}

export function updateArticle(id: number, payload: AdminArticlePayload) {
	return api<{ success: boolean; slug: string }>(`/admin/articles/${id}`, {
		method: "PUT",
		body: payload,
	});
}

export function deleteArticle(id: number) {
	return api<{ success: boolean }>(`/admin/articles/${id}`, {
		method: "DELETE",
	});
}

export function deleteComment(id: number) {
	return api<{ success: boolean }>(`/admin/comments/${id}`, {
		method: "DELETE",
	});
}