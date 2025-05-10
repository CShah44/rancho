"use client";

import { motion } from "framer-motion";
import HeroIntro from "@/components/shared/Hero/HeroIntro";
import HeroTitle from "@/components/shared/Hero/HeroTitle";
import HeroDescription from "@/components/shared/Hero/HeroDescription";
import HeroSignIn from "@/components/shared/Hero/HeroSignIn";
import HeroFeatureList from "@/components/shared/Hero/HeroFeatureList";
import HeroDemo from "@/components/shared/Hero/HeroDemo";
import FeatureSection from "@/components/shared/Hero/FeatureSection";

export default function Hero() {
  return (
    <>
      <HeroIntro />
      <motion.div
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between py-16 md:py-24 gap-12">
          {/* Hero Left Side - Text Content */}
          <motion.div
            className="flex-1 space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <HeroTitle />
            <HeroDescription />
            <HeroSignIn />
            <HeroFeatureList />
          </motion.div>

          {/* Hero Right Side - Demo Visualization */}
          <HeroDemo />
        </div>

        {/* Features Section */}
        <FeatureSection />
      </motion.div>
    </>
  );
}
