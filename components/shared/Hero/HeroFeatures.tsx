"use client";

import { motion } from "framer-motion";
import { Play, Gamepad2, Brain, Sparkles } from "lucide-react";

const features = [
  {
    icon: Play,
    title: "AI Video Generation",
    description:
      "Transform any concept into stunning educational animations in seconds",
    color: "from-amber-400 to-orange-500",
    bgColor: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Gamepad2,
    title: "Interactive Games",
    description: "Learn through play with custom games tailored to your topic",
    color: "from-blue-400 to-cyan-500",
    bgColor: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Brain,
    title: "Smart Learning",
    description:
      "Rancho leverages creative learning techniques to boost retention",
    color: "from-purple-400 to-pink-500",
    bgColor: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20",
  },
];

export default function HeroFeatures() {
  return (
    <motion.section
      className="py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-700 border border-zinc-600/50 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400 mr-2" />
            <span className="text-sm font-medium text-zinc-300">
              Powered by AI
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Learning,{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h2>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Experience the future of education with AI-powered visual learning
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative group p-8 rounded-3xl bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
            >
              <feature.icon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">
              {feature.title}
            </h3>

            <p className="text-zinc-400 leading-relaxed">
              {feature.description}
            </p>

            {/* Hover effect */}
            <div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
