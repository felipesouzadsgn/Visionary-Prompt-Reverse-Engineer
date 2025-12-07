
export interface PromptAnalysis {
  subject: string;
  medium: string;
  lighting: string;
  camera: string;
  palette: string;
  vibe: string;
  techParams: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: number;
}

export interface SavedPrompt {
  id: string;
  userId: string;
  imageData: string; // Base64 thumbnail
  analysis: PromptAnalysis;
  fullPrompt: string;
  createdAt: number;
  isFavorite: boolean;
}

export interface SessionItem {
  id: string;
  timestamp: number;
  analysis: PromptAnalysis;
  fullPrompt: string;
  imagePreview: string;
}

export enum AppState {
  AUTH = 'AUTH',
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum ViewMode {
  CREATE = 'CREATE',
  LIBRARY = 'LIBRARY',
  PROFILE = 'PROFILE'
}
