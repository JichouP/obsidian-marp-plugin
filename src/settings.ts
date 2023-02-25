export interface MarpPluginSettings {
  autoReload: boolean;
  createNewSplitTab: boolean;
  themeDir: string;
}

export const MARP_DEFAULT_SETTINGS: MarpPluginSettings = {
  autoReload: true,
  createNewSplitTab: true,
  themeDir: '',
};
