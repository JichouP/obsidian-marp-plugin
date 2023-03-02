export interface MarpPluginSettings {
  autoReload: boolean;
  createNewSplitTab: boolean;
  themeDir: string;
  fragmentedList: boolean;
}

export const MARP_DEFAULT_SETTINGS: MarpPluginSettings = {
  autoReload: true,
  createNewSplitTab: true,
  themeDir: 'MarpTheme',
  fragmentedList: false,
};
