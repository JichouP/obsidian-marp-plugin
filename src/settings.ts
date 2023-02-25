export interface MarpPluginSettings {
  autoReload: boolean;
  createNewSplitTab: boolean;
  themeDir: string;
}

export const DEFAULT_SETTINGS: MarpPluginSettings = {
  autoReload: true,
  createNewSplitTab: true,
  themeDir: '',
};
