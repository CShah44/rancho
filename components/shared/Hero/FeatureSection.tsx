import { motion } from "framer-motion";

const features = [
  {
    id: 1,
    title: "Visual Learning",
    description:
      "Every concept comes to life with custom animations and images that make complex topics easy to understand.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    ),
  },
  {
    id: 2,
    title: "Interactive Quizzes",
    description:
      "Test your knowledge with adaptive quizzes that adjust to your learning pace and help reinforce key concepts.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    ),
  },
  {
    id: 3,
    title: "All-in-One Interface",
    description:
      "No more juggling between apps. Get explanations, visualizations, and assessments all in one seamless experience.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    ),
  },
];

export default function FeatureSection() {
  return (
    <motion.div
      className="py-16 border-t border-zinc-700"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="text-3xl font-bold text-white text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        How RANCHO Transforms Learning
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

function FeatureCard({ title, description, icon, index }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700 h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: 0.2 * index,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)",
        borderColor: "rgba(99, 102, 241, 0.3)",
      }}
    >
      <motion.div
        className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4"
        whileHover={{
          scale: 1.1,
          backgroundColor: "rgba(99, 102, 241, 0.3)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {icon}
        </svg>
      </motion.div>
      <motion.h3
        className="text-xl font-bold text-white mb-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 + 0.2 * index }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-zinc-300"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 + 0.2 * index }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
