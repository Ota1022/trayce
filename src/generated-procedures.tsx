import React, { useState, useEffect } from "react";
import {
  List,
  ActionPanel,
  Action,
  Detail,
  showToast,
  Toast,
  Icon,
  Color,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { Procedure } from "./types/procedure";
import { getAllProcedures, deleteProcedure } from "./utils/procedureStorage";

/**
 * Generated Procedures Command
 *
 * Displays a list of all AI-generated procedure documents with CRUD operations.
 */
export default function GeneratedProceduresCommand() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcedure, setSelectedProcedure] = useState<
    Procedure | undefined
  >(undefined);

  // Load procedures on mount
  useEffect(() => {
    loadProcedures();
  }, []);

  async function loadProcedures() {
    try {
      const loadedProcedures = await getAllProcedures();
      setProcedures(loadedProcedures);
      setIsLoading(false);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load procedures",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      setIsLoading(false);
    }
  }

  async function handleDelete(procedure: Procedure) {
    if (
      await confirmAlert({
        title: "Delete Procedure",
        message: "Are you sure you want to delete this procedure?",
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      try {
        await deleteProcedure(procedure.id);
        await showToast({
          style: Toast.Style.Success,
          title: "Procedure Deleted",
        });
        // Reload procedures after deletion
        await loadProcedures();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete procedure",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  function handleView(procedure: Procedure) {
    setSelectedProcedure(procedure);
  }

  function handleBack() {
    setSelectedProcedure(undefined);
  }

  // Show procedure detail view
  if (selectedProcedure) {
    return (
      <Detail
        markdown={selectedProcedure.markdown}
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Title"
              text={selectedProcedure.title}
            />
            <Detail.Metadata.Label
              title="Created"
              text={new Date(selectedProcedure.createdAt).toLocaleString()}
            />
            <Detail.Metadata.Label
              title="Updated"
              text={new Date(selectedProcedure.updatedAt).toLocaleString()}
            />
            <Detail.Metadata.Label
              title="Source Notes"
              text={`${selectedProcedure.sourceNoteIds.length} notes`}
            />
            {selectedProcedure.tags && selectedProcedure.tags.length > 0 && (
              <Detail.Metadata.TagList title="Tags">
                {selectedProcedure.tags.map((tag) => (
                  <Detail.Metadata.TagList.Item key={tag} text={tag} />
                ))}
              </Detail.Metadata.TagList>
            )}
          </Detail.Metadata>
        }
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Markdown"
              content={selectedProcedure.markdown}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            <Action.Paste
              title="Paste to Active App"
              content={selectedProcedure.markdown}
              shortcut={{ modifiers: ["cmd"], key: "v" }}
            />
            <Action
              title="Back to List"
              onAction={handleBack}
              icon={Icon.ArrowLeft}
              shortcut={{ modifiers: ["cmd"], key: "b" }}
            />
            <Action
              title="Delete Procedure"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              onAction={() => handleDelete(selectedProcedure)}
              shortcut={{ modifiers: ["cmd"], key: "backspace" }}
            />
          </ActionPanel>
        }
      />
    );
  }

  // Main procedures list view
  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search procedures...">
      {procedures.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Document}
          title="No Procedures Yet"
          description="Generate your first procedure using the 'Create Procedures' command"
        />
      ) : (
        procedures.map((procedure) => (
          <List.Item
            key={procedure.id}
            title={procedure.title}
            subtitle={formatDate(procedure.createdAt)}
            accessories={[
              {
                icon: Icon.Document,
                tooltip: `${procedure.sourceNoteIds.length} source notes`,
              },
              ...(procedure.tags && procedure.tags.length > 0
                ? [
                    {
                      tag: { value: procedure.tags[0], color: Color.Blue },
                      tooltip: `Tags: ${procedure.tags.join(", ")}`,
                    },
                  ]
                : []),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="View Procedure"
                  icon={Icon.Eye}
                  onAction={() => handleView(procedure)}
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                />
                <Action.CopyToClipboard
                  title="Copy Markdown"
                  content={procedure.markdown}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.Paste
                  title="Paste to Active App"
                  content={procedure.markdown}
                  shortcut={{ modifiers: ["cmd"], key: "v" }}
                />
                <Action
                  title="Delete Procedure"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => handleDelete(procedure)}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

/**
 * Format date for display
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
