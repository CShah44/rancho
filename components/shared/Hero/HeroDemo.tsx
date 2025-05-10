import { motion } from "framer-motion";

export default function HeroDemo() {
  return (
    <motion.div
      className="flex-1 w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 2.2,
        type: "spring",
        stiffness: 100,
      }}
    >
      <div className="relative w-full h-[550px] rounded-lg overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-800">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 z-0"
          animate={{
            background: [
              "linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2))",
              "linear-gradient(to bottom right, rgba(79, 70, 229, 0.2), rgba(147, 51, 234, 0.2))",
              "linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2))",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        ></motion.div>
        <div className="relative z-10 p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <motion.div
              className="w-3 h-3 rounded-full bg-red-500"
              whileHover={{ scale: 1.2 }}
            ></motion.div>
            <motion.div
              className="w-3 h-3 rounded-full bg-yellow-500"
              whileHover={{ scale: 1.2 }}
            ></motion.div>
            <motion.div
              className="w-3 h-3 rounded-full bg-green-500"
              whileHover={{ scale: 1.2 }}
            ></motion.div>
          </div>
          <div className="flex-1 flex flex-col space-y-4">
            <ChatMessage
              type="bot"
              content="How can I help with your studies today?"
              delay={2.5}
            />
            <ChatMessage
              type="user"
              content="Can you explain photosynthesis with a visual?"
              delay={3.2}
            />
            <ChatMessage
              type="bot"
              content={
                <>
                  <p>
                    Of course! Here&apos;s a visual explanation of
                    photosynthesis:
                  </p>
                  <div className="mt-2 bg-indigo-900/30 rounded-md p-3 text-center">
                    <div className="relative aspect-video bg-black/40 rounded overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
                      <motion.div
                        className="w-12 h-12 rounded-full bg-indigo-500/50 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(99, 102, 241, 0.7)",
                            "0 0 0 10px rgba(99, 102, 241, 0)",
                            "0 0 0 0 rgba(99, 102, 241, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                      <div className="absolute bottom-2 left-2 text-xs text-white/70">
                        Photosynthesis Process
                      </div>
                    </div>
                  </div>
                </>
              }
              delay={4.0}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ChatMessageProps {
  type: "bot" | "user";
  content: React.ReactNode;
  delay: number;
}

function ChatMessage({ type, content, delay }: ChatMessageProps) {
  return (
    <motion.div
      className={`${
        type === "bot"
          ? "bg-zinc-700/50 text-zinc-200 max-w-[80%]"
          : "bg-indigo-500/30 text-zinc-200 max-w-[80%] self-end"
      } p-3 rounded-lg`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      {content}
    </motion.div>
  );
}
