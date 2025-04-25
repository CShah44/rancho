import { CoreAssistantMessage, CoreToolMessage, UIMessage } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export class FetchError extends Error {
  info: Record<string, unknown>;
  status: number;

  constructor(
    message: string,
    info?: Record<string, unknown>,
    status?: number
  ) {
    super(message);
    this.name = "FetchError";
    this.info = info || {};
    this.status = status || 500;

    // This is needed for proper instanceof checks in TypeScript
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new FetchError("An error occurred while fetching the data.");

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};
