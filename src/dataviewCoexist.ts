/** Dataview inline-JS prefix (we must not shield these). */
export const DATAVIEW_JS_INLINE_PREFIX = "$=";

/**
 * Inline code that is only one or more "=" characters (e.g. `==`) is mis-parsed by Dataview
 * as an inline query starting with "=". Detect those false positives so we can shield them.
 */
export function shouldShieldDataviewInlineCode(text: string, pqPrefix: string): boolean {
	const trimmed = text.trim();
	if (!trimmed.startsWith("=")) return false;
	if (pqPrefix && trimmed.startsWith(pqPrefix)) return false;
	if (trimmed.startsWith(DATAVIEW_JS_INLINE_PREFIX)) return false;
	return /^=+$/.test(trimmed);
}

export function shieldDataviewInlineCodeFalsePositive(
	codeEl: HTMLElement,
	pqPrefix: string,
): boolean {
	if (codeEl.dataset.pqDvShield === "1") return false;
	const text = codeEl.innerText ?? "";
	if (!shouldShieldDataviewInlineCode(text, pqPrefix)) return false;

	codeEl.dataset.pqDvShield = "1";
	const span = document.createElement("span");
	span.className = "pq-code-shield";
	span.textContent = text.trim();
	codeEl.replaceWith(span);
	return true;
}
