import { TFile } from 'obsidian';

class FileState {
  #file?: TFile;
  constructor(currentFile?: TFile) {
    this.#file = currentFile;
  }
  setFile(file: TFile) {
    this.#file = file;
  }
  getFile() {
    return this.#file;
  }
}

export const fileState = new FileState();
