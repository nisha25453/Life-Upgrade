const STORAGE_KEY = "life-upgrade-ai-state";
export const loadState = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; } };
export const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
export const clearState = () => localStorage.removeItem(STORAGE_KEY);