"use client";

import { motion } from "framer-motion";

export default function HeroDescription() {
  return (
    <motion.p
      className="text-xl text-zinc-300 max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      Experience learning like never before with visual animations, interactive
      quizzes and games - all in one intelligent platform.
    </motion.p>
  );
}
