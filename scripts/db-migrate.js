#!/usr/bin/env node
// scripts/db-migrate.js
// 一键运行所有迁移（按文件名排序）
// 用法: node scripts/db-migrate.js <local|remote> [--reset]

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const target = process.argv[2];

if (!["local", "remote"].includes(target)) {
	console.error("用法: node scripts/db-migrate.js <local|remote> [--reset]");
	process.exit(1);
}

const reset = process.argv.includes("--reset");

if (reset && target === "local") {
	const localDir = path.join(".wrangler", "state", "v3", "d1");
	if (fs.existsSync(localDir)) {
		console.log("→ 尝试清理本地 D1 SQLite 文件 …");
		try {
			const files = fs.readdirSync(localDir);
			for (const f of files) {
				if (f.endsWith(".sqlite") || f.endsWith(".sqlite-shm") || f.endsWith(".sqlite-wal")) {
					fs.rmSync(path.join(localDir, f), { force: true });
					console.log(`  ✓ 删除 ${f}`);
				}
			}
		} catch (err) {
			console.warn(`  ⚠ 无法清理（${err.code}）。请先关闭 wrangler dev 再重试。`);
			console.warn(`    迁移脚本仍然可以继续运行（所有 INSERT 都用了 OR IGNORE）。`);
		}
	} else {
		console.log("→ 本地 D1 不存在，无需清理");
	}
}

if (reset && target === "remote") {
	console.error("✗ 不支持 --remote --reset（远程 D1 只能从 Cloudflare 控制台删除）");
	process.exit(1);
}

const flag = target === "remote" ? "--remote" : "--local";
const dbName = "simon-blog-db";
const migrationsDir = "migrations";
const migrations = fs
	.readdirSync(migrationsDir)
	.filter((f) => f.endsWith(".sql"))
	.sort();

if (migrations.length === 0) {
	console.error(`✗ 在 ${migrationsDir}/ 下找不到任何 .sql 文件`);
	process.exit(1);
}

console.log(
	`→ 准备运行 ${migrations.length} 个迁移到 ${target} (${dbName})\n`,
);

let successCount = 0;
let skipCount = 0;

for (const m of migrations) {
	const filePath = path.join(migrationsDir, m);
	process.stdout.write(`  [${target}] ${m} ... `);
	try {
		execSync(
			`npx wrangler d1 execute ${dbName} ${flag} --file=${filePath}`,
			{ stdio: ["ignore", "pipe", "pipe"] },
		);
		console.log("✓");
		successCount++;
	} catch (err) {
		const stderr = err.stderr?.toString() || "";
		if (stderr.includes("UNIQUE constraint failed")) {
			console.log("⏭  (数据已存在，跳过)");
			skipCount++;
		} else {
			console.log("✗");
			console.error("\n" + stderr);
			process.exit(1);
		}
	}
}

console.log(
	`\n✓ 完成: ${successCount} 个迁移成功${skipCount ? `, ${skipCount} 个跳过（已存在）` : ""}`,
);