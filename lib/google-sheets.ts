import { google } from "googleapis";
import {
  normalizeIdentifier,
  isValidIdentifier,
  maskIdentifier,
  INVALID_IDENTIFIER_MESSAGE,
} from "./identifier";

export { normalizeIdentifier, isValidIdentifier, maskIdentifier, INVALID_IDENTIFIER_MESSAGE };

/**
 * Configuration & Sheets Client Initialization
 */
export function getGoogleSheetsConfig() {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ?.replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME?.trim() || "Waitlist";

  return { sheetId, clientEmail, privateKey, tabName };
}

export function isGoogleSheetsConfigured(): boolean {
  const { sheetId, clientEmail, privateKey } = getGoogleSheetsConfig();
  return Boolean(sheetId && clientEmail && privateKey);
}

export function getSheetsClient() {
  const { sheetId, clientEmail, privateKey, tabName } = getGoogleSheetsConfig();

  if (!sheetId || !clientEmail || !privateKey) {
    console.error(
      "Missing Google Sheets credentials on server. Required: GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY"
    );
    throw new Error(
      "Missing Google Sheets configuration. Please set GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId, tabName };
}

export interface GoogleSheetsWaitlistEntry {
  spot: number;
  name: string;
  identifier: string;
  role: string;
  area: string;
  createdAt: string;
}

/**
 * Safely quotes a sheet tab name for Google Sheets A1 notation
 * Handles names with spaces, special characters, and apostrophes
 */
export function escapeSheetName(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

// In-memory cache for resolved tab name to avoid redundant metadata API calls
let cachedResolvedTabName: string | null = null;

/**
 * Ensures the target waitlist tab exists in the spreadsheet.
 * If the sheet only has default "Sheet1", renames it or creates "Waitlist",
 * and initializes the header row (A1:F1) if missing.
 */
export async function resolveAndEnsureWaitlistTab(): Promise<string> {
  const { sheets, sheetId, tabName } = getSheetsClient();

  if (cachedResolvedTabName) {
    return cachedResolvedTabName;
  }

  const targetTab = tabName || "Waitlist";

  try {
    const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetList = metadata.data.sheets || [];

    // 1. Look for existing tab matching targetTab (case-insensitive)
    const existingMatch = sheetList.find(
      (s) => s.properties?.title?.toLowerCase() === targetTab.toLowerCase()
    );

    let resolvedTitle = targetTab;

    if (existingMatch && existingMatch.properties?.title) {
      resolvedTitle = existingMatch.properties.title;
    } else if (
      sheetList.length === 1 &&
      (sheetList[0].properties?.title === "Sheet1" || sheetList[0].properties?.title === "Sheet 1")
    ) {
      // Single default sheet exists: rename it to targetTab
      const firstSheetId = sheetList[0].properties?.sheetId ?? 0;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: firstSheetId,
                  title: targetTab,
                },
                fields: "title",
              },
            },
          ],
        },
      });
      resolvedTitle = targetTab;
    } else {
      // Add new sheet tab
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: targetTab,
                },
              },
            },
          ],
        },
      });
      resolvedTitle = targetTab;
    }

    // 2. Ensure row 1 header exists: [Spot, Name, Identifier, Role, Area, CreatedAt]
    const escaped = escapeSheetName(resolvedTitle);
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${escaped}!A1:F1`,
    });

    if (
      !headerCheck.data.values ||
      headerCheck.data.values.length === 0 ||
      headerCheck.data.values[0].length === 0
    ) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${escaped}!A1:F1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Spot", "Name", "Identifier", "Role", "Area", "CreatedAt"]],
        },
      });
    }

    cachedResolvedTabName = resolvedTitle;
    return resolvedTitle;
  } catch (error) {
    // If metadata check fails, fallback to targetTab with single quotes
    console.warn("Unable to inspect spreadsheet metadata, falling back to default tab:", error);
    return targetTab;
  }
}

/**
 * Fetches all rows from the Waitlist sheet (excluding header row)
 */
export async function getWaitlistRows(): Promise<string[][]> {
  const { sheets, sheetId } = getSheetsClient();
  const tab = await resolveAndEnsureWaitlistTab();
  const range = `${escapeSheetName(tab)}!A2:F`;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    return (response.data.values as string[][]) || [];
  } catch (err: unknown) {
    // If range parsing failed (e.g. sheet was renamed externally), invalidate cache and retry once
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("Unable to parse range")) {
      cachedResolvedTabName = null;
      const freshTab = await resolveAndEnsureWaitlistTab();
      const retryRange = `${escapeSheetName(freshTab)}!A2:F`;
      const retryResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: retryRange,
      });
      return (retryResponse.data.values as string[][]) || [];
    }
    throw err;
  }
}

/**
 * Finds an entry by normalized identifier in column C (row[2])
 */
export async function findWaitlistEntry(
  normalizedIdentifier: string
): Promise<{ found: true; entry: GoogleSheetsWaitlistEntry } | { found: false }> {
  const rows = await getWaitlistRows();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cellIdentifier = normalizeIdentifier(row[2] || "");
    if (cellIdentifier === normalizedIdentifier) {
      return {
        found: true,
        entry: {
          spot: Number(row[0]) || i + 1,
          name: row[1] || "",
          identifier: row[2] || "",
          role: row[3] || "earn",
          area: row[4] || "",
          createdAt: row[5] || "",
        },
      };
    }
  }

  return { found: false };
}

/**
 * Appends a new waitlist entry or returns the existing spot if already registered
 */
export async function appendWaitlistEntry(params: {
  name: string;
  normalizedIdentifier: string;
  role: string;
  area?: string;
}): Promise<{
  alreadyRegistered: boolean;
  spot: number;
  name: string;
  identifier: string;
  role: string;
  area: string;
  createdAt: string;
}> {
  const { sheets, sheetId } = getSheetsClient();
  const rows = await getWaitlistRows();
  const tab = await resolveAndEnsureWaitlistTab();

  // 1. Check if normalized identifier already exists in column C (row[2])
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cellIdentifier = normalizeIdentifier(row[2] || "");
    if (cellIdentifier === params.normalizedIdentifier) {
      return {
        alreadyRegistered: true,
        spot: Number(row[0]) || i + 1,
        name: row[1] || params.name,
        identifier: row[2] || params.normalizedIdentifier,
        role: row[3] || params.role,
        area: row[4] || params.area || "",
        createdAt: row[5] || "",
      };
    }
  }

  // 2. Calculate next spot and current timestamp
  const nextSpot = rows.length + 1;
  const createdAt = new Date().toISOString();
  const cleanArea = params.area?.trim() || "";

  // 3. Append row to 'Waitlist'!A:F
  // Important: Prefix identifier with leading single quote (') so Google Sheets stores phone numbers as text preserving leading 0.
  const rowValues = [
    nextSpot,
    params.name.trim(),
    `'${params.normalizedIdentifier}`,
    params.role,
    cleanArea,
    createdAt,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${escapeSheetName(tab)}!A:F`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [rowValues],
    },
  });

  return {
    alreadyRegistered: false,
    spot: nextSpot,
    name: params.name.trim(),
    identifier: params.normalizedIdentifier,
    role: params.role,
    area: cleanArea,
    createdAt,
  };
}
