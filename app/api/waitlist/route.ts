import { NextResponse } from "next/server";
import {
  normalizeIdentifier,
  isValidIdentifier,
  appendWaitlistEntry,
  findWaitlistEntry,
  getWaitlistRows,
  isGoogleSheetsConfigured,
  INVALID_IDENTIFIER_MESSAGE,
} from "@/lib/google-sheets";
import { WaitlistRole } from "@/types";

interface WaitlistPayload {
  name?: string;
  identifier?: string;
  email?: string;
  phone?: string;
  role?: string;
  userType?: string;
  area?: string;
  campus?: string;
}

/**
 * Normalizes incoming role values to canonical WaitlistRole
 */
function normalizeRole(roleInput?: string): WaitlistRole {
  if (!roleInput) return "earn";
  const lower = roleInput.toLowerCase().trim();
  if (lower === "send" || lower === "sender") return "send";
  if (lower === "both") return "both";
  return "earn"; // default to earn / courier
}

/**
 * GET /api/waitlist?identifier=<phone_or_email>
 * GET /api/waitlist?stats=true
 *
 * Check Status:
 * 1. Read identifier from query params and normalize it.
 * 2. Fetch Waitlist rows and find matching row where row[2] === normalizedIdentifier.
 * 3. If not found, return 404 with { found: false }.
 * 4. If found, return 200 OK with { found: true, spot, name, identifier, role, area, createdAt }.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional Stats query
    const stats = searchParams.get("stats");
    if (stats === "true") {
      if (!isGoogleSheetsConfigured()) {
        return NextResponse.json(
          { success: true, totalCount: 140, displayCount: "140+" },
          { status: 200 }
        );
      }
      try {
        const rows = await getWaitlistRows();
        const totalCount = rows.length;
        return NextResponse.json(
          {
            success: true,
            totalCount,
            displayCount: `${totalCount}+`,
          },
          { status: 200 }
        );
      } catch (err) {
        console.warn("Unable to fetch stats from Google Sheets:", err);
        return NextResponse.json(
          { success: true, totalCount: 140, displayCount: "140+" },
          { status: 200 }
        );
      }
    }

    const rawIdentifier = searchParams.get("identifier");

    if (!rawIdentifier || typeof rawIdentifier !== "string" || rawIdentifier.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a phone number or email to check your status.",
        },
        { status: 400 }
      );
    }

    const normalized = normalizeIdentifier(rawIdentifier);

    if (!isValidIdentifier(normalized)) {
      return NextResponse.json(
        {
          success: false,
          error: INVALID_IDENTIFIER_MESSAGE,
        },
        { status: 400 }
      );
    }

    if (!isGoogleSheetsConfigured()) {
      console.error("Google Sheets configuration is missing for GET /api/waitlist");
      return NextResponse.json(
        {
          success: false,
          found: false,
          error: "Unable to check your status right now. Please try again shortly.",
        },
        { status: 500 }
      );
    }

    const result = await findWaitlistEntry(normalized);

    // If not found in Google Sheets, return 404 with { found: false }
    if (!result.found) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          message: "We couldn't find that phone or email on the waitlist.",
        },
        { status: 404 }
      );
    }

    // Found in Google Sheets: return 200 OK
    const { spot, name, identifier, role, area, createdAt } = result.entry;
    return NextResponse.json(
      {
        success: true,
        found: true,
        spot,
        name,
        identifier,
        role: normalizeRole(role),
        area,
        createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log technical error details strictly on the server; never leak to client
    console.error("Waitlist GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        found: false,
        error: "Unable to check your status right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/waitlist (Join Waitlist)
 *
 * 1. Validate name (required), identifier (valid Ethiopian phone or email), role, and optional area.
 * 2. Read existing rows from Google Sheets.
 * 3. Check if normalizedIdentifier already exists in column C (row[2]):
 *    - If found, return 200 OK with { alreadyRegistered: true, spot, name, role }.
 * 4. If not found:
 *    - Calculate nextSpot = rows.length + 1 and createdAt = new Date().toISOString().
 *    - Append [nextSpot, name, `'${identifier}`, role, area, createdAt] to Google Sheets.
 *    - Return 201 Created with { alreadyRegistered: false, spot: nextSpot, name, role }.
 */
export async function POST(request: Request) {
  try {
    let body: WaitlistPayload;
    try {
      body = (await request.json()) as WaitlistPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { name, identifier, email, phone, role, userType, area, campus } = body;

    const rawName = (name || "").toString().trim();
    const rawIdentifier = (identifier || email || phone || "").toString().trim();
    const rawArea = (area || campus || "").toString().trim();
    const parsedRole = normalizeRole(role || userType);

    // 1. Validation: Name
    if (!rawName || rawName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }
    if (rawName.length > 80) {
      return NextResponse.json(
        { success: false, error: "Name must be under 80 characters." },
        { status: 400 }
      );
    }

    // 2. Validation: Identifier (accepts all Ethiopian phone formats and email)
    const normalized = normalizeIdentifier(rawIdentifier);
    if (!isValidIdentifier(normalized)) {
      return NextResponse.json(
        {
          success: false,
          error: INVALID_IDENTIFIER_MESSAGE,
        },
        { status: 400 }
      );
    }

    // 3. Optional Area Validation
    const cleanArea = rawArea.length > 0 ? rawArea.slice(0, 80) : undefined;

    // 4. Verify Google Sheets Credentials
    if (!isGoogleSheetsConfigured()) {
      console.error("Google Sheets configuration is missing for POST /api/waitlist");
      return NextResponse.json(
        {
          success: false,
          error: "We're having trouble saving your request right now. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // 5. Append to Google Sheets or return existing
    const result = await appendWaitlistEntry({
      name: rawName,
      normalizedIdentifier: normalized,
      role: parsedRole,
      area: cleanArea,
    });

    if (result.alreadyRegistered) {
      // 200 OK: Existing member found
      return NextResponse.json(
        {
          success: true,
          alreadyRegistered: true,
          spot: result.spot,
          name: result.name,
          role: normalizeRole(result.role),
          identifier: result.identifier,
          area: result.area,
          message: `You're already on the waitlist! You're #${result.spot} in line.`,
        },
        { status: 200 }
      );
    }

    // 201 Created: New member added
    return NextResponse.json(
      {
        success: true,
        alreadyRegistered: false,
        spot: result.spot,
        name: result.name,
        role: normalizeRole(result.role),
        identifier: result.identifier,
        area: result.area,
        message:
          parsedRole === "earn"
            ? "Welcome! You're on the early access list to earn on your daily routes."
            : parsedRole === "send"
            ? "Welcome! Fast, protected deliveries across Addis Ababa are coming soon."
            : "Welcome! You're set up for both earning and sending on your route.",
      },
      { status: 201 }
    );
  } catch (error) {
    // Log technical error details strictly on the server; never leak raw errors to client
    console.error("Waitlist POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "We're having trouble saving your request right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
