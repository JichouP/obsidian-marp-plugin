import {
  FileSystemAdapter,
  ItemView,
  normalizePath,
  WorkspaceLeaf,
} from 'obsidian';
import { exportSlide } from './export';
import { fileState } from './fileState';
import { marp } from './marp';
import { MarpPluginSettings } from './settings';

export const MARP_PREVIEW_VIEW_TYPE = 'marp-preview-view';

export class PreviewView extends ItemView {
  settings: MarpPluginSettings;
  constructor(leaf: WorkspaceLeaf, settings: MarpPluginSettings) {
    super(leaf);
    this.settings = settings;
  }

  getViewType(): string {
    return MARP_PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Marp Preview';
  }

  async renderPreview() {
    const file = fileState.getFile();
    if (!file) return;
    const content = await this.app.vault.cachedRead(file);
    const { html, css } = marp.render(content);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const container = this.containerEl.children[1];
    container.empty();
    container.appendChild(doc.body.children[0]);
    container.createEl('style', { text: css });
  }

  async onOpen() {
    const basePath = (
      this.app.vault.adapter as FileSystemAdapter
    ).getBasePath();
    const themeDir = normalizePath(`${basePath}/${this.settings.themeDir}`);

    this.addAction('download', 'Export as PDF', () => {
      exportSlide('pdf', basePath, themeDir);
    });
    this.addAction('image', 'Export as PPTX', () => {
      exportSlide('pptx', basePath, themeDir);
    });
    this.addAction('code-glyph', 'Export as HTML', () => {
      exportSlide('html', basePath, themeDir);
    });
    await this.renderPreview();
  }

  async onClose() {
    // Nothing to clean up.
  }

  onChange() {
    if (!this.settings.autoReload) return;
    this.renderPreview();
  }
}
