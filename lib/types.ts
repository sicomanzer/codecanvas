export type FileKind = "html" | "css" | "js" | "json" | "markdown" | "text";

export interface ProjectFile {
  id: string;
  name: string;
  kind: FileKind;
  content: string;
}

export interface Project {
  name: string;
  entryId: string;
  files: ProjectFile[];
}

export interface SavedProject {
  id: string;
  name: string;
  project: Project;
  updatedAt: number;
}

export type ThemePreference = "light" | "dark" | "system";
export type PreviewDevice = "desktop" | "tablet" | "mobile";

export interface PlaygroundSettings {
  theme: ThemePreference;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoRun: boolean;
  showConsole: boolean;
  previewDevice: PreviewDevice;
  split: number;
}

export interface ConsoleEntry {
  id: number;
  level: "log" | "info" | "warn" | "error" | "debug";
  args: string[];
  time: number;
}

export interface SessionShape {
  project: Project;
  activeFileId: string;
}

export const DEFAULT_SETTINGS: PlaygroundSettings = {
  theme: "dark",
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  autoRun: true,
  showConsole: true,
  previewDevice: "desktop",
  split: 50,
};
