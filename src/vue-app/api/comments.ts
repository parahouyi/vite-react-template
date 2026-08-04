import { api } from "./client";
import type { Comment } from "./types";

export function fetchComments(
	articleId: number,
): Promise<{ comments: Comment[] }> {
	return api<{ comments: Comment[] }>(`/articles/${articleId}/comments`);
}

export interface CommentSubmit {
	author_name: string;
	author_email?: string;
	author_website?: string;
	content: string;
	parent_id?: number | null;
	_gotcha?: string;
}

export function submitComment(
	articleId: number,
	payload: CommentSubmit,
): Promise<{ comment: Comment }> {
	return api<{ comment: Comment }>(`/articles/${articleId}/comments`, {
		method: "POST",
		body: payload,
	});
}