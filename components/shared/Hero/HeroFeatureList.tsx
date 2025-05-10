import { motion } from "framer-motion";

const features = [
  { id: 1, name: "Visual learning" },
  { id: 2, name: "Interactive quizzes" },
  { id: 3, name: "Personalized learning" },
];

export default function HeroFeatureList() {
  return (
    <motion.div
      className="pt-8 border-t border-zinc-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.8 }}
    >
      <div className="flex flex-wrap gap-6 items-center text-zinc-400">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.8 + index * 0.2 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{feature.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
