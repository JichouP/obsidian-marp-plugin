import { Marp } from '@marp-team/marp-core';
import { ItemView, WorkspaceLeaf } from 'obsidian';

export const MARP_PREVIEW_VIEW_TYPE = 'marp-preview-view';

export class PreviewView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return MARP_PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Marp Preview';
  }

  async onOpen() {
    const marp = new Marp();
    const { html, css } = marp.render(`# Hello, marp-core!
---
## test1
---
## test2`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const container = this.containerEl.children[1];
    container.empty();
    container.appendChild(doc.children[0].children[1].children[0]);
    container.createEl('style', { text: css });
  }

  async onClose() {
    // Nothing to clean up.
  }
}
