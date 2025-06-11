"use client";

import { useRef, useEffect, useState } from "react";
import { MessageCircle, Globe, X, StopCircle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Message from "./Message";
import { Paperclip, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message as M } from "@ai-sdk/react";
import { toast } from "sonner";
import type { User } from "next-auth";
import PureChatHeader from "./chat-header";
import Image from "next/image";

interface ChatProps {
  user: User;
  chatId?: string;
  initialMessages?: M[];
}

const Chat = ({ user, chatId, initialMessages = [] }: ChatProps) => {
  const [mode, setMode] = useState("chat");
  const [timeGreeting, setTimeGreeting] = useState("Good day");

  // for file uploads
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [filePreviews, setFilePreviews] = useState<
    { name: string; url: string; type: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = {
    chat: {
      icon: MessageCircle,
      label: "Rancho",
      color: "text-amber-400",
    },
    search: {
      icon: Globe,
      label: "Rancho on Web",
      color: "text-blue-400",
    },
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    stop,
  } = useChat({
    id: chatId,
    api: "/api/chat",
    initialMessages,
    body: {
      id: chatId,
      search: mode === "search",
    },
    onError: (e) => {
      console.log(e);
      toast.error("Something went wrong. Please try again.");
    },
    onToolCall: (tool) => {
      if (tool.toolCall.toolName === "video") {
        toast("Video generation might take up a few minutes.");
      }
      if (tool.toolCall.toolName === "game") {
        toast("Always read the instructions carefully before playing!");
      }
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Set greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let greeting = "Good day";

      if (hour >= 5 && hour < 12) {
        greeting = "Good morning";
      } else if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon";
      } else if (hour >= 17 && hour < 22) {
        greeting = "Good evening";
      } else {
        greeting = "Good night";
      }

      setTimeGreeting(greeting);
    };

    updateGreeting();
    const intervalId = setInterval(updateGreeting, 600000);
    return () => clearInterval(intervalId);
  }, []);

  // Generate previews when files are selected
  useEffect(() => {
    if (!files) {
      setFilePreviews([]);
      return;
    }

    const previews = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return {
        name: file.name,
        url,
        type: file.type,
      };
    });

    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const removeFile = (fileName: string) => {
    if (!files) return;

    const dataTransfer = new DataTransfer();

    Array.from(files).forEach((file) => {
      if (file.name !== fileName) {
        dataTransfer.items.add(file);
      }
    });

    setFiles(dataTransfer.files.length > 0 ? dataTransfer.files : undefined);

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  // Enhanced thinking animation
  const ThinkingAnimation = () => {
    const dots = ["⚙️", "💡", "🧠", "✨", "🔍"];
    const [dotIndex, setDotIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setDotIndex((prev) => (prev + 1) % dots.length);
      }, 400);

      return () => clearInterval(interval);
    }, [dots.length]);

    return (
      <div className="flex justify-center px-3 sm:px-4">
        <div className="bg-zinc-800/90 backdrop-blur-sm p-3 sm:p-4 rounded-2xl max-w-[90%] sm:max-w-[85%] shadow-lg border border-zinc-700/40">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="animate-pulse text-xl sm:text-2xl">
                {dots[dotIndex]}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm sm:text-base font-medium text-zinc-200">
                Rancho is thinking...
              </div>
              <div className="text-xs sm:text-sm text-zinc-400">
                Connecting neurons and gathering insights!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <PureChatHeader />

      {messages.length <= 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-grotesk tracking-tight leading-tight">
              {timeGreeting}, {user.name}!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-300 max-w-4xl mx-auto leading-relaxed">
              I&apos;m Rancho and I&apos;m here to change how you learn.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 italic mt-4 sm:mt-6">
            Rancho can make mistakes. Please verify important information.
          </p>
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 ">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {status === "streaming" && <ThinkingAnimation />}
            {error && (
              <div className="flex justify-center px-3 sm:px-4">
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 sm:p-4 rounded-xl max-w-[90%] sm:max-w-[85%] text-sm sm:text-base">
                  An error occurred. Please try again.
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Enhanced input area */}
      <div className="border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="bg-zinc-800/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-zinc-700/40 shadow-2xl">
            {/* File previews */}
            {filePreviews.length > 0 && (
              <div className="p-3 sm:p-4 border-b border-zinc-700/30">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {filePreviews.map((file) => (
                    <div key={file.name} className="relative group">
                      {file.type.startsWith("image/") ? (
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-zinc-600/50">
                          <Image
                            width={64}
                            height={64}
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile(file.name)}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                            aria-label="Remove file"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-zinc-700/60 rounded-lg border border-zinc-600/50">
                          <Paperclip size={16} className="text-zinc-400" />
                          <button
                            onClick={() => removeFile(file.name)}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                            aria-label="Remove file"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      )}
                      <div className="text-xs text-zinc-400 mt-1 truncate max-w-16 text-center">
                        {file.name.length > 8
                          ? `${file.name.substring(0, 6)}...`
                          : file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form
              onSubmit={(event) => {
                handleSubmit(event, {
                  experimental_attachments: files,
                });
                setFiles(undefined);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="flex gap-2 sm:gap-3 p-3 sm:p-4"
            >
              <Input
                placeholder="What would you like to learn today?"
                value={input}
                onChange={handleInputChange}
                className="bg-zinc-700/40 border-zinc-600/50 text-white placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 rounded-xl sm:rounded-2xl text-sm sm:text-base h-10 sm:h-12 transition-all duration-200"
                disabled={status === "streaming"}
              />

              <Button
                className="hover:bg-zinc-600/80 rounded-xl sm:rounded-2xl border border-zinc-600/50 bg-zinc-700/60 h-10 sm:h-12 px-3 sm:px-4 transition-all duration-200"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                type="button"
                disabled={files && files.length >= 5}
              >
                <Paperclip className="text-zinc-300" size={18} />
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && (!files || files.length < 5)) {
                      handleFileChange(e);
                    }
                  }}
                  multiple
                  hidden
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                />
              </Button>

              {status === "streaming" ? (
                <Button onClick={() => stop()}>
                  <StopCircle
                    className="text-red-500"
                    size={18}
                    aria-label="Stop generation"
                  />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-medium rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 h-10 sm:h-12 px-4 sm:px-6"
                  disabled={status === "submitted"}
                >
                  <SendHorizontal size={18} />
                </Button>
              )}
            </form>

            {/* Mode selector */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="flex h-9 sm:h-10 rounded-full p-1">
                {Object.entries(modes).map(([key, value]) => {
                  const isActive = mode === key;
                  const Icon = value.icon;

                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 rounded-full transition-all duration-200 text-xs sm:text-sm h-7 sm:h-8 px-3 sm:px-4",
                        isActive
                          ? "bg-zinc-600/80 text-white shadow-sm"
                          : "hover:bg-zinc-600/40 text-zinc-400 hover:text-zinc-200"
                      )}
                      onClick={() => setMode(key)}
                    >
                      <Icon className={isActive ? value.color : ""} size={16} />
                      <span className="hidden sm:inline">{value.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
