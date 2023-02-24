import { Notice, Plugin, TAbstractFile } from 'obsidian';
import { fileState } from './fileState';
import { DEFAULT_SETTINGS, ObsidianMarpPluginSettings } from './marpSettings';
import { MARP_PREVIEW_VIEW_TYPE, PreviewView } from './preview';

export default class MarpPlugin extends Plugin {
  settings: ObsidianMarpPluginSettings;
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon('presentation', 'Marp', _ => {
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
      id: 'marp-open-preview',
      name: 'Marp: Open Preview',
      editorCallback(_editor, ctx) {
        const file = ctx.file;
        if (!file) return;
        fileState.setFile(file);
        that.activateView();
      },
    });
    this.registerView(MARP_PREVIEW_VIEW_TYPE, leaf => new PreviewView(leaf));
    this.registerEvent(this.app.vault.on('modify', this.onChange.bind(this)));
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
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
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
