import { App, PluginSettingTab, Setting } from "obsidian";
import type InlineQueryPlugin from "./main";
import { DEFAULT_SETTINGS } from "./types";

export class InlineQuerySettingTab extends PluginSettingTab {
	plugin: InlineQueryPlugin;

	constructor(app: App, plugin: InlineQueryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Inline Query" });

		new Setting(containerEl)
			.setName("Inline prefix")
			.setDesc('Prefix inside inline code, e.g. "q=" for `q= this.title`.')
			.addText((text) =>
				text.setValue(this.plugin.settings.inlinePrefix).onChange(async (value) => {
					this.plugin.settings.inlinePrefix = value.trim() || DEFAULT_SETTINGS.inlinePrefix;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Enable in Reading view")
			.setDesc("Evaluate inline queries when notes render in Reading view.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableInReadingView).onChange(async (value) => {
					this.plugin.settings.enableInReadingView = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
