import { App, MarkdownPostProcessorContext, TFile } from "obsidian";
import { buildThisContext } from "./context";
import { evaluateExpressionSafe } from "./eval";
import { literalString } from "./parse";
import type { InlineQuerySettings, Value } from "./types";

const HTML_TAG = /<[^>]+>/;

function valueToDisplay(value: Value): string {
	if (value === null) return "";
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return String(value);
	if (Array.isArray(value)) return value.map(literalString).join(", ");
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function renderResult(container: HTMLElement, value: Value): void {
	container.empty();
	container.addClass("iq-result");
	const text = valueToDisplay(value);
	if (HTML_TAG.test(text)) {
		container.innerHTML = text;
	} else {
		container.setText(text);
	}
}

function renderError(container: HTMLElement, message: string): void {
	container.empty();
	container.addClass("iq-error");
	container.setText(message);
}

function extractExpression(codeText: string, prefix: string): string | null {
	const trimmed = codeText.trim();
	if (!trimmed.startsWith(prefix)) return null;
	return trimmed.slice(prefix.length).trim();
}

function processInlineCodeElement(
	app: App,
	codeEl: HTMLElement,
	sourcePath: string,
	prefix: string,
): void {
	if (codeEl.dataset.iqProcessed === "1") return;
	if (codeEl.closest("pre")) return;

	const expr = extractExpression(codeEl.textContent ?? "", prefix);
	if (expr === null) return;

	const file = app.vault.getAbstractFileByPath(sourcePath);
	if (!(file instanceof TFile)) return;

	codeEl.dataset.iqProcessed = "1";

	const ctx = buildThisContext(app, file);
	const result = evaluateExpressionSafe(expr, ctx);

	const host = createSpan("iq-inline");
	codeEl.replaceWith(host);

	if (!result.ok) {
		renderError(host, result.error);
		return;
	}
	renderResult(host, result.value);
}

function createSpan(cls: string): HTMLSpanElement {
	const span = document.createElement("span");
	span.className = cls;
	return span;
}

export function processInlineQueriesInElement(
	app: App,
	element: HTMLElement,
	ctx: MarkdownPostProcessorContext,
	settings: InlineQuerySettings,
): void {
	if (!settings.enableInReadingView) return;
	const prefix = settings.inlinePrefix;
	for (const codeEl of element.findAll("code")) {
		processInlineCodeElement(app, codeEl, ctx.sourcePath, prefix);
	}
}
