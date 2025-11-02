import { LocalStorage } from "@raycast/api";
import { Note } from "../types/note";

/**
 * Storage key for notes in LocalStorage
 */
const NOTES_STORAGE_KEY = "trayce_notes";

/**
 * Save a new note to LocalStorage
 * @param note - The note to save
 */
export async function saveNote(note: Note): Promise<void> {
  const notes = await getAllNotes();
  notes.push(note);
  await LocalStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

/**
 * Update an existing note in LocalStorage
 * @param note - The note with updated data (matched by id)
 */
export async function updateNote(note: Note): Promise<void> {
  const notes = await getAllNotes();
  const index = notes.findIndex((n) => n.id === note.id);

  if (index === -1) {
    throw new Error(`Note with id ${note.id} not found`);
  }

  notes[index] = note;
  await LocalStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

/**
 * Delete a note from LocalStorage
 * @param noteId - The ID of the note to delete
 */
export async function deleteNote(noteId: string): Promise<void> {
  const notes = await getAllNotes();
  const filtered = notes.filter((n) => n.id !== noteId);
  await LocalStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get all notes from LocalStorage
 * @returns Array of all saved notes, sorted by createdAt (newest first)
 */
export async function getAllNotes(): Promise<Note[]> {
  const data = await LocalStorage.getItem<string>(NOTES_STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const notes = JSON.parse(data) as Note[];
    // Sort by createdAt descending (newest first)
    return notes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Failed to parse notes from storage:", error);
    return [];
  }
}

/**
 * Get a single note by ID
 * @param noteId - The ID of the note to retrieve
 * @returns The note if found, undefined otherwise
 */
export async function getNoteById(noteId: string): Promise<Note | undefined> {
  const notes = await getAllNotes();
  return notes.find((n) => n.id === noteId);
}

/**
 * Clear all notes from LocalStorage
 * WARNING: This permanently deletes all notes
 */
export async function clearAllNotes(): Promise<void> {
  await LocalStorage.removeItem(NOTES_STORAGE_KEY);
}
