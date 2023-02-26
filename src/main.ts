import {
  FileSystemAdapter,
  normalizePath,
  Notice,
  Plugin,
  TAbstractFile,
} from 'obsidian';
import { fileState } from './fileState';
import { MARP_DEFAULT_SETTINGS, MarpPluginSettings } from './settings';
import { MARP_PREVIEW_VIEW_TYPE, PreviewView } from './preview';
import { MarpSettingTab } from './settingTab';
import { readdir, readFile } from 'fs/promises';
import { marp } from './marp';

export default class MarpPlugin extends Plugin {
  settings: MarpPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addRibbonIcon('presentation', 'Marp: Open Preview', _ => {
      const file = this.app.workspace.activeEditor?.file;
      if (!file)
        return new Notice(
          'Please select the tab for the file you want to view in Marp , and then click this button again.',
          10000,
        );
      fileState.setFile(file);
      this.activateView();
    });
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.addCommand({
      id: 'open-preview',
      name: 'Open Preview',
      editorCallback(_editor, ctx) {
        const file = ctx.file;
        if (!file) return;
        fileState.setFile(file);
        that.activateView();
      },
    });
    this.registerView(
      MARP_PREVIEW_VIEW_TYPE,
      leaf => new PreviewView(leaf, this.settings),
    );
    this.registerEvent(this.app.vault.on('modify', this.onChange.bind(this)));
    this.addSettingTab(new MarpSettingTab(this.app, this));

    // load marp themes
    {
      const basePath = (
        this.app.vault.adapter as FileSystemAdapter
      ).getBasePath();
      const { themeDir } = this.settings;
      const isCss = (filename: string) => filename.split('.').at(-1) === 'css';

      if (themeDir) {
        const themePaths = (
          await readdir(normalizePath(`${basePath}/${themeDir}`), {
            withFileTypes: true,
          })
        )
          .filter(f => f.isFile() && isCss(f.name))
          .map(v => normalizePath(`${basePath}/${themeDir}/${v.name}`));

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

  async activateView() {
    this.app.workspace.detachLeavesOfType(MARP_PREVIEW_VIEW_TYPE);

    if (this.settings.createNewSplitTab) {
      // create a preview on a new split tab
      this.app.workspace.getLeaf('split').setViewState({
        type: MARP_PREVIEW_VIEW_TYPE,
        active: true,
      });
    } else {
      // do not create new split tab, just a new tab
      this.app.workspace.getLeaf('tab').setViewState({
        type: MARP_PREVIEW_VIEW_TYPE,
        active: true,
      });
    }
  }

  async loadSettings() {
    this.settings = { ...MARP_DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onChange(file: TAbstractFile) {
    if (!this.settings.autoReload) {
      return;
    }

    const previewView = this.getPreviewView();

    if (!previewView) {
      return;
    }

    if (file === this.app.workspace.getActiveFile()) {
      previewView.onChange();
    }
  }

  getPreviewView(): PreviewView | null {
    const leaf = this.app.workspace
      .getLeavesOfType(MARP_PREVIEW_VIEW_TYPE)
      .filter(v => v.view instanceof PreviewView)[0];

    if (!leaf) return null;
    return leaf.view as PreviewView;
  }
}
