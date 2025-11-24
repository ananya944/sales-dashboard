import { isBrowser } from "@/lib/utils";

export interface ProspectNote {
  id: string;
  prospectId: string;
  content: string;
  author: string;
  createdAt: string;
}

type NotesStore = Record<string, ProspectNote[]>;

const STORAGE_KEY = "financeos_prospect_notes";

const safeParse = (value: string | null): NotesStore => {
  if (!value) return {};
  try {
    return JSON.parse(value) as NotesStore;
  } catch (error) {
    console.warn("Unable to parse stored prospect notes", error);
    return {};
  }
};

const readStore = (): NotesStore => {
  if (!isBrowser()) return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

const writeStore = (store: NotesStore) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getProspectNotes = (prospectId: string): ProspectNote[] => {
  const store = readStore();
  return store[prospectId] ?? [];
};

export const addProspectNote = (params: { prospectId: string; content: string; author: string }): ProspectNote => {
  const store = readStore();
  const note: ProspectNote = {
    id: generateId(),
    prospectId: params.prospectId,
    content: params.content,
    author: params.author,
    createdAt: new Date().toISOString(),
  };

  store[params.prospectId] = [note, ...(store[params.prospectId] ?? [])];
  writeStore(store);
  return note;
};

