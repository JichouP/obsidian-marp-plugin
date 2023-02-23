import { Plugin } from 'obsidian';
import { MARP_PREVIEW_VIEW_TYPE, PreviewView } from './preview';

export default class MarpPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('presentation', 'Marp', _ => {
      this.activateView();
      // const filepath = this.app.workspace.activeEditor?.file?.path;
    });
    this.addCommand({
      id: 'marp-open-preview',
      name: 'Marp: Open Preview',
      editorCallback(_editor, _ctx) {
        this.activateView();
        // const filepath = ctx.file?.path;
      },
    });
    this.registerView(MARP_PREVIEW_VIEW_TYPE, leaf => new PreviewView(leaf));
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(MARP_PREVIEW_VIEW_TYPE);
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(MARP_PREVIEW_VIEW_TYPE);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: MARP_PREVIEW_VIEW_TYPE,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(MARP_PREVIEW_VIEW_TYPE)[0],
    );
  }
}
