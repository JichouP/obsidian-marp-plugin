import { Marp } from '@marp-team/marp-core';

export const marp = new Marp();

marp.themeSet.add(`
/* @theme example */

section {
  width: 1280px;
  height: 960px;
  font-size: 40px;
  padding: 40px;
}

h1 {
  font-size: 60px;
  color: #09c;
}

h2 {
  font-size: 50px;
}`);

export const marpThemeSet = marp.themeSet.default;
