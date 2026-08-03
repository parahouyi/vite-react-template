import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist", ".wrangler"] },
	{
		files: ["**/*.{ts,mts,tsx,vue}"],
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
	},
	{
		files: ["**/*.vue"],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				sourceType: "module",
				extraFileExtensions: [".vue"],
			},
		},
		plugins: {
			vue: pluginVue,
		},
		rules: {
			...pluginVue.configs["flat/recommended"].rules,
		},
	},
);