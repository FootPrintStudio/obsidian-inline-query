import { MarkdownView, Plugin } from "obsidian";
import { InlineQuerySettingTab } from "./settings";
import { processInlineQueriesInElement } from "./render";
import { DEFAULT_SETTINGS, type InlineQuerySettings } from "./types";

export default class InlineQueryPlugin extends Plugin {
	settings: InlineQuerySettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new InlineQuerySettingTab(this.app, this));

		this.registerMarkdownPostProcessor((element, ctx) => {
			processInlineQueriesInElement(this.app, element, ctx, this.settings);
		});

		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file?.path === file.path) {
					void view.previewMode?.rerender(true);
				}
			}),
		);
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<InlineQuerySettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...data };
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
