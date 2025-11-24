export enum FileType {
  FILE = 'FILE',
  FOLDER = 'FOLDER'
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  isOpen?: boolean; // For folders
  children?: FileSystemNode[];
  language?: string;
}

export enum ViewMode {
  HOME = 'HOME',
  APPS = 'APPS',
  DATA = 'DATA',
  SETTINGS = 'SETTINGS'
}

export interface Tab {
  id: string;
  fileId: string;
  title: string;
  isDirty?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Page {
  id: string;
  name: string;
  icon: string; // Icon name string
  isHome: boolean;
  isHidden: boolean;
  isDisabled: boolean;
  height: string;
}

export interface DbTable {
  id: string;
  name: string;
  description?: string;
}

export interface GridItemData {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  type: string;
  title?: string;
  content?: any;
}