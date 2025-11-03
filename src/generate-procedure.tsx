import React, { useState, useEffect } from "react";
import {
  List,
  ActionPanel,
  Action,
  Detail,
  showToast,
  Toast,
  getPreferenceValues,
  confirmAlert,
  Alert,
  Icon,
} from "@raycast/api";
import { getClipboardHistory, ClipboardItem } from "./utils/clipboard";
import { generateProcedure } from "./services/claude";
import { Note } from "./types/note";
import { createProcedure } from "./types/procedure";
import {
  getAllNotes,
  saveNote,
  updateNote,
  deleteNote,
} from "./utils/noteStorage";
import { saveProcedure } from "./utils/procedureStorage";
import NoteForm from "./components/NoteForm";
import ProcedureTitleForm, {
  GenerationConfig,
} from "./components/ProcedureTitleForm";

interface Preferences {
  anthropicApiKey: string;
  maxClipboardItems: string;
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([]);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [isEnteringTitle, setIsEnteringTitle] = useState(false);

  useEffect(() => {
    loadNotes();
    loadClipboardHistory();
  }, []);

  async function loadNotes() {
    setIsLoading(true);
    try {
      const loadedNotes = await getAllNotes();
      setNotes(loadedNotes);
      setSelectedNoteIds([]); // Reset selection when reloading
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load notes",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadClipboardHistory() {
    try {
      const preferences = getPreferenceValues<Preferences>();
      const maxItems = parseInt(preferences.maxClipboardItems || "50", 10);
      const history = await getClipboardHistory(maxItems);
      setClipboardHistory(history);
    } catch (error) {
      // Silently fail clipboard loading - it's only for the form picker
      console.error("Failed to load clipboard history:", error);
    }
  }

  function toggleSelection(noteId: string) {
    setSelectedNoteIds((prev) => {
      if (prev.includes(noteId)) {
        // Remove from array (auto-reorders remaining items)
        return prev.filter((id) => id !== noteId);
      } else {
        // Add to end of array
        return [...prev, noteId];
      }
    });
  }

  function selectAll() {
    const allNoteIds = notes.map((note) => note.id);
    setSelectedNoteIds(allNoteIds);
  }

  function deselectAll() {
    setSelectedNoteIds([]);
  }

  async function handleCreateNote() {
    setIsCreatingNote(true);
  }

  async function handleEditNote(note: Note) {
    setEditingNote(note);
  }

  async function handleDeleteNote(note: Note) {
    if (
      await confirmAlert({
        title: "Delete Note",
        message: "Are you sure you want to delete this note?",
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      try {
        await deleteNote(note.id);
        await showToast({
          style: Toast.Style.Success,
          title: "Note Deleted",
        });
        // Remove from selection if selected (auto-reorders remaining items)
        setSelectedNoteIds((prev) => prev.filter((id) => id !== note.id));
        await loadNotes();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete note",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  async function handleNoteFormSubmit(note: Note) {
    try {
      if (editingNote) {
        // Update existing note
        await updateNote(note);
        await showToast({
          style: Toast.Style.Success,
          title: "Note Updated",
        });
      } else {
        // Save new note
        await saveNote(note);
        await showToast({
          style: Toast.Style.Success,
          title: "Note Created",
        });
      }
      // Close form and refresh notes
      setIsCreatingNote(false);
      setEditingNote(undefined);
      await loadNotes();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: editingNote ? "Failed to update note" : "Failed to create note",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  function handleNoteFormCancel() {
    setIsCreatingNote(false);
    setEditingNote(undefined);
  }

  async function handleGenerate() {
    if (notes.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No notes available",
        message: "Please create some notes first",
      });
      return;
    }

    if (selectedNoteIds.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No notes selected",
        message: "Please select at least one note to generate procedure",
      });
      return;
    }

    // Show title input form
    setIsEnteringTitle(true);
  }

  async function handleGenerateWithTitle(config: GenerationConfig) {
    setIsEnteringTitle(false);
    setIsLoading(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Generating procedure...",
      message: `Analyzing ${selectedNoteIds.length} selected notes`,
    });

    // Get selected notes in the order they were selected
    const selectedNotes = selectedNoteIds
      .map((id) => notes.find((note) => note.id === id))
      .filter((note): note is Note => note !== undefined);

    // Convert notes to ClipboardItem format for API compatibility
    const clipboardItems: ClipboardItem[] = selectedNotes.map((note) => {
      if (note.clipboardReference) {
        // If note has clipboard reference, use that
        return {
          content: note.clipboardReference.content,
          type: note.clipboardReference.type,
          timestamp: note.clipboardReference.timestamp,
          tags: note.tags,
          intent: note.intent,
          context: note.context,
        };
      } else {
        // Otherwise, use note description as text content
        return {
          content: note.description,
          type: "text",
          timestamp: note.createdAt,
          tags: note.tags,
          intent: note.intent,
          context: note.context,
        };
      }
    });

    try {
      const preferences = getPreferenceValues<Preferences>();

      const markdown = await generateProcedure(
        clipboardItems,
        config.title,
        preferences.anthropicApiKey,
        config.customInstructions,
        config.language,
      );

      setGeneratedMarkdown(markdown);
      setShowResult(true);

      // Save the generated procedure to storage
      const allTags = Array.from(
        new Set(selectedNotes.flatMap((note) => note.tags || [])),
      );
      const procedure = createProcedure(
        markdown,
        Array.from(selectedNoteIds),
        allTags.length > 0 ? allTags : undefined,
        config.title,
      );
      await saveProcedure(procedure);

      toast.style = Toast.Style.Success;
      toast.title = "Procedure generated!";
      toast.message = "Saved to My Procedures";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to generate procedure";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    } finally {
      setIsLoading(false);
    }
  }

  function handleTitleFormCancel() {
    setIsEnteringTitle(false);
  }

  // Show ProcedureTitleForm for entering title before generation
  if (isEnteringTitle) {
    return (
      <ProcedureTitleForm
        onSubmit={handleGenerateWithTitle}
        onCancel={handleTitleFormCancel}
      />
    );
  }

  // Show NoteForm for creating or editing
  if (isCreatingNote || editingNote) {
    return (
      <NoteForm
        initialNote={editingNote}
        clipboardItems={clipboardHistory}
        onSubmit={handleNoteFormSubmit}
        onCancel={handleNoteFormCancel}
      />
    );
  }

  // Show generated procedure result
  if (showResult) {
    return (
      <Detail
        markdown={generatedMarkdown}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Markdown"
              content={generatedMarkdown}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            <Action.Paste
              title="Paste to Active App"
              content={generatedMarkdown}
              shortcut={{ modifiers: ["cmd"], key: "v" }}
            />
            <Action
              title="Back to Notes"
              onAction={() => {
                setShowResult(false);
                loadNotes();
              }}
              shortcut={{ modifiers: ["cmd"], key: "b" }}
            />
          </ActionPanel>
        }
      />
    );
  }

  // Main notes list view
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search notes..."
      actions={
        <ActionPanel>
          <Action
            title="Add Note"
            icon={Icon.Plus}
            onAction={handleCreateNote}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
          />
        </ActionPanel>
      }
    >
      <List.Section
        title="Workflow Steps"
        subtitle={`${selectedNoteIds.length} of ${notes.length} selected • Press ⌘G to Generate Procedure`}
      >
        {selectedNoteIds.length > 0 && (
          <List.Item
            key="generate-action-button"
            icon={Icon.Wand}
            title="⚡ Generate Procedure from Selected Notes"
            accessories={[
              {
                tag: {
                  value: `${selectedNoteIds.length} selected`,
                  color: "#00D647",
                },
              },
              {
                text: "Press ⌘G or Enter",
              },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Generate Procedure"
                  icon={Icon.Wand}
                  onAction={handleGenerate}
                />
              </ActionPanel>
            }
          />
        )}
        {notes.map((note) => {
          const isSelected = selectedNoteIds.includes(note.id);
          const selectionOrder = isSelected
            ? selectedNoteIds.indexOf(note.id) + 1
            : undefined;
          const accessories: List.Item.Accessory[] = [];

          // Add selection order badge (if selected)
          if (selectionOrder) {
            accessories.push({
              tag: { value: `${selectionOrder}`, color: "#007AFF" },
              tooltip: `Selected #${selectionOrder}`,
            });
          }

          // Add selection checkbox
          accessories.push({
            icon: isSelected ? "☑️" : "☐",
            tooltip: isSelected ? "Selected" : "Not selected",
          });

          // Add clipboard reference indicator
          if (note.clipboardReference) {
            accessories.push({
              icon: "📎",
              tooltip: truncate(note.clipboardReference.content, 200),
            });
          }

          // Add intent indicator
          if (note.intent) {
            accessories.push({
              icon: "💬",
              tooltip: `Intent: ${note.intent}`,
            });
          }

          // Add tags
          if (note.tags && note.tags.length > 0) {
            accessories.push({
              tag: { value: note.tags.join(", ") },
            });
          }

          return (
            <List.Item
              key={note.id}
              title={note.description}
              subtitle={formatDate(note.createdAt)}
              accessories={accessories}
              actions={
                <ActionPanel>
                  <Action
                    title={isSelected ? "Deselect Note" : "Select Note"}
                    icon={isSelected ? Icon.CheckCircle : Icon.Circle}
                    onAction={() => toggleSelection(note.id)}
                    shortcut={{ modifiers: ["cmd"], key: "s" }}
                  />
                  <Action
                    title="Generate Procedure"
                    icon={Icon.Wand}
                    onAction={handleGenerate}
                    shortcut={{ modifiers: ["cmd"], key: "g" }}
                  />
                  <Action
                    title="Add Note"
                    icon={Icon.Plus}
                    onAction={handleCreateNote}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                  />
                  <Action
                    title="Edit Note"
                    icon={Icon.Pencil}
                    onAction={() => handleEditNote(note)}
                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                  />
                  <Action
                    title="Delete Note"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => handleDeleteNote(note)}
                    shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                  />
                  <Action
                    title="Select All"
                    icon={Icon.CheckCircle}
                    onAction={selectAll}
                    shortcut={{ modifiers: ["cmd"], key: "a" }}
                  />
                  <Action
                    title="Deselect All"
                    icon={Icon.XMarkCircle}
                    onAction={deselectAll}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
                  />
                  <Action
                    title="Refresh Notes"
                    icon={Icon.ArrowClockwise}
                    onAction={loadNotes}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
      {notes.length === 0 && (
        <List.EmptyView
          title="No workflow steps yet"
          description="Click 'Add Note' in the actions menu to capture your first step"
          icon={Icon.Document}
        />
      )}
    </List>
  );
}

/**
 * Format date for display (e.g., "2h ago", "3d ago")
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Truncate text to a maximum length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
