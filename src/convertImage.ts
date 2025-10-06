import { access, readFile } from 'fs/promises';
import { FileSystemAdapter, requestUrl, App } from 'obsidian';
import { join, normalize } from 'path';
import mime from 'mime'

const prefix = 'app://local';

async function readFileAsBase64(path: string): Promise<string | null> {
  try {
    return addMimeToBase64Data(
      path,
      await readFile(path, {
        encoding: 'base64',
      }),
    );
  } catch {
    return null;
  }
}

async function convertPathToLocalLink(path: string, app: App): Promise<string | null> {
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

export async function convertToBase64(path: string, app: App): Promise<string | null> {
  const mimeType = mime.getType(path);
  if (!mime) return null;
  if (await app.vault.adapter.exists(path)) {
    const basePath = (
      app.vault.adapter as FileSystemAdapter
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

export async function convertHtml(html: string, app: App): Promise<Document> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const el = images[i];
    const src = el.getAttribute('src');
    if (!src) continue;
    const link = await convertPathToLocalLink(decodeURI(src), app);
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
    const converted = await convertPathToLocalLink(decodeURI(matched), app);
    if (!converted) continue;
    const replaced = result?.input
      ?.replace(matched, converted)
      .replace(/\\/g, '/');
    if (!replaced) continue;
    el.setAttribute('style', replaced);
  }
  return doc;
}

async function urlToBase64(url: string): Promise<string | null> {
  try {
    return addMimeToBase64Data(
      url,
      Buffer.from(await requestUrl(url).arrayBuffer).toString('base64'),
    );
  } catch {
    return null;
  }
}

function addMimeToBase64Data(path: string, data: string): string | null {
  const mimeType = mime.getType(path);
  if (!mime) return null;
  return `data:${mime};base64,${data}`;
}