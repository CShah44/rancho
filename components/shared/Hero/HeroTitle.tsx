import { motion } from "framer-motion";

export default function HeroTitle() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="space-y-4"
    >
      <motion.h1
        className="text-4xl md:text-5xl lg:text-9xl font-bold text-white tracking-tight"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        }}
      >
        <motion.span
          className="block"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          RANCHO
        </motion.span>
        <motion.span
          className="block text-indigo-200 text-5xl font-normal"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          I&apos;m here to change the way you learn.
        </motion.span>
      </motion.h1>
    </motion.div>
  );
}
