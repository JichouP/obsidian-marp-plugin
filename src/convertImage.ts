import { access, readFile } from 'fs/promises';
import { FileSystemAdapter, request } from 'obsidian';
import { join, normalize } from 'path';
import mimes from 'mime/lite';
import axios from 'axios';

const prefix = 'app://local';

async function readFileAsBase64(path: string): Promise<string | null> {
  const mime = mimes.getType(path);
  if (!mime) return null;

  try {
    return `data:${mime};base64,${await readFile(path, {
      encoding: 'base64',
    })}`;
  } catch {
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
  } catch {
    return null;
  }
}

export async function convertToBase64(path: string): Promise<string | null> {
  const mime = mimes.getType(path);
  if (!mime) return null;
  if (await app.vault.adapter.exists(path)) {
    const basePath = (
      this.app.vault.adapter as FileSystemAdapter
    ).getBasePath();
    return readFileAsBase64(normalize(join(basePath, path)));
  }

  try {
    await access(path);
    return readFileAsBase64(normalize(path));
  } catch {
    /* empty */
  }

  try {
    if (path.startsWith(prefix)) {
      // remove `app://local`
      const newPath = path.slice(prefix.length);
      await access(newPath);
      return readFileAsBase64(normalize(newPath));
    }
  } catch {
    /* empty */
  }

  // try to get image from web
  return urlToBase64(path);
}

async function urlToBase64(url: string): Promise<string | null> {
  try {
    return Buffer.from(
      await request(url),
      // (await axios.get(url, { responseType: 'arraybuffer' })).data,
      'binary',
    ).toString('base64');
  } catch {
    return null;
  }
}

function addMime(path: string): string | null {
  const mime = mimes.getType(path);
  if (!mime) return null;
}

// export async function embedImageToHtml(html: string): Promise<Document> {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, 'text/html');
//   const images = doc.getElementsByTagName('img');
//   for (let i = 0; i < images.length; i++) {
//     const el = images[i];
//     const src = el.getAttribute('src');
//     if (!src) continue;
//     const link = await convertToBase64(decodeURI(src));
//     if (!link) continue;
//     el.setAttribute('src', link);
//   }
//   const figures = doc.getElementsByTagName('figure');
//   const reg = /background-image:url\("([^)]+)"\)/;
//   for (let i = 0; i < figures.length; i++) {
//     const el = figures[i];
//     const style = el.getAttribute('style');
//     if (!style || !style.contains('background-image:url')) continue;
//     const result = style.match(reg);
//     const matched = result?.at(1);
//     if (!matched) continue;
//     const converted = await convertToBase64(decodeURI(matched));
//     if (!converted) continue;
//     const replaced = result?.input
//       ?.replace(matched, converted)
//       .replace(/\\/g, '/');
//     if (!replaced) continue;
//     el.setAttribute('style', replaced);
//   }
//   return doc;
// }

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
    const result = style.match(reg);
    const matched = result?.at(1);
    if (!matched) continue;
    const converted = await convertPathToLocalLink(decodeURI(matched));
    if (!converted) continue;
    const replaced = result?.input
      ?.replace(matched, converted)
      .replace(/\\/g, '/');
    if (!replaced) continue;
    el.setAttribute('style', replaced);
  }
  return doc;
}
