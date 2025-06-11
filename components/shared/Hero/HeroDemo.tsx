"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Gamepad2, Send, Bot, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const chatSequence = [
  {
    type: "user",
    message: "Can you explain photosynthesis with a video?",
    delay: 2000,
  },
  {
    type: "bot",
    message:
      "I'll create an interactive video explaining photosynthesis for you!",
    delay: 1500,
  },
  {
    type: "video",
    title: "Photosynthesis Process",
    description: "Interactive educational video",
    delay: 1500,
  },
  {
    type: "user",
    message: "Now make a game about it!",
    delay: 1500,
  },
  {
    type: "bot",
    message:
      "Creating a fun photosynthesis game where you'll manage plant growth!",
    delay: 1500,
  },
  {
    type: "game",
    title: "Plant Growth Simulator",
    description: "Interactive learning game",
    delay: 7000,
  },
];

export default function HeroDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<typeof chatSequence>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < chatSequence.length) {
        const currentMessage = chatSequence[currentStep];

        if (currentMessage.type === "bot") {
          setIsTyping(true);
          setTimeout(() => {
            setVisibleMessages((prev) => [...prev, currentMessage]);
            setIsTyping(false);
            setCurrentStep((prev) => prev + 1);
          }, 1500);
        } else {
          setVisibleMessages((prev) => [...prev, currentMessage]);
          setCurrentStep((prev) => prev + 1);
        }
      } else {
        // Reset animation after completion
        setTimeout(() => {
          setCurrentStep(0);
          setVisibleMessages([]);
          setIsTyping(false);
        }, 3000);
      }
    }, chatSequence[currentStep]?.delay || 1000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <motion.div
      className="flex-1 w-full max-w-lg"
      initial={{ opacity: 0, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{
        duration: 0.8,
        delay: 1.0,
        type: "spring",
        stiffness: 100,
      }}
    >
      <div className="relative">
        {/* Main Chat Container */}
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 to-zinc-800 flex flex-col">
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"
            animate={{
              background: [
                "linear-gradient(to bottom right, rgba(245, 158, 11, 0.05), rgba(249, 115, 22, 0.05))",
                "linear-gradient(to bottom right, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))",
                "linear-gradient(to bottom right, rgba(245, 158, 11, 0.05), rgba(249, 115, 22, 0.05))",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          {/* Chat Header */}
          <div className="relative z-10 flex-shrink-0 p-6 border-b border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Rancho AI</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-zinc-400">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div
            ref={chatContainerRef}
            className="relative z-10 flex-1 overflow-y-auto p-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <div className="space-y-4 min-h-full">
              <AnimatePresence>
                {visibleMessages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}

              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="relative z-10 flex-shrink-0 p-4 border-t border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 bg-zinc-700/50 rounded-2xl border border-zinc-600/50">
              <input
                type="text"
                placeholder="Ask me to create videos or games..."
                className="flex-1 bg-transparent text-white placeholder:text-zinc-400 outline-none text-sm min-w-0"
                disabled
              />
              <button className="flex-shrink-0 p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Demo Indicator */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400 mr-2 animate-pulse" />
            <span className="text-sm text-zinc-300">RANCHO in action</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ChatMessageProps {
  message: {
    type: string;
    message?: string;
    title?: string;
    description?: string;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl rounded-tr-md shadow-lg">
          <p className="text-sm font-medium">{message.message}</p>
        </div>
      </motion.div>
    );
  }

  if (message.type === "bot") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%] bg-zinc-700/60 text-zinc-200 p-4 rounded-2xl rounded-tl-md shadow-lg border border-zinc-600/30">
          <p className="text-sm">{message.message}</p>
        </div>
      </motion.div>
    );
  }

  if (message.type === "video" || message.type === "game") {
    const isVideo = message.type === "video";
    const Icon = isVideo ? Play : Gamepad2;
    const colorClass = isVideo
      ? "from-green-500 to-emerald-600"
      : "from-blue-500 to-cyan-600";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
        className="flex justify-start"
      >
        <div className="max-w-[85%] bg-zinc-800/60 border border-zinc-600/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg flex-shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-semibold text-sm truncate">
                {message.title}
              </h4>
              <p className="text-zinc-400 text-xs truncate">
                {message.description}
              </p>
            </div>
          </div>

          {/* Preview Area */}
          <div className="aspect-video bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: isVideo
                  ? [
                      "radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.1), transparent 50%)",
                      "radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.1), transparent 50%)",
                      "radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.1), transparent 50%)",
                    ]
                  : [
                      "radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.1), transparent 50%)",
                      "radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.1), transparent 50%)",
                      "radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.1), transparent 50%)",
                    ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />

            <motion.div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-xl`}
              animate={{
                scale: [1, 1.1, 1],
                rotate: isVideo ? [0, 0, 0] : [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Generation Effect */}
            <motion.div
              className="absolute inset-0 border-2 border-amber-400/30 rounded-xl"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Status */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-zinc-400">
                Generated successfully
              </span>
            </div>
            <span className="text-xs text-amber-400 font-medium">
              {isVideo ? "5 credits" : "10 credits"}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-start"
    >
      <div className="bg-zinc-700/60 p-4 rounded-2xl rounded-tl-md border border-zinc-600/30">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-zinc-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-400 ml-2">
            Rancho is thinking...
          </span>
        </div>
      </div>
    </motion.div>
  );
}
