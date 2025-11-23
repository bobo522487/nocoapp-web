
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
