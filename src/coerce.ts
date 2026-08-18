import { isPqDate, isPqDuration } from "./dates";
import type { OutputKind, Value } from "./types";

const HTML_TAG = /<[^>]+>/;
const MARKDOWN_HINT = /(\*\*|__|\*|_|!\[|\[\[|^#+\s)/m;

export function listToDisplay(list: Value[], separator = ", "): string {
	return list
		.map((item) => valueToPlainString(item))
		.filter((s) => s.length > 0)
		.join(separator);
}

export function valueToPlainString(value: Value): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return String(value);
	if (typeof value === "string") return value;
	if (isPqDate(value)) return new Date(value.ms).toISOString();
	if (isPqDuration(value)) return `${value.ms}ms`;
	if (Array.isArray(value)) return listToDisplay(value);
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

export function containsHtmlTag(text: string): boolean {
	return HTML_TAG.test(text);
}

export function valueToStyleItems(value: Value): string[] {
	if (value === null || value === undefined) return [];
	if (Array.isArray(value)) {
		return value.flatMap((item) => valueToStyleItems(item)).filter((s) => s.length > 0);
	}
	const text = valueToPlainString(value).trim();
	if (!text) return [];
	return [text];
}

export function classifyOutput(value: Value): OutputKind {
	if (value === null) return "empty";
	const text = valueToPlainString(value);
	if (!text) return "empty";
	// Prefer Markdown when both MD markers and HTML tags are present.
	// MarkdownRenderer accepts inline HTML (e.g. <br>), so "**Parent**<br>" stays bold.
	if (MARKDOWN_HINT.test(text)) return "markdown";
	if (typeof value === "string" && (text.includes("[[") || text.includes("!["))) return "markdown";
	if (HTML_TAG.test(text)) return "html";
	return "text";
}

export function coerceForConcat(value: Value): string {
	if (Array.isArray(value)) return listToDisplay(value, ", ");
	return valueToPlainString(value);
}

export function valuesEqual(a: Value, b: Value): boolean {
	if (a === b) return true;
	if (isPqDate(a) && isPqDate(b)) return a.ms === b.ms;
	if (isPqDuration(a) && isPqDuration(b)) return a.ms === b.ms;
	const na = Number(a);
	const nb = Number(b);
	if (!Number.isNaN(na) && !Number.isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") {
		return na === nb;
	}
	return String(a ?? "") === String(b ?? "");
}

export function isWildcardKey(key: Value): boolean {
	return key === "*" || key === "default" || key === "_";
}
