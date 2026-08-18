export type RenderStyle = "cards" | "button" | "cards-code" | "inline" | "list";

export type LinkOpenBehavior = "default" | "current" | "tab" | "split" | "window";

const STYLE_ALIASES: Record<string, RenderStyle> = {
	card: "cards",
	cards: "cards",
	button: "button",
	buttons: "button",
	"cards-code": "cards-code",
	code: "cards-code",
	"code-card": "cards-code",
	codecard: "cards-code",
	inline: "inline",
	list: "list",
};

export const RENDER_STYLE_NAMES = ["card", "button", "cards-code", "inline", "list"] as const;

export function parseRenderStyleName(raw: string): RenderStyle {
	const key = raw.trim().toLowerCase();
	const resolved = STYLE_ALIASES[key];
	if (!resolved) {
		throw new Error(
			`Unknown style "${raw}". Use AS card, button, cards-code, inline, or list.`,
		);
	}
	return resolved;
}
