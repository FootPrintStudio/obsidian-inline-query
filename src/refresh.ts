import { App, MarkdownView, TFile } from "obsidian";

/** Rerender every open markdown preview so post-processors re-run (e.g. after settings change). */
export function rerenderAllMarkdownViews(app: App): void {
	for (const leaf of app.workspace.getLeavesOfType("markdown")) {
		const view = leaf.view;
		if (view instanceof MarkdownView) {
			void view.previewMode?.rerender(true);
		}
	}
}

/** Rerender open markdown views that display or embed the changed file. */
export function rerenderViewsForFile(app: App, changedFile: TFile): void {
	const changedPath = changedFile.path;
	const pathsToRefresh = new Set<string>([changedPath]);

	for (const leaf of app.workspace.getLeavesOfType("markdown")) {
		const view = leaf.view;
		if (!(view instanceof MarkdownView) || !view.file) continue;
		const openPath = view.file.path;
		if (openPath === changedPath) {
			pathsToRefresh.add(openPath);
			continue;
		}
		const cache = app.metadataCache.getFileCache(view.file);
		const embeds = cache?.embeds ?? [];
		if (embeds.some((e) => e.link === changedPath || e.link.endsWith(`/${changedFile.name}`))) {
			pathsToRefresh.add(openPath);
		}
	}

	for (const leaf of app.workspace.getLeavesOfType("markdown")) {
		const view = leaf.view;
		if (!(view instanceof MarkdownView) || !view.file) continue;
		if (pathsToRefresh.has(view.file.path)) {
			void view.previewMode?.rerender(true);
		}
	}
}
