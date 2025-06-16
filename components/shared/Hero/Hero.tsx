"use client";

import { motion } from "framer-motion";
import HeroIntro from "@/components/shared/Hero/HeroIntro";
import HeroMain from "@/components/shared/Hero/HeroMain";
import HeroDemo from "@/components/shared/Hero/HeroDemo";
import HeroFeatures from "@/components/shared/Hero/HeroFeatures";
import HeroPricing from "@/components/shared/Hero/HeroPricing";
import HeroFAQ from "./HeroFAQ";
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

          {/* Additional background elements for FAQ section */}
          <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-3000" />
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

          {/* FAQ Section */}
          <HeroFAQ />

          {/* Social Proof */}
          {/* <HeroSocial /> */}
        </motion.div>
      </div>
    </>
  );
}
