import { access, readFile } from 'fs/promises';
import { FileSystemAdapter } from 'obsidian';
import { normalize } from 'path';

import mimes from 'mime/lite';

const prefix = 'app://local';

async function readFileAsBase64(path: string): Promise<string | null> {
  const mime = mimes.getType(path);
  if (!mime) return null;

  try {
    return `data:${mime};base64,${await readFile(path, {
      encoding: 'base64',
    })}`;
  } catch (e) {
    return null;
  }
}

async function convertPathToLocalLink(path: string): Promise<string | null> {
  if (await app.vault.adapter.exists(path)) {
    return app.vault.adapter.getResourcePath(path);
  }

  try {
    await access(path);
    return `${prefix}/${normalize(path)}`;
  } catch (e) {
    return null;
  }
}

async function convertToBase64(path: string): Promise<string | null> {
  if (await app.vault.adapter.exists(path)) {
    const basePath = (
      this.app.vault.adapter as FileSystemAdapter
    ).getBasePath();
    return readFileAsBase64(normalize(`${basePath}/${path}`));
  }

  try {
    await access(path);
    return readFileAsBase64(normalize(path));
  } catch (e) {
    try {
      if (path.startsWith(prefix)) {
        // remove `app://local`
        const newPath = path.slice(prefix.length);
        await access(newPath);
        return readFileAsBase64(normalize(newPath));
      }
    } catch (e) {
      return null;
    }
    return null;
  }
}

export async function embedImageToHtml(html: string): Promise<Document> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const el = images[i];
    const src = el.getAttribute('src');
    if (!src) continue;
    const link = await convertToBase64(decodeURI(src));
    if (!link) continue;
    el.setAttribute('src', link);
  }
  return doc;
}

export async function convertHtml(html: string): Promise<Document> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const el = images[i];
    const src = el.getAttribute('src');
    if (!src) continue;
    const link = await convertPathToLocalLink(decodeURI(src));
    if (!link) continue;
    el.setAttribute('src', link.replace(/\\/g, '/'));
  }
  const figures = doc.getElementsByTagName('figure');
  const reg = /background-image:url\("([^)]+)"\)/;
  for (let i = 0; i < figures.length; i++) {
    const el = figures[i];
    const style = el.getAttribute('style');
    if (!style || !style.contains('background-image:url')) continue;
    const decoded = decodeURI(style);
    const result = decoded.match(reg);
    const matched = result?.at(1);
    if (!matched) continue;
    const converted = await convertPathToLocalLink(matched);
    if (!converted) continue;
    const replaced = result?.[0]
      .replace(matched, converted)
      .replace(/\\/g, '/');
    console.log(replaced);
    if (!replaced) continue;
    el.setAttribute('style', replaced);
  }
  return doc;
}
