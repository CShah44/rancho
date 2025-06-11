"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, Gamepad2 } from "lucide-react";
import SignIn from "@/components/shared/SignInButton";

export default function HeroMain() {
  return (
    <motion.div
      className="flex-1 space-y-8 text-center lg:text-left w-full"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Beta Badge */}
      <motion.div
        className="flex justify-center lg:justify-start"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-400 mr-2 animate-pulse" />
          <span className="text-sm font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Revolutionary Learning • Now Live (Beta)
          </span>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-none">
          <span className="block bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Learn
          </span>
          <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Visually
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed">
          Transform any concept into{" "}
          <span className="text-amber-400 font-semibold">
            interactive videos
          </span>{" "}
          and
          <span className="text-orange-400 font-semibold"> playable games</span>
          . Learning has never been this engaging.
        </p>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex items-center gap-2 text-zinc-400">
          <Play className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">AI-Generated Videos</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Gamepad2 className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium">Interactive Games</span>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <SignIn />
          </motion.div>
        </div>

        <p className="text-sm text-zinc-500">Join now! • Free to start</p>
      </motion.div>
    </motion.div>
  );
}
