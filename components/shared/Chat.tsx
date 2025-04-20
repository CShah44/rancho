"use client";

import { useRef, useEffect, useState } from "react";
import {
  Brain,
  Quote as BookQuote,
  Video,
  MessageCircle,
  Globe,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Message from "./Message";
import { Loader2, Paperclip, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const Chat = () => {
  const [mode, setMode] = useState("chat");

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      id: "chat",
      api: "/api/chat",
      body: {
        search: mode === "search",
      },
      onError: (error) => {
        console.error(error.message);
      },
    });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {messages.length <= 0 ? (
        <div className="text-center space-y-6 flex-grow flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white font-grotesk tracking-tight">
            Good evening.
          </h1>
          <p className="text-2xl text-zinc-400">
            I&apos;m Rancho and I&apos;m here to change how you learn.
          </p>
        </div>
      ) : (
        <div
          className="flex-grow overflow-y-auto mb-4 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="space-y-6 py-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
