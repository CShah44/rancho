"use client";

import { useState } from "react";
import {
  Brain,
  Quote as BookQuote,
  Video,
  Paperclip,
  SendHorizontal,
  Globe,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";

export default function Home() {
  const [mode, setMode] = useState("chat");
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error(error);
    },
    onFinish: (message) => {
      console.log(message);
    },
  });

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
          <div className="text-center space-y-4 flex-grow flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-white">Good evening.</h1>
            <p className="text-2xl text-zinc-400">
              I&apos;m Rancho and I&apos;m here to change how you learn.
            </p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto mb-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "p-4 rounded-lg max-w-[80%]",
                  message.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-zinc-800 text-white"
                )}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="whitespace-pre-wrap"
                        >
                          {part.text}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <div className="rounded-2xl bg-zinc-800/50 backdrop-blur-sm p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto">
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

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="What do you want to know?"
                value={input}
                onChange={handleInputChange}
                className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400"
              />
              <Button variant="ghost" size="icon">
                <Paperclip className="text-zinc-400" size={20} />
              </Button>
              <Button
                type="submit"
                className="bg-white hover:bg-white/90 text-black"
              >
                <SendHorizontal size={20} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
