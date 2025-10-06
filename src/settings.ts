export interface MarpPluginSettings {
  autoReload: boolean;
  createNewSplitTab: boolean;
  themeDir: string;
  exportDir: string;
}

export const MARP_DEFAULT_SETTINGS: MarpPluginSettings = {
  autoReload: true,
  createNewSplitTab: true,
  themeDir: 'MarpTheme',
  exportDir: ''
};
