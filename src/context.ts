import { App, TFile } from "obsidian";
import type { ThisContext, Value } from "./types";

function cloneValue(value: unknown): Value {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return new Date(value.getTime());
	if (Array.isArray(value)) return value.map((v) => cloneValue(v));
	if (typeof value === "object") {
		const out: Record<string, Value> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			out[k] = cloneValue(v);
		}
		return out;
	}
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		return value;
	}
	return String(value);
}

export function buildThisContext(app: App, file: TFile): ThisContext {
	const cache = app.metadataCache.getFileCache(file);
	const fm = cache?.frontmatter ?? {};
	const ctx = cloneValue(fm) as Record<string, Value>;

	ctx.file = {
		name: file.basename.replace(/\.md$/i, ""),
		path: file.path,
		folder: file.parent?.path ?? "",
		mtime: new Date(file.stat.mtime),
		ctime: new Date(file.stat.ctime),
		size: file.stat.size,
		tags: (cache?.tags ?? []).map((t) => t.tag.replace(/^#/, "")),
	};

	return ctx as ThisContext;
}

export function getMemberValue(base: Value, property: string): Value {
	if (base === null || base === undefined) return null;
	if (Array.isArray(base)) {
		const index = Number(property);
		if (!Number.isNaN(index)) return base[index] ?? null;
		return null;
	}
	if (typeof base === "object" && !(base instanceof Date)) {
		return (base as Record<string, Value>)[property] ?? null;
	}
	return null;
}
