import { App, PluginSettingTab, Setting } from 'obsidian';
import MarpPlugin from './main';

export class MarpSettingTab extends PluginSettingTab {
  plugin: MarpPlugin;

  constructor(app: App, plugin: MarpPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for Marp Plugin.' });

    new Setting(containerEl)
      .setName('Enable Auto Reload')
      .setDesc(
        'Enable the auto-reload feature that automatically reloads the preview on save.',
      )
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.autoReload).onChange(async v => {
          this.plugin.settings.autoReload = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Enable Open Preview in Split Tab')
      .setDesc(
        'Enables the ability to open previews in split tabs. When turned off, a new tab is created in the same split as the markdown file.',
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.createNewSplitTab)
          .onChange(async v => {
            this.plugin.settings.createNewSplitTab = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Theme Folder Location')
      .setDesc(
        'Specify the relative path of the directory where the theme is saved. By saving the css files in the specified directory, Marp can use a custom theme.',
      )
      .addText(text =>
        text
          .setPlaceholder('MarpTheme')
          .setValue(this.plugin.settings.themeDir)
          .onChange(async v => {
            this.plugin.settings.themeDir = v;
            await this.plugin.saveSettings();
          }),
      );
  }
}
