"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroIntro() {
  const [showIntro, setShowIntro] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Initial logo reveal
    const phase1 = setTimeout(() => {
      setAnimationPhase(1);
    }, 1000);

    // Phase 3: Final animation before exit
    const phase3 = setTimeout(() => {
      setAnimationPhase(3);
    }, 2000);

    // Exit the intro
    const exitTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase3);
      clearTimeout(exitTimer);
    };
  }, []);

  // Split the text for letter animations
  const ranchoLetters = "RANCHO".split("");

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Background grid effect */}
          <GridBackground />

          {/* Animated particles */}
          <Particles animationPhase={animationPhase} />

          {/* Central content */}
          <motion.div
            className="text-center relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            exit={{
              scale: 1.2,
              opacity: 0,
              transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
            }}
          >
            {/* Logo with letter-by-letter animation */}
            <div className="flex justify-center overflow-hidden">
              {ranchoLetters.map((letter, index) => (
                <motion.span
                  key={index}
                  className="text-7xl md:text-[10rem] font-bold text-white tracking-tight inline-block relative"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    textShadow:
                      animationPhase >= 1
                        ? [
                            "0 0 10px rgba(99, 102, 241, 0.2)",
                            "0 0 30px rgba(99, 102, 241, 0.8)",
                            "0 0 10px rgba(99, 102, 241, 0.2)",
                          ]
                        : "0 0 0px rgba(99, 102, 241, 0)",
                  }}
                  transition={{
                    y: {
                      duration: 0.5,
                      delay: 0.1 + index * 0.08,
                      ease: [0.33, 1, 0.68, 1],
                    },
                    opacity: {
                      duration: 0.5,
                      delay: 0.1 + index * 0.08,
                    },
                    textShadow: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Final flourish animation */}
            {animationPhase >= 3 && (
              <motion.div
                className="absolute -z-10 inset-0 rounded-full bg-indigo-500/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.5],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.5, 1],
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Decorative floating particles component
function Particles({ animationPhase }: { animationPhase: number }) {
  const particles = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => {
        const size = Math.random() * 8 + 2;
        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 2;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-500/30"
            style={{
              width: size,
              height: size,
              left: `${initialX}%`,
              top: `${initialY}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: animationPhase >= 1 ? [0, 0.7, 0] : 0,
              x: animationPhase >= 1 ? [0, Math.random() * 100 - 50] : 0,
              y: animationPhase >= 1 ? [0, Math.random() * 100 - 50] : 0,
              scale: animationPhase >= 1 ? [0, 1, 0.5] : 0,
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        );
      })}
    </div>
  );
}

// Background grid effect
function GridBackground() {
  return (
    <motion.div
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1, delay: 0.5 }}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), rgba(0, 0, 0, 0) 60%)",
            "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), rgba(0, 0, 0, 0) 60%)",
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), rgba(0, 0, 0, 0) 60%)",
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  );
}
