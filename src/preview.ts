import {
  FileSystemAdapter,
  ItemView,
  TFile,
  ViewStateResult,
  WorkspaceLeaf,
} from 'obsidian';
import { convertHtml } from './convertImage';
import { exportSlide } from './export';
import { marp } from './marp';
import { MarpPluginSettings } from './settings';
import { join } from 'path';

export const MARP_PREVIEW_VIEW_TYPE = 'marp-preview-view';

interface PreviewViewState {
  file: TFile | null;
}

export class PreviewView extends ItemView implements PreviewViewState {
  file: TFile | null;
  settings: MarpPluginSettings;
  constructor(leaf: WorkspaceLeaf, settings: MarpPluginSettings) {
    super(leaf);
    this.file = null;
    this.settings = settings;
  }

  getViewType(): string {
    return MARP_PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Marp Preview';
  }

  async renderPreview() {
    if (!this.file) return;
    const content = await this.app.vault.cachedRead(this.file);
    const { html, css } = marp.render(content);
    const doc = await convertHtml(html);
    const container = this.containerEl.children[1];
    container.empty();
    container.appendChild(doc.body.children[0]);
    container.createEl('style', { text: css });
  }

  addActions() {
    const basePath = (
      this.app.vault.adapter as FileSystemAdapter
    ).getBasePath();
    const themeDir = join(basePath, this.settings.themeDir);
    this.addAction('download', 'Export as PDF', () => {
      if (this.file) {
        exportSlide(
          this.file,
          'pdf',
          basePath,
          themeDir,
          this.settings.fragmentedList,
        );
      }
    });
    this.addAction('image', 'Export as PPTX', () => {
      if (this.file) {
        exportSlide(
          this.file,
          'pptx',
          basePath,
          themeDir,
          this.settings.fragmentedList,
        );
      }
    });
    this.addAction('code-glyph', 'Export as HTML', () => {
      if (this.file) {
        exportSlide(
          this.file,
          'html',
          basePath,
          themeDir,
          this.settings.fragmentedList,
        );
      }
    });
  }

  async onOpen() {
    this.registerEvent(this.app.vault.on('modify', this.onChange.bind(this)));
    this.addActions();
  }

  async onClose() {
    // Nothing to clean up.
  }

  onChange() {
    if (!this.settings.autoReload) return;
    this.renderPreview();
  }

  async setState(state: PreviewViewState, result: ViewStateResult) {
    if (state.file) {
      this.file = state.file;
    }
    await this.renderPreview();
    return super.setState(state, result);
  }

  getState(): PreviewViewState {
    return {
      file: this.file,
    };
  }
}
