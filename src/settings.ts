export interface MarpPluginSettings {
  autoReload: boolean;
  createNewSplitTab: boolean;
}

export const DEFAULT_SETTINGS: MarpPluginSettings = {
  autoReload: true,
  createNewSplitTab: true,
};
