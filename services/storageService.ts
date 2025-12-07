
import { SavedPrompt, User, PromptAnalysis } from "../types";

const KEYS = {
  USER: 'visionary_user',
  PROMPTS: 'visionary_prompts',
};

// --- User Management ---
export const loginUser = (name: string): User => {
  const existing = localStorage.getItem(KEYS.USER);
  if (existing) return JSON.parse(existing);

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    joinedAt: Date.now(),
  };
  localStorage.setItem(KEYS.USER, JSON.stringify(newUser));
  return newUser;
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.USER);
};

// --- Prompt Management ---
export const savePrompt = (analysis: PromptAnalysis, fullPrompt: string, imageData: string): SavedPrompt => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not logged in");

  const newPrompt: SavedPrompt = {
    id: crypto.randomUUID(),
    userId: user.id,
    imageData, // Store simplified base64 or link
    analysis,
    fullPrompt,
    createdAt: Date.now(),
    isFavorite: false,
  };

  const prompts = getPrompts();
  prompts.unshift(newPrompt); // Add to top
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(prompts));
  return newPrompt;
};

export const getPrompts = (): SavedPrompt[] => {
  const data = localStorage.getItem(KEYS.PROMPTS);
  const allPrompts: SavedPrompt[] = data ? JSON.parse(data) : [];
  const user = getCurrentUser();
  // Filter by user ID
  return user ? allPrompts.filter(p => p.userId === user.id) : [];
};

export const toggleFavorite = (promptId: string): SavedPrompt[] => {
  const prompts = getPrompts();
  const updated = prompts.map(p => 
    p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p
  );
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(updated));
  return updated;
};

export const deletePrompt = (promptId: string): SavedPrompt[] => {
  const prompts = getPrompts();
  const updated = prompts.filter(p => p.id !== promptId);
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(updated));
  return updated;
};
