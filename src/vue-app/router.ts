import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "./stores/auth";

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		name: "home",
		component: () => import("./views/HomeView.vue"),
	},
	{
		path: "/articles",
		name: "articles",
		component: () => import("./views/ArticlesView.vue"),
	},
	{
		path: "/articles/:slug",
		name: "article",
		component: () => import("./views/ArticleView.vue"),
	},
	{
		path: "/categories",
		name: "categories",
		component: () => import("./views/CategoriesView.vue"),
	},
	{
		path: "/categories/:slug",
		name: "category",
		component: () => import("./views/CategoryView.vue"),
	},
	{
		path: "/tags/:tag",
		name: "tag",
		component: () => import("./views/TagView.vue"),
	},
	{
		path: "/search",
		name: "search",
		component: () => import("./views/SearchView.vue"),
	},
	{
		path: "/about",
		name: "about",
		component: () => import("./views/AboutView.vue"),
	},
	{
		path: "/login",
		name: "login",
		component: () => import("./views/LoginView.vue"),
	},
	{
		path: "/admin",
		component: () => import("./views/admin/AdminLayout.vue"),
		meta: { requiresAuth: true },
		children: [
			{
				path: "",
				name: "admin-dashboard",
				component: () => import("./views/admin/DashboardView.vue"),
			},
			{
				path: "articles",
				name: "admin-articles",
				component: () => import("./views/admin/ArticleListView.vue"),
			},
			{
				path: "articles/new",
				name: "admin-article-new",
				component: () => import("./views/admin/ArticleEditorView.vue"),
			},
			{
				path: "articles/:id/edit",
				name: "admin-article-edit",
				component: () => import("./views/admin/ArticleEditorView.vue"),
			},
			{
				path: "comments",
				name: "admin-comments",
				component: () => import("./views/admin/CommentModerationView.vue"),
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		name: "not-found",
		component: () => import("./views/NotFoundView.vue"),
	},
];

export const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(_to, _from, savedPosition) {
		if (savedPosition) return savedPosition;
		return { top: 0 };
	},
});

router.beforeEach((to) => {
	if (to.meta.requiresAuth) {
		const auth = useAuthStore();
		if (!auth.isAuthenticated) {
			return { name: "login", query: { redirect: to.fullPath } };
		}
	}
	if (to.name === "login" && useAuthStore().isAuthenticated) {
		const redirect = String(to.query.redirect ?? "/admin");
		return redirect;
	}
	return true;
});