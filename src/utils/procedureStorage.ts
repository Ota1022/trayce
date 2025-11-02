import { LocalStorage } from "@raycast/api";
import { Procedure } from "../types/procedure";

/**
 * Storage key for procedures in LocalStorage
 */
const PROCEDURES_STORAGE_KEY = "trayce_procedures";

/**
 * Save a new procedure to LocalStorage
 * @param procedure - The procedure to save
 */
export async function saveProcedure(procedure: Procedure): Promise<void> {
  const procedures = await getAllProcedures();
  procedures.push(procedure);
  await LocalStorage.setItem(
    PROCEDURES_STORAGE_KEY,
    JSON.stringify(procedures),
  );
}

/**
 * Update an existing procedure in LocalStorage
 * @param procedure - The procedure with updated data (matched by id)
 */
export async function updateProcedure(procedure: Procedure): Promise<void> {
  const procedures = await getAllProcedures();
  const index = procedures.findIndex((p) => p.id === procedure.id);

  if (index === -1) {
    throw new Error(`Procedure with id ${procedure.id} not found`);
  }

  // Update the updatedAt timestamp
  procedure.updatedAt = new Date().toISOString();
  procedures[index] = procedure;
  await LocalStorage.setItem(
    PROCEDURES_STORAGE_KEY,
    JSON.stringify(procedures),
  );
}

/**
 * Delete a procedure from LocalStorage
 * @param procedureId - The ID of the procedure to delete
 */
export async function deleteProcedure(procedureId: string): Promise<void> {
  const procedures = await getAllProcedures();
  const filtered = procedures.filter((p) => p.id !== procedureId);
  await LocalStorage.setItem(PROCEDURES_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get all procedures from LocalStorage
 * @returns Array of all saved procedures, sorted by createdAt (newest first)
 */
export async function getAllProcedures(): Promise<Procedure[]> {
  const data = await LocalStorage.getItem<string>(PROCEDURES_STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const procedures = JSON.parse(data) as Procedure[];
    // Sort by createdAt descending (newest first)
    return procedures.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Failed to parse procedures from storage:", error);
    return [];
  }
}

/**
 * Get a single procedure by ID
 * @param procedureId - The ID of the procedure to retrieve
 * @returns The procedure if found, undefined otherwise
 */
export async function getProcedureById(
  procedureId: string,
): Promise<Procedure | undefined> {
  const procedures = await getAllProcedures();
  return procedures.find((p) => p.id === procedureId);
}

/**
 * Clear all procedures from LocalStorage
 * WARNING: This permanently deletes all procedures
 */
export async function clearAllProcedures(): Promise<void> {
  await LocalStorage.removeItem(PROCEDURES_STORAGE_KEY);
}
