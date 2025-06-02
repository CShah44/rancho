"use client";

import { useRef, useEffect, useState } from "react";
import { MessageCircle, Globe, X, GamepadIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Message from "./Message";
import { Loader2, Paperclip, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message as M } from "@ai-sdk/react";
import { toast } from "sonner";
import type { User } from "next-auth";
import PureChatHeader from "./chat-header";
import Image from "next/image";
import Link from "next/link";

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
      color: "text-yellow-500",
    },
    search: {
      icon: Globe,
      label: "Rancho on Web",
      color: "text-blue-500",
    },
    // reasoning: {
    //   icon: Brain,
    //   label: "Rancho Thinks",
    //   color: "text-green-500",
    // },
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      id: chatId,
      api: "/api/chat",
      initialMessages,
      body: {
        id: chatId,
        search: mode === "search",
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
      onToolCall: (tool) => {
        if (tool.toolCall.toolName === "video") {
          toast("Video generation might take up a few minutes.");
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
        greeting = "Morning, ";
      } else if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon, ";
      } else if (hour >= 17 && hour < 22) {
        greeting = "Evening, ";
      } else {
        greeting = "Nighty Night, ";
      }

      setTimeGreeting(greeting);
    };

    // Set initial greeting
    updateGreeting();

    // Update greeting if the component stays mounted across time boundaries
    const intervalId = setInterval(updateGreeting, 600000); // Check every minute

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

    // Cleanup function to revoke object URLs
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

  // Creative thinking animation
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
      <div className="flex justify-center">
        <div className="bg-zinc-800/80 backdrop-blur-sm p-4 rounded-lg max-w-[85%] shadow-lg border border-zinc-700/30">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="animate-pulse text-2xl">{dots[dotIndex]}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-zinc-200">
                Rancho is thinking...
              </div>
              <div className="text-xs text-zinc-400">
                Connecting neurons and gathering insights!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col min-w-0 h-dvh overflow-y-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      <PureChatHeader />
      {messages.length <= 0 ? (
        <div className="text-center space-y-6 flex-grow flex flex-col justify-center">
          <h1 className="text-6xl font-bold font-hover text-white font-grotesk tracking-tight">
            {timeGreeting} {user.name}!
          </h1>
          <p className="text-4xl text-zinc-400">
            I&apos;m Rancho and I&apos;m here to change how you learn.
          </p>
          <p className="text-zinc-500 italic text-sm">
            Rancho can make mistakes.
          </p>
        </div>
      ) : (
        <div
          className="flex-grow overflow-y-auto pb-4 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="space-y-6 py-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {status === "streaming" && <ThinkingAnimation />}
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

      <div className="rounded-2xl bg-zinc-800/50 backdrop-blur-sm p-4 m-4 shadow-xl border border-zinc-700/30">
        {filePreviews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {filePreviews.map((file) => (
              <div key={file.name} className="relative group">
                {file.type.startsWith("image/") ? (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-600">
                    <Image
                      width={64}
                      height={64}
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(file.name)}
                      className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove file"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-16 h-16 flex items-center justify-center bg-zinc-700 rounded-md border border-zinc-600">
                    <Paperclip size={20} className="text-zinc-400" />
                    <button
                      onClick={() => removeFile(file.name)}
                      className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove file"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                )}
                <div className="text-xs text-zinc-400 mt-1 truncate max-w-16">
                  {file.name.length > 12
                    ? `${file.name.substring(0, 10)}...`
                    : file.name}
                </div>
              </div>
            ))}
          </div>
        )}

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
          className="flex gap-2"
        >
          <Input
            placeholder="What do you want to learn?"
            value={input}
            onChange={handleInputChange}
            className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus-visible:ring-zinc-500 rounded-xl"
            disabled={status === "streaming"}
          />
          <Button
            className="hover:bg-zinc-300 rounded-2xl"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            type="button"
            disabled={files && files.length >= 5}
          >
            <Paperclip className="text-black" size={20} />
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
              placeholder="Upload files"
              accept="image/*,.pdf"
            />
          </Button>{" "}
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
        <div className="flex items-center justify-between gap-2 mt-3 overflow-x-auto">
          <div className="flex h-[40px] bg-zinc-700/50 rounded-full p-1">
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

          {/* Game generation button */}
          <Link href="/game">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-100 border border-purple-500/30"
            >
              <GamepadIcon size={18} className="text-purple-400" />
              <span>Generate Game</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Chat;
