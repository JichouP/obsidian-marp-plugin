import { FileSystemAdapter, Notice, Plugin, TFile } from 'obsidian';
import { MARP_DEFAULT_SETTINGS, MarpPluginSettings } from './settings';
import { MARP_PREVIEW_VIEW_TYPE, PreviewView } from './preview';
import { MarpSettingTab } from './settingTab';
import { readdir, readFile } from 'fs/promises';
import { marp } from './marp';
import { existsSync } from 'fs';
import { join, normalize } from 'path';

export default class MarpPlugin extends Plugin {
  settings: MarpPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addRibbonIcon('presentation', 'Marp: Open Preview', async _ => {
      const file = this.app.workspace.activeEditor?.file;
      if (!file)
        return new Notice(
          'Please select the tab for the file you want to view in Marp , and then click this button again.',
          10000,
        );
      await this.activateView(file);
    });
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.addCommand({
      id: 'open-preview',
      name: 'Open Preview',
      async editorCallback(_editor, ctx) {
        const file = ctx.file;
        if (!file) return;
        await that.activateView(file);
      },
    });
    this.registerView(
      MARP_PREVIEW_VIEW_TYPE,
      leaf => new PreviewView(leaf, this.settings),
    );
    this.addSettingTab(new MarpSettingTab(this.app, this));

    // load marp themes
    {
      const basePath = (
        this.app.vault.adapter as FileSystemAdapter
      ).getBasePath();
      const { themeDir } = this.settings;
      const isCss = (filename: string) => filename.split('.').at(-1) === 'css';

      if (themeDir && existsSync(join(basePath, themeDir))) {
        const themePaths = (
          await readdir(normalize(join(basePath, themeDir)), {
            withFileTypes: true,
          })
        )
          .filter(f => f.isFile() && isCss(f.name))
          .map(v => normalize(join(basePath, themeDir, v.name)));

        const cssContents = await Promise.all(
          themePaths.map(path => readFile(path, { encoding: 'utf-8' })),
        );

        cssContents.forEach(css => marp.themeSet.add(css));
      }
    }
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(MARP_PREVIEW_VIEW_TYPE);
  }

  async activateView(file: TFile) {
    this.app.workspace.detachLeavesOfType(MARP_PREVIEW_VIEW_TYPE);

    if (this.settings.createNewSplitTab) {
      // create a preview on a new split tab
      const leaf = this.app.workspace.getLeaf('split');
      await leaf.setViewState({
        type: MARP_PREVIEW_VIEW_TYPE,
        active: true,
        state: { file },
      });
    } else {
      // do not create new split tab, just a new tab
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.setViewState({
        type: MARP_PREVIEW_VIEW_TYPE,
        active: true,
        state: { file },
      });
    }
  }

  async loadSettings() {
    this.settings = { ...MARP_DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
