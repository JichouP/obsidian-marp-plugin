import { exec } from 'child_process';
import {
  FileSystemAdapter,
  ItemView,
  normalizePath,
  Notice,
  WorkspaceLeaf,
} from 'obsidian';
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

  async exportSlide(ext: 'html' | 'pdf' | 'pptx') {
    const basePath = (
      this.app.vault.adapter as FileSystemAdapter
    ).getBasePath();
    const exportDir = normalizePath(`${process.env.USERPROFILE}/Downloads`);
    const file = fileState.getFile();
    if (!file) return;
    const filePath = normalizePath(`${basePath}/${file.path}`);
    const themeDir = normalizePath(`${basePath}/${this.settings.themeDir}`);
    const cmd = `npx -y @marp-team/marp-cli@latest --stdin false --theme-set "${themeDir}" -o "${exportDir}/${file.basename}.${ext}" -- "${filePath}"`;

    new Notice(`Exporting "${file.basename}.${ext}" to "${exportDir}"`, 20000);
    exec(cmd, () => {
      new Notice('Exported successfully', 20000);
    });
  }

  async onOpen() {
    this.addAction('file', 'Export as PDF', () => {
      this.exportSlide('pdf');
    });
    this.addAction('image-glyph', 'Export as PPTX', () => {
      this.exportSlide('pptx');
    });
    this.addAction('code-glyph', 'Export as HTML', () => {
      this.exportSlide('html');
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
