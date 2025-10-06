import { exec } from 'child_process';
import { access, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { Notice, TFile, App } from 'obsidian';
import { convertToBase64 } from './convertImage';
import { join, normalize } from 'path';
import fixPath from 'fix-path';
import { getEngine } from './engine';

const imgPathReg = /!\[[^\]]*\]\(([^)]+)\)/g;

export async function exportSlide(
  file: TFile,
  ext: 'html' | 'pdf' | 'pptx',
  basePath: string,
  themeDir: string,
  app: App,
  customExportDir?: string, // Add this parameter
) {
  // Use custom export directory relative to vault if provided, otherwise use Downloads
  const exportDir = customExportDir && customExportDir.trim() !== '' 
    ? normalize(join(basePath, customExportDir)) // Make it relative to vault
    : join(
        process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']!,
        'Downloads',
      );
  if (!file) return;
  const filePath = normalize(join(basePath, file.path));
  const tmpPath = join(exportDir, `${file.basename}.tmp`);
  const tmpEnginePath = join(exportDir, 'engine.js');

  let fileContent = await readFile(filePath, 'utf-8');

  const srcBase64TupleList = await Promise.all(
    [...new Set([...fileContent.matchAll(imgPathReg)].map(v => v[1]))].map(
      async v => [v, await convertToBase64(v, app)] as const,
      ),
  );

  for (const [src, base64] of srcBase64TupleList) {
    fileContent = fileContent.replace(
      new RegExp(
        String.raw`(!\[[^\]]*\])\(${src.replace(/\\/g, '\\\\')}\)`,
        'g',
      ),
      `$1(${base64})`,
    );
  }

  await mkdir(exportDir, { recursive: true });
  try {
    await writeFile(tmpPath, fileContent);
    await writeFile(tmpEnginePath, getEngine());
  } catch (e) {
    console.error(e);
  }

  let cmd: string;
  try {
    await access(themeDir);
    cmd = `npx -y @marp-team/marp-cli@latest --bespoke.transition --stdin false --allow-local-files --theme-set "${themeDir}" -o "${join(
      exportDir,
      file.basename,
    )}.${ext}" --engine ${tmpEnginePath} -- "${tmpPath}"`;
  } catch (e) {
    cmd = `npx -y @marp-team/marp-cli@latest --stdin false --allow-local-files --bespoke.transition -o "${join(
      exportDir,
      file.basename,
    )}.${ext}" --engine ${tmpEnginePath} -- "${tmpPath}"`;
  }

  fixPath();
  new Notice(`Exporting "${file.basename}.${ext}" to "${exportDir}"`, 20000);
  exec(cmd, () => {
    new Notice('Exported successfully', 20000);
    rm(tmpPath);
    rm(tmpEnginePath);
  });
}
