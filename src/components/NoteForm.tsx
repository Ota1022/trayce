import { Form, ActionPanel, Action } from "@raycast/api";
import React, { useState } from "react";
import { Note, ClipboardReference, createNote } from "../types/note";
import { ClipboardItem } from "../utils/clipboard";

/**
 * Props for the NoteForm component
 */
interface NoteFormProps {
  /** Initial note data for edit mode (optional) */
  initialNote?: Note;
  /** List of recent clipboard items to choose from */
  clipboardItems: ClipboardItem[];
  /** Callback when form is submitted with a note */
  onSubmit: (note: Note) => void | Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void | Promise<void>;
}

/**
 * NoteForm Component
 *
 * A Raycast form for creating or editing notes with optional clipboard attachment.
 *
 * Features:
 * - Required description text area
 * - Optional clipboard item picker (5 recent items)
 * - Validation for empty descriptions
 * - Support for both create and edit modes
 * - Keyboard shortcuts (⌘W to cancel)
 *
 * @example
 * ```tsx
 * <NoteForm
 *   clipboardItems={clipboardHistory}
 *   onSubmit={handleSave}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export default function NoteForm({
  initialNote,
  clipboardItems,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  // Helper to find clipboard index for initial note
  const getInitialClipboardIndex = (): string | null => {
    if (!initialNote?.clipboardReference) return null;
    const matchIndex = clipboardItems.findIndex(
      (item) => item.content === initialNote.clipboardReference?.content,
    );
    return matchIndex >= 0 ? String(matchIndex) : null;
  };

  // Form state - initialize with initialNote data to prevent flickering
  const [description, setDescription] = useState<string>(
    initialNote?.description || "",
  );
  const [selectedClipboardIndex, setSelectedClipboardIndex] = useState<
    string | null
  >(getInitialClipboardIndex());
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();

  /**
   * Handle description change and clear error
   */
  function handleDescriptionChange(value: string) {
    setDescription(value);
    // Clear error when user starts typing
    if (descriptionError && value.trim()) {
      setDescriptionError(undefined);
    }
  }

  /**
   * Handle form submission
   * Creates or updates a note based on form data
   */
  function handleSubmit() {
    // Validate description
    if (!description.trim()) {
      setDescriptionError("Description is required");
      return;
    }

    // Determine clipboard reference based on user selection
    let clipboardRef: ClipboardReference | undefined;

    if (selectedClipboardIndex === "none") {
      // User explicitly chose to remove clipboard reference
      clipboardRef = undefined;
    } else if (selectedClipboardIndex && selectedClipboardIndex !== "none") {
      // User selected a new clipboard item
      const selectedItem = clipboardItems[parseInt(selectedClipboardIndex)];
      clipboardRef = {
        content: selectedItem.content,
        type: selectedItem.type,
        timestamp: selectedItem.timestamp,
      };
    } else {
      // No selection change - preserve existing reference in edit mode
      clipboardRef = initialNote?.clipboardReference;
    }

    let note: Note;
    if (initialNote) {
      // Edit mode: update existing note
      note = {
        ...initialNote,
        description: description.trim(),
        clipboardReference: clipboardRef,
      };
    } else {
      // Create mode: new note
      note = createNote(description.trim(), clipboardRef);
    }

    onSubmit(note);
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={initialNote ? "Update Note" : "Save Note"}
            onSubmit={handleSubmit}
          />
          <Action
            title="Cancel"
            onAction={onCancel}
            shortcut={{ modifiers: ["cmd"], key: "w" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="description"
        title="Note Description"
        placeholder="What are you doing in this step?"
        value={description}
        onChange={handleDescriptionChange}
        error={descriptionError}
        autoFocus
      />

      <Form.Dropdown
        id="clipboardRef"
        title="Attach Clipboard Item"
        value={selectedClipboardIndex || "none"}
        onChange={setSelectedClipboardIndex}
      >
        <Form.Dropdown.Item value="none" title="None (no reference)" />
        {clipboardItems.map((item, index) => {
          const singleLine = item.content.replace(/\n/g, " | ");
          const truncated = truncate(singleLine, 150);
          return (
            <Form.Dropdown.Item
              key={index}
              value={String(index)}
              title={truncated}
            />
          );
        })}
      </Form.Dropdown>

      {selectedClipboardIndex && selectedClipboardIndex !== "none" && (
        <>
          <Form.Separator />
          <Form.Description
            title="Full Content Preview"
            text={clipboardItems[parseInt(selectedClipboardIndex)].content}
          />
          <Form.Description
            text={`Type: ${clipboardItems[parseInt(selectedClipboardIndex)].type} | ${clipboardItems[parseInt(selectedClipboardIndex)].timestamp}`}
          />
        </>
      )}

      <Form.Description
        text={`📌 ${clipboardItems.length} clipboard item${clipboardItems.length !== 1 ? "s" : ""} available`}
      />
    </Form>
  );
}

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
