import { Form, ActionPanel, Action } from "@raycast/api";
import React, { useState } from "react";

/**
 * Generation configuration including title, custom instructions, and language
 */
export interface GenerationConfig {
  title: string;
  customInstructions?: string;
  language: string;
}

/**
 * Props for the ProcedureTitleForm component
 */
interface ProcedureTitleFormProps {
  /** Callback when form is submitted with generation config */
  onSubmit: (config: GenerationConfig) => void | Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void | Promise<void>;
}

/**
 * ProcedureTitleForm Component
 *
 * A Raycast form for configuring procedure generation.
 *
 * Features:
 * - Required title text field
 * - Optional custom instructions textarea
 * - Language selection (English, Japanese, or custom input)
 * - Validation for empty titles
 * - Keyboard shortcuts (⌘W to cancel)
 *
 * @example
 * ```tsx
 * <ProcedureTitleForm
 *   onSubmit={handleGenerate}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export default function ProcedureTitleForm({
  onSubmit,
  onCancel,
}: ProcedureTitleFormProps) {
  const [title, setTitle] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [language, setLanguage] = useState<string>("English");
  const [customLanguage, setCustomLanguage] = useState<string>("");
  const [titleError, setTitleError] = useState<string | undefined>();

  /**
   * Handle title change and clear error
   */
  function handleTitleChange(value: string) {
    setTitle(value);
    // Clear error when user starts typing
    if (titleError && value.trim()) {
      setTitleError(undefined);
    }
  }

  /**
   * Handle form submission
   */
  function handleSubmit() {
    // Validate title
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    // Determine the final language to use
    const finalLanguage =
      language === "Custom" ? customLanguage.trim() : language;

    onSubmit({
      title: title.trim(),
      customInstructions: customInstructions.trim() || undefined,
      language: finalLanguage || "English",
    });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Generate Procedure"
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
      <Form.TextField
        id="title"
        title="Procedure Title"
        placeholder="Enter a descriptive title for this procedure"
        value={title}
        onChange={handleTitleChange}
        error={titleError}
        autoFocus
      />

      <Form.TextArea
        id="customInstructions"
        title="Custom Instructions"
        placeholder="Optional: Add specific instructions for how to generate this procedure (e.g., 'Focus on troubleshooting steps', 'Include detailed explanations for beginners', 'Use technical terminology')"
        value={customInstructions}
        onChange={setCustomInstructions}
      />

      <Form.Dropdown
        id="language"
        title="Language"
        value={language}
        onChange={setLanguage}
      >
        <Form.Dropdown.Item value="English" title="English" />
        <Form.Dropdown.Item value="Japanese" title="日本語" />
        <Form.Dropdown.Item value="Custom" title="Other..." />
      </Form.Dropdown>

      {language === "Custom" && (
        <Form.TextField
          id="customLanguage"
          title="Custom Language"
          placeholder="Enter language name (e.g., Spanish, French, Chinese)"
          value={customLanguage}
          onChange={setCustomLanguage}
        />
      )}

      <Form.Description text="Configure how the procedure should be generated. The title will identify it in your library." />
    </Form>
  );
}
