import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "@/components/shared/memoized-markdown";
import { Brain, ExternalLink, LinkIcon } from "lucide-react";
import { Message as MessageType } from "ai";
import ImagesTool from "./ImagesTool";

interface MessageProps {
  message: MessageType;
}

const Message = ({ message }: MessageProps) => {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
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
                console.log(part.toolInvocation);

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

                return;
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
                  <>
                    <div
                      key={`${message.id}-${i}-source`}
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
                  </>
                );

              default:
                return null;
            }
          })}
      </div>
    </div>
  );
};

export default Message;
