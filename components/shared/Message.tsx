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

  return (
    <div
      className={cn(
        "flex w-full",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl sm:rounded-3xl shadow-lg transition-all duration-200 max-w-[85%] sm:max-w-[80%] lg:max-w-[75%]",
          message.role === "user"
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 sm:p-4 lg:p-5 rounded-tr-md"
            : "bg-zinc-800/80 backdrop-blur-sm text-white p-3 sm:p-4 lg:p-5 rounded-tl-md border border-zinc-700/40"
        )}
      >
        {message.parts &&
          message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-invert"
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
                  } else if (part.toolInvocation.result.status === "error") {
                    return (
                      <div
                        key={`${message.id}-${i}-game-e`}
                        className="mt-3 sm:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                      >
                        <AlertCircle className="text-red-400 h-5 w-5 sm:h-6 sm:w-6" />
                        <p className="text-sm sm:text-base font-medium text-red-400">
                          Failed to generate game
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-400 text-center">
                          There was an error during game generation. Please try
                          again.
                        </p>
                      </div>
                    );
                  } else if (
                    part.toolInvocation.result.status === "credit-error"
                  ) {
                    return (
                      <div
                        key={`${message.id}-${i}-game-e`}
                        className="mt-3 sm:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                      >
                        <AlertCircle className="text-red-400 h-5 w-5 sm:h-6 sm:w-6" />
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
                        className="mt-3 sm:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                      >
                        <AlertCircle className="text-red-400 h-5 w-5 sm:h-6 sm:w-6" />
                        <p className="text-sm sm:text-base font-medium text-red-400">
                          Failed to generate video
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-400 text-center">
                          There was an error during video generation. Please try
                          again.
                        </p>
                      </div>
                    );
                  else if (part.toolInvocation.result.status === "credit-error")
                    return (
                      <div
                        key={`${message.id}-${i}-video-e`}
                        className="mt-3 sm:mt-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2 sm:space-y-3"
                      >
                        <AlertCircle className="text-red-400 h-5 w-5 sm:h-6 sm:w-6" />
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
                    <Brain
                      size={16}
                      className="text-purple-400 mt-0.5 flex-shrink-0"
                    />
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
          <div className="mt-3 sm:mt-4 border-t border-zinc-700/50 pt-3 sm:pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 p-2 rounded-lg bg-zinc-700/30 hover:bg-zinc-700/50 transition-all duration-200 w-full justify-between text-zinc-300 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-blue-400" />
                <span className="text-xs sm:text-sm font-medium">
                  {sources.length} Source{sources.length > 1 ? "s" : ""}
                </span>
              </div>
              {showSources ? (
                <ChevronUp size={14} className="text-zinc-400" />
              ) : (
                <ChevronDown size={14} className="text-zinc-400" />
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
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <a
                    key={`${message.id}-source-${index}-${source.url}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-zinc-700/40 hover:bg-zinc-700/60 transition-all duration-200 group border border-zinc-600/30 hover:border-zinc-500/50"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <LinkIcon size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                        {source.title}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center">
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                          {source.url.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink
                          size={10}
                          className="ml-1 inline-block opacity-70"
                        />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced attachments display */}
      {message?.experimental_attachments &&
        message?.experimental_attachments?.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3",
              message.role === "user" ? "mr-2 sm:mr-3" : "ml-2 sm:ml-3"
            )}
          >
            {message.experimental_attachments.map((attachment, index) => {
              // Handle image attachments
              if (attachment?.contentType?.startsWith("image/")) {
                return (
                  <div
                    key={`${message.id}-img-${index}`}
                    className="rounded-xl overflow-hidden border border-zinc-700/50 shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <Image
                      src={attachment.url}
                      width={200}
                      height={200}
                      alt={attachment.name ?? `attachment-${index}`}
                      className="object-cover w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
                    />
                    {attachment.name && (
                      <div className="bg-zinc-800/90 text-xs text-zinc-300 p-2 truncate">
                        {attachment.name}
                      </div>
                    )}
                  </div>
                );
              }
              // Handle PDF attachments
              else if (attachment?.contentType?.startsWith("application/pdf")) {
                return (
                  <div
                    key={`${message.id}-pdf-${index}`}
                    className="flex flex-col items-center bg-zinc-800/80 rounded-xl p-3 sm:p-4 border border-zinc-700/50 shadow-md hover:shadow-lg transition-all duration-200 min-w-[120px] sm:min-w-[140px]"
                  >
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mb-2" />
                    <div className="text-xs sm:text-sm text-zinc-300 truncate max-w-[100px] sm:max-w-[120px] text-center">
                      {attachment.name || `Document-${index}.pdf`}
                    </div>
                    <button
                      onClick={() =>
                        setExpandedPdf(
                          expandedPdf === attachment.url ? null : attachment.url
                        )
                      }
                      className="mt-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 sm:px-3 py-1 rounded-lg transition-colors duration-200"
                    >
                      {expandedPdf === attachment.url ? "Hide PDF" : "View PDF"}
                    </button>
                    {expandedPdf === attachment.url && (
                      <div className="mt-3 w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]">
                        <iframe
                          src={attachment.url}
                          width="100%"
                          height="400"
                          className="border border-zinc-600 rounded-lg"
                        >
                          <p className="text-sm text-zinc-400 text-center p-4">
                            Unable to display PDF.{" "}
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              Download
                            </a>{" "}
                            instead.
                          </p>
                        </iframe>
                      </div>
                    )}
                  </div>
                );
              }
              // Handle other file types
              else {
                return (
                  <div
                    key={`${message.id}-file-${index}`}
                    className="flex flex-col items-center bg-zinc-800/80 rounded-xl p-3 sm:p-4 border border-zinc-700/50 shadow-md hover:shadow-lg transition-all duration-200 min-w-[120px] sm:min-w-[140px]"
                  >
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-2" />
                    <div className="text-xs sm:text-sm text-zinc-300 truncate max-w-[100px] sm:max-w-[120px] text-center">
                      {attachment.name || `File-${index}`}
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 sm:px-3 py-1 rounded-lg transition-colors duration-200"
                    >
                      Download
                    </a>
                  </div>
                );
              }
            })}
          </div>
        )}
    </div>
  );
};

export default Message;
