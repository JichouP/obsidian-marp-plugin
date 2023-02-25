import { exec } from 'child_process';
import { normalizePath, Notice } from 'obsidian';
import { fileState } from './fileState';

export async function exportSlide(
  ext: 'html' | 'pdf' | 'pptx',
  basePath: string,
  themeDir: string,
) {
  const exportDir = normalizePath(`${process.env.USERPROFILE}/Downloads`);
  const file = fileState.getFile();
  if (!file) return;
  const filePath = normalizePath(`${basePath}/${file.path}`);
  const cmd = `npx -y @marp-team/marp-cli@latest --stdin false --theme-set "${themeDir}" -o "${exportDir}/${file.basename}.${ext}" -- "${filePath}"`;

  new Notice(`Exporting "${file.basename}.${ext}" to "${exportDir}"`, 20000);
  exec(cmd, () => {
    new Notice('Exported successfully', 20000);
  });
}
