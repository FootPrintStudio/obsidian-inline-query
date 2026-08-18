import type { App } from "obsidian";
import { TFile } from "obsidian";
import type { LinkOpenBehavior } from "./renderStyle";

export interface ParsedLink {
	cleanedValue: string;
	displayText: string | null;
	isUrl: boolean;
}

function isExternalUrl(target: string): boolean {
	return /^https?:\/\//i.test(target) || target.startsWith("www.");
}

export function parseLink(link: string): ParsedLink {
	link = link.replace(/^"(.*)"$/, "$1");

	const markdownLink = link.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
	if (markdownLink) {
		const target = markdownLink[2]!.trim();
		return {
			cleanedValue: target,
			displayText: markdownLink[1]!.trim(),
			isUrl: isExternalUrl(target),
		};
	}

	const internalMatch = link.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/);
	if (internalMatch) {
		return {
			cleanedValue: internalMatch[1]!.trim(),
			displayText: internalMatch[2]!.trim(),
			isUrl: false,
		};
	}

	link = link.replace(/^\[\[(.*)\]\]$/, "$1");
	const isUrl = isExternalUrl(link.trim());
	return {
		cleanedValue: link.trim(),
		displayText: null,
		isUrl,
	};
}

export function getHostname(url: string): string {
	try {
		if (!url.startsWith("http://") && !url.startsWith("https://")) {
			url = "https://" + url;
		}
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

export function normalizeHref(url: string): string {
	if (url.startsWith("www.")) return "https://" + url;
	return url;
}

export function getLinkDisplayText(app: App, link: string, sourcePath: string): string | null {
	const file = app.metadataCache.getFirstLinkpathDest(link, sourcePath);
	if (file instanceof TFile) {
		const cache = app.metadataCache.getFileCache(file);
		if (cache?.frontmatter?.title) {
			return String(cache.frontmatter.title);
		}
	}
	return null;
}

export function resolveOpenMode(
	e: MouseEvent,
	defaultBehavior: LinkOpenBehavior,
): LinkOpenBehavior {
	if (e.button === 1) return "tab";
	const mod = e.ctrlKey || e.metaKey;
	if (mod && e.shiftKey) return "split";
	if (mod) return "tab";
	return defaultBehavior;
}

export async function openInternalLink(
	app: App,
	link: string,
	sourcePath: string,
	mode: LinkOpenBehavior,
): Promise<void> {
	if (mode === "default" || mode === "current") {
		await app.workspace.openLinkText(link, sourcePath);
		return;
	}

	const pane = mode === "tab" ? "tab" : mode === "split" ? "split" : "window";
	await app.workspace.openLinkText(link, sourcePath, pane);
}
