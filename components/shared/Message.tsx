import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "@/components/shared/memoized-markdown";
import {
  AlertCircle,
  Brain,
  ExternalLink,
  LinkIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Download,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Message as MessageType } from "ai";
import ImagesTool from "./ImagesTool";
import VideoTool from "./VideoTool";
import QuizComponent from "./QuizComponent";
import Image from "next/image";
import { useState } from "react";
import GameTool from "./GameTool";
import { Button } from "@/components/ui/button";

interface MessageProps {
  message: MessageType;
}

interface Source {
  url: string;
  title: string;
}

const Message = ({ message }: MessageProps) => {
  const [expandedPdf, setExpandedPdf] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);

  // Extract all sources from the message parts
  const sources: Source[] = [];
  message.parts?.forEach((part) => {
    if (part.type === "source") {
      sources.push({
        url: part.source.url,
        title: part.source.title || "",
      });
    }
  });

  const handleImagePreview = (url: string) => {
    setPreviewImage(url);
    setImageZoom(1);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setImageZoom(1);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (contentType?: string) => {
    if (contentType?.startsWith("image/")) return "🖼️";
    if (contentType?.startsWith("application/pdf")) return "📄";
    if (contentType?.startsWith("text/")) return "📝";
    if (contentType?.startsWith("video/")) return "🎥";
    if (contentType?.startsWith("audio/")) return "🎵";
    return "📎";
  };

  return (
    <>
      <div
        className={cn(
          "flex w-full",
          message.role === "user" ? "justify-end" : "justify-start"
        )}
      >
        <div className="flex flex-col max-w-[100%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%]">
          {/* Attachments - Show before message for user messages */}
          {message.role === "user" &&
            message?.experimental_attachments &&
            message?.experimental_attachments?.length > 0 && (
              <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2 justify-end">
                {message.experimental_attachments.map((attachment, index) => (
                  <AttachmentPreview
                    key={`${message.id}-attachment-${index}`}
                    attachment={attachment}
                    index={index}
                    messageId={message.id}
                    onImagePreview={handleImagePreview}
                    expandedPdf={expandedPdf}
                    setExpandedPdf={setExpandedPdf}
                    formatFileSize={formatFileSize}
                    getFileIcon={getFileIcon}
                  />
                ))}
              </div>
            )}

          {/* Main message content */}
          <div
            className={cn(
              "rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg transition-all duration-200",
              message.role === "user"
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-tr-md"
                : "bg-zinc-800/80 backdrop-blur-sm text-white p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-tl-md border border-zinc-700/40"
            )}
          >
            {message.parts &&
              message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="text-xs sm:text-lg max-w-none"
                      >
                        <MemoizedMarkdown content={part.text} id={message.id} />
                      </div>
                    );
                  case "tool-invocation":
                    if (
                      part.toolInvocation.toolName === "image" &&
                      part.toolInvocation.state === "result"
                    ) {
                      return (
                        <ImagesTool
                          key={`${message.id}-${i}-image`}
                          images={part.toolInvocation.result.images}
                        />
                      );
                    }

                    if (
                      part.toolInvocation.toolName === "quiz" &&
                      part.toolInvocation.state === "result"
                    ) {
                      return (
                        <QuizComponent
                          key={`${message.id}-${i}-quiz`}
                          topic={part.toolInvocation.result.topic}
                          difficulty={part.toolInvocation.result.difficulty}
                          questions={part.toolInvocation.result.questions}
                        />
                      );
                    }

                    if (
                      part.toolInvocation.toolName === "game" &&
                      part.toolInvocation.state === "result"
                    ) {
                      if (part.toolInvocation.result.status === "success") {
                        return (
                          <GameTool
                            key={`${message.id}-${i}-game`}
                            game={part.toolInvocation.result}
                          />
                        );
                      } else if (
                        part.toolInvocation.result.status === "error"
                      ) {
                        return (
                          <div
                            key={`${message.id}-${i}-game-e`}
                            className="mt-2 sm:mt-3 md:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                          >
                            <AlertCircle className="text-red-400 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            <p className="text-sm sm:text-base font-medium text-red-400">
                              Failed to generate game
                            </p>
                            <p className="text-xs sm:text-sm text-zinc-400 text-center">
                              There was an error during game generation. Please
                              try again. (No Credits Charged)
                            </p>
                          </div>
                        );
                      } else if (
                        part.toolInvocation.result.status === "credit-error"
                      ) {
                        return (
                          <div
                            key={`${message.id}-${i}-game-e`}
                            className="mt-2 sm:mt-3 md:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                          >
                            <AlertCircle className="text-red-400 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            <p className="text-sm sm:text-base font-medium text-red-400">
                              Failed to generate game
                            </p>
                            <MemoizedMarkdown
                              id={part.toolInvocation.toolCallId}
                              content={part.toolInvocation.result.text}
                            />
                          </div>
                        );
                      }
                    }

                    if (
                      part.toolInvocation.toolName === "video" &&
                      part.toolInvocation.state === "result"
                    ) {
                      if (part.toolInvocation.result.status === "success")
                        return (
                          <VideoTool
                            key={`${message.id}-${i}-video`}
                            id={message.id}
                            video={part.toolInvocation.result}
                          />
                        );
                      else if (part.toolInvocation.result.status === "error")
                        return (
                          <div
                            key={`${message.id}-${i}-video-e`}
                            className="mt-2 sm:mt-3 md:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                          >
                            <AlertCircle className="text-red-400 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            <p className="text-sm sm:text-base font-medium text-red-400">
                              Failed to generate video
                            </p>
                            <p className="text-xs sm:text-sm text-zinc-400 text-center">
                              There was an error during video generation. Please
                              try again. (No Credits Charged)
                            </p>
                          </div>
                        );
                      else if (
                        part.toolInvocation.result.status === "credit-error"
                      )
                        return (
                          <div
                            key={`${message.id}-${i}-video-e`}
                            className="mt-2 sm:mt-3 md:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                          >
                            <AlertCircle className="text-red-400 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            <p className="text-sm sm:text-base font-medium text-red-400">
                              Failed to generate video
                            </p>
                            <MemoizedMarkdown
                              id={part.toolInvocation.toolCallId}
                              content={part.toolInvocation.result.text}
                            />
                          </div>
                        );
                    }
                    break;

                  case "reasoning":
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="flex items-start space-x-2 sm:space-x-3 mt-2 sm:mt-3 p-2 sm:p-3 bg-zinc-700/30 rounded-lg border-l-2 border-purple-500/50"
                      >
                        <Brain className="text-purple-400 mt-0.5 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                        <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                          {part.reasoning}
                        </div>
                      </div>
                    );

                  case "source":
                    // Skip rendering individual sources here - we'll render them collectively below
                    return null;

                  default:
                    return null;
                }
              })}

            {/* Collapsible Sources Section */}
            {sources.length > 0 && (
              <div className="mt-2 sm:mt-3 md:mt-4 border-t border-zinc-700/50 pt-2 sm:pt-3 md:pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-700/30 hover:bg-zinc-700/50 transition-all duration-200 w-full justify-between text-zinc-300 hover:text-white"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    <span className="text-xs sm:text-sm font-medium">
                      {sources.length} Source{sources.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  {showSources ? (
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
                  )}
                </Button>

                {/* Animated Sources List */}
                <div
                  style={{ scrollbarWidth: "none" }}
                  className={cn(
                    "overflow-auto transition-all duration-300 ease-in-out",
                    showSources
                      ? "max-h-96 opacity-100 mt-2 sm:mt-3"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    {sources.map((source, index) => (
                      <a
                        key={`${message.id}-source-${index}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-zinc-700/40 hover:bg-zinc-700/60 transition-all duration-200 group border border-zinc-600/30 hover:border-zinc-500/50"
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                            {source.title}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1 flex items-center">
                            <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                              {source.url.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="ml-1 inline-block opacity-70 w-2 h-2 sm:w-2.5 sm:h-2.5" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attachments - Show after message for assistant messages */}
          {message.role === "assistant" &&
            message?.experimental_attachments &&
            message?.experimental_attachments?.length > 0 && (
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {message.experimental_attachments.map((attachment, index) => (
                  <AttachmentPreview
                    key={`${message.id}-attachment-${index}`}
                    attachment={attachment}
                    index={index}
                    messageId={message.id}
                    onImagePreview={handleImagePreview}
                    expandedPdf={expandedPdf}
                    setExpandedPdf={setExpandedPdf}
                    formatFileSize={formatFileSize}
                    getFileIcon={getFileIcon}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Full-screen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-4 bg-zinc-800/80 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
                  className="text-white hover:bg-zinc-700 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                >
                  <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="text-white text-xs sm:text-sm font-medium">
                  {Math.round(imageZoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
                  className="text-white hover:bg-zinc-700 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                >
                  <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeImagePreview}
                className="text-white hover:bg-zinc-700 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* Image Container */}
            <div className="overflow-auto rounded-lg bg-zinc-900/50">
              <Image
                src={previewImage}
                alt="Preview"
                width={800}
                height={600}
                className="object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: "center",
                }}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Separate component for attachment preview
interface AttachmentPreviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachment: any;
  index: number;
  messageId: string;
  onImagePreview: (url: string) => void;
  expandedPdf: string | null;
  setExpandedPdf: (url: string | null) => void;
  formatFileSize: (bytes?: number) => string;
  getFileIcon: (contentType?: string) => string;
}

const AttachmentPreview = ({
  attachment,
  index,
  onImagePreview,
  expandedPdf,
  setExpandedPdf,
  formatFileSize,
  getFileIcon,
}: AttachmentPreviewProps) => {
  // Handle image attachments
  if (attachment?.contentType?.startsWith("image/")) {
    return (
      <div className="group relative bg-zinc-800/60 rounded-lg sm:rounded-xl overflow-hidden border border-zinc-700/50 shadow-lg hover:shadow-xl transition-all duration-200 max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">
        <div className="relative aspect-square">
          <Image
            src={attachment.url}
            fill
            alt={attachment.name ?? `attachment-${index}`}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, 200px"
          />
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onImagePreview(attachment.url)}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm h-7 w-7 sm:h-8 sm:w-8 p-1"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm h-7 w-7 sm:h-8 sm:w-8 p-1"
              >
                <a href={attachment.url} download={attachment.name}>
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        {attachment.name && (
          <div className="p-1.5 sm:p-2 bg-zinc-800/90">
            <div className="text-xs text-zinc-300 truncate font-medium">
              {attachment.name}
            </div>
            {attachment.size && (
              <div className="text-xs text-zinc-500 mt-1">
                {formatFileSize(attachment.size)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle PDF attachments
  else if (attachment?.contentType?.startsWith("application/pdf")) {
    const isExpanded = expandedPdf === attachment.url;

    return (
      <div className="bg-zinc-800/60 rounded-lg sm:rounded-xl border border-zinc-700/50 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden max-w-full">
        <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
              {attachment.name || `Document-${index}.pdf`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              PDF Document
              {attachment.size && ` • ${formatFileSize(attachment.size)}`}
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedPdf(isExpanded ? null : attachment.url)}
              className="text-zinc-300 hover:text-white hover:bg-zinc-700 h-7 w-7 sm:h-8 sm:w-8 p-1"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-zinc-300 hover:text-white hover:bg-zinc-700 h-7 w-7 sm:h-8 sm:w-8 p-1"
            >
              <a href={attachment.url} download={attachment.name}>
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </Button>
          </div>
        </div>
        {/* PDF Viewer */}
        {isExpanded && (
          <div className="border-t border-zinc-700/50 bg-zinc-900/50">
            <div className="p-2 sm:p-4">
              <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] border border-zinc-600 rounded-lg bg-zinc-800/50 overflow-hidden">
                <iframe
                  src={`${attachment.url}#view=FitH`}
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin"
                  title={attachment.name || "PDF Preview"}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle other file types
  else {
    return (
      <div className="bg-zinc-800/60 rounded-lg sm:rounded-xl border border-zinc-700/50 shadow-lg hover:shadow-xl transition-all duration-200 p-3 sm:p-4 min-w-[150px] sm:min-w-[180px] md:min-w-[200px] max-w-[200px] sm:max-w-[220px] md:max-w-[250px]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-zinc-700/50 rounded-lg flex items-center justify-center text-base sm:text-lg md:text-xl">
            {getFileIcon(attachment.contentType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
              {attachment.name || `File-${index}`}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {attachment.contentType?.split("/")[1]?.toUpperCase() || "File"}
              {attachment.size && ` • ${formatFileSize(attachment.size)}`}
            </div>
            <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 text-xs h-6 sm:h-7 px-2"
              >
                <a href={attachment.url} download={attachment.name}>
                  <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Download
                </a>
              </Button>
              {attachment.contentType?.startsWith("text/") && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 text-xs h-6 sm:h-7 px-2"
                >
                  <a href={attachment.url} target="_blank" rel="noreferrer">
                    <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    View
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Message;
