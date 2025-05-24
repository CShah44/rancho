import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "@/components/shared/memoized-markdown";
import {
  AlertCircle,
  Brain,
  ExternalLink,
  LinkIcon,
  FileText,
} from "lucide-react";
import { Message as MessageType } from "ai";
import ImagesTool from "./ImagesTool";
import VideoTool from "./VideoTool";
import QuizComponent from "./QuizComponent";
import Image from "next/image";
import { useState } from "react";
interface MessageProps {
  message: MessageType;
}

// TODO RENDER MATH
const Message = ({ message }: MessageProps) => {
  const [expandedPdf, setExpandedPdf] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "flex text-lg",
        message.role === "user"
          ? "justify-end flex-col items-end"
          : "justify-start"
      )}
    >
      <div
        className={cn(
          "p-4 rounded-2xl max-w-[85%] shadow-md transition-all duration-200",
          message.role === "user"
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-zinc-800/80 text-white rounded-tl-none border border-zinc-700/50"
        )}
      >
        {message.parts &&
          message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div key={`${message.id}-${i}`} className="prose max-w-none">
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
                        className="mt-4 flex flex-col items-center justify-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 space-y-3"
                      >
                        <AlertCircle className="text-red-500 h-6 w-6" />
                        <p className="text-sm font-medium text-red-500">
                          Failed to generate video
                        </p>
                        <p className="text-sm text-zinc-400 text-center">
                          There was an error during video generation. Please try
                          again.
                        </p>
                      </div>
                    );
                }

                break;
              case "reasoning":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="flex items-center space-x-2 space-y-1"
                  >
                    <Brain size={16} />
                    <div className="text-sm text-zinc-400">
                      {part.reasoning}
                    </div>
                  </div>
                );
              case "source":
                return (
                  <div
                    key={`${message.id}-${i}-source-${part.source.url}-${part.source.title}`}
                    className="mt-3 border-t border-zinc-700/50 pt-3"
                  >
                    <a
                      href={part.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 p-2 rounded-lg bg-zinc-700/30 hover:bg-zinc-700/50 transition-colors group"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <LinkIcon size={16} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-2">
                          {part.source.title}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex items-center">
                          <span className="truncate max-w-[200px]">
                            {part.source.url.replace(/^https?:\/\//, "")}
                          </span>
                          <ExternalLink
                            size={12}
                            className="ml-1 inline-block opacity-70"
                          />
                        </div>
                      </div>
                    </a>
                  </div>
                );

              default:
                return null;
            }
          })}
      </div>
      {message?.experimental_attachments &&
        message?.experimental_attachments?.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-2 ml-2 mt-2",
              message.role === "user" ? "mr-2" : "ml-2"
            )}
          >
            {message.experimental_attachments.map((attachment, index) => {
              // Handle image attachments
              if (attachment?.contentType?.startsWith("image/")) {
                return (
                  <div
                    key={`${message.id}-img-${index}`}
                    className="rounded-lg overflow-hidden border border-zinc-700/50 shadow-md"
                  >
                    <Image
                      src={attachment.url}
                      width={200}
                      height={200}
                      alt={attachment.name ?? `attachment-${index}`}
                      className="object-cover max-w-[200px] max-h-[200px]"
                    />
                    {attachment.name && (
                      <div className="bg-zinc-800 text-xs text-zinc-300 p-1 truncate max-w-[200px]">
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
                    className="flex flex-col items-center bg-zinc-800/80 rounded-lg p-3 border border-zinc-700/50 shadow-md"
                  >
                    <FileText className="h-8 w-8 text-red-400 mb-2" />
                    <div className="text-xs text-zinc-300 truncate max-w-[120px]">
                      {attachment.name || `Document-${index}.pdf`}
                    </div>
                    <button
                      onClick={() =>
                        setExpandedPdf(
                          expandedPdf === attachment.url ? null : attachment.url
                        )
                      }
                      className="mt-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      {expandedPdf === attachment.url ? "Hide PDF" : "View PDF"}
                    </button>
                    {expandedPdf === attachment.url && (
                      <div className="mt-3 w-full max-w-[500px]">
                        <iframe
                          src={attachment.url}
                          // itemType="application/pdf"
                          width="100%"
                          height="500px"
                          className="border border-zinc-600 rounded"
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
                    className="flex flex-col items-center bg-zinc-800/80 rounded-lg p-3 border border-zinc-700/50 shadow-md"
                  >
                    <FileText className="h-8 w-8 text-blue-400 mb-2" />
                    <div className="text-xs text-zinc-300 truncate max-w-[120px]">
                      {attachment.name || `File-${index}`}
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded transition-colors"
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
