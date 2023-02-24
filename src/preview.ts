import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import { fileState } from './fileState';
import { marp } from './marp';

export const MARP_PREVIEW_VIEW_TYPE = 'marp-preview-view';

export class PreviewView extends ItemView {
  file: TFile;
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.file = leaf.getViewState().state.file;
  }

  getViewType(): string {
    return MARP_PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Marp Preview';
  }

  async onOpen() {
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

  async onClose() {
    // Nothing to clean up.
  }

  onChange() {
    this.onOpen();
  }
}
