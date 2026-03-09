import type { ServerMessage } from "@/shared/types";

export function parseMessage(raw: string): ServerMessage | null {
  try {
    return JSON.parse(raw) as ServerMessage;
  } catch {
    console.warn("[messageParser] Invalid JSON:", raw.slice(0, 80));
    return null;
  }
}
