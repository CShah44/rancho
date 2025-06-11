"use client";

import { motion } from "framer-motion";
import HeroIntro from "@/components/shared/Hero/HeroIntro";
import HeroMain from "@/components/shared/Hero/HeroMain";
import HeroDemo from "@/components/shared/Hero/HeroDemo";
import HeroFeatures from "@/components/shared/Hero/HeroFeatures";
import HeroPricing from "@/components/shared/Hero/HeroPricing";
// import HeroSocial from "@/components/shared/Hero/HeroSocial";

export default function Hero() {
  return (
    <>
      <HeroIntro />
      <div className="w-full min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Main Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between py-16 md:py-24 gap-16">
            <HeroMain />
            <HeroDemo />
          </div>

          {/* Features Section */}
          <HeroFeatures />

          {/* Pricing Section */}
          <HeroPricing />

          {/* Social Proof */}
          {/* <HeroSocial /> */}
        </motion.div>
      </div>
    </>
  );
}
