"use client";

import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Quote as BookQuote,
  Video,
  Paperclip,
  SendHorizontal,
  Globe,
  LinkIcon,
  MessageCircle,
  Loader2,
  // StopCircle,
  ChartArea,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { MemoizedMarkdown } from "@/components/shared/memoized-markdown";
import Image from "next/image";

export default function Home() {
  const [mode, setMode] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    // stop,
  } = useChat({
    id: "chat",
    api: "/api/chat",
    body: {
      search: mode === "search",
    },
    onError: (error) => {
      console.error(error.message);
    },
    onToolCall: (toolCall) => {
      console.log(toolCall.toolCall.toolName);
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const modes = {
    chat: {
      icon: MessageCircle,
      label: "Chat",
      color: "text-yellow-500",
    },
    search: {
      icon: Globe,
      label: "Search",
      color: "text-blue-500",
    },
    reasoning: {
      icon: Brain,
      label: "Reasoning",
      color: "text-green-500",
    },
    quiz: {
      icon: BookQuote,
      label: "Quiz",
      color: "text-purple-500",
    },
    video: {
      icon: Video,
      label: "Video",
      color: "text-red-500",
    },
  };

  return (
    <main className="min-h-screen bg-zinc-900 flex flex-col items-center px-4">
      <div className="w-full max-w-4xl flex flex-col h-screen pt-8 pb-4">
        {messages.length <= 0 ? (
          <div className="text-center space-y-6 flex-grow flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-white font-grotesk tracking-tight">
              Good evening.
            </h1>
            <p className="text-2xl text-zinc-400">
              I&apos;m Rancho and I&apos;m here to change how you learn.
            </p>
            <div className="flex justify-center mt-8">
              <div className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded-full">
                {Object.entries(modes).map(([key, value]) => {
                  const Icon = value.icon;
                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className="mx-1 rounded-full hover:bg-zinc-700/50"
                    >
                      <Icon className={value.color} size={20} />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex-grow overflow-y-auto mb-4 px-2"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="space-y-6 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
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
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="prose max-w-none"
                            >
                              {/* <Markdown text={part.text} /> */}
                              <MemoizedMarkdown
                                content={part.text}
                                id={message.id}
                              />
                            </div>
                          );
                        case "tool-invocation":
                          console.log(part.toolInvocation);
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="flex items-center space-x-2 space-y-1"
                            >
                              <ChartArea size={16} />
                              <div className="text-sm text-zinc-400">
                                {part.toolInvocation.state === "result" && (
                                  <Image
                                    src={`data:image/png;base64,${part.toolInvocation.result[0].png}`}
                                    width={500}
                                    height={100}
                                    alt="result"
                                  />
                                )}
                              </div>
                            </div>
                          );
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
                          if (!part.source) return null;
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="flex items-center space-x-2 space-y-1"
                            >
                              <LinkIcon size={16} />
                              <a
                                href={part.source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-zinc-400 hover:underline"
                              >
                                {part.source.title}
                              </a>
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))}
              {status === "streaming" && (
                <div className="flex justify-center">
                  <div className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded-lg max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin" size={20} />
                      <div className="text-sm text-zinc-400">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg max-w-[85%]">
                    An error occurred. Please try again.
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="relative">
          <div className="rounded-2xl bg-zinc-800/50 backdrop-blur-sm p-4 shadow-xl border border-zinc-700/30">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="What do you want to know?"
                value={input}
                onChange={handleInputChange}
                className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus-visible:ring-zinc-500 rounded-xl"
                disabled={status === "streaming"}
              />
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-zinc-700/50 rounded-xl"
                type="button"
              >
                <Paperclip className="text-zinc-400" size={20} />
              </Button>
              <Button
                type="submit"
                className="bg-white hover:bg-white/90 text-black rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                disabled={status === "streaming" || !input.trim()}
              >
                {status === "streaming" ? (
                  <Loader2 size={20} />
                ) : (
                  <SendHorizontal size={20} />
                )}
              </Button>
            </form>
            <div className="flex items-center gap-2 mt-3 overflow-x-auto">
              <div className="flex bg-zinc-700/50 rounded-full p-1">
                {Object.entries(modes).map(([key, value]) => {
                  const isActive = mode === key;
                  const Icon = value.icon;

                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 rounded-full transition-all",
                        isActive
                          ? "bg-zinc-600 text-white"
                          : "hover:bg-zinc-600/50 text-zinc-400"
                      )}
                      onClick={() => setMode(key)}
                    >
                      <Icon className={isActive ? value.color : ""} size={18} />
                      <span>{value.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
