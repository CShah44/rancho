export interface MessageType {
  role: "user" | "assistant";
  content?: string;
  tool_results?: ToolResult[];
}

export type ToolResult =
  | VideoToolResult
  | ImageToolResult
  | QuizToolResult
  | TextToolResult;

export interface VideoToolResult {
  type: "video";
  status?: "success" | "error";
  title?: string;
  videoUrl?: string;
  explanation?: string;
  mimeType?: string;
}

export interface ImageToolResult {
  type: "image";
  images?: {
    imageUrl: string;
    title: string;
  }[];
}

export interface QuizToolResult {
  type: "quiz";
  topic: string;
  difficulty: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface TextToolResult {
  type: "text";
  text: string;
  status?: "error";
}
