import { motion } from "framer-motion";
import SignIn from "@/components/shared/SignInButton";

export default function HeroSignIn() {
  return (
    <motion.div
      className="pt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5 }}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <SignIn />
        </motion.div>
        <p className="text-zinc-400 text-sm">
          Start learning smarter, not harder. Join in seconds.
        </p>
      </div>
    </motion.div>
  );
}
