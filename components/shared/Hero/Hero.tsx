"use client";

import { motion } from "framer-motion";
import HeroIntro from "@/components/shared/Hero/HeroIntro";
import HeroMain from "@/components/shared/Hero/HeroMain";
import HeroDemo from "@/components/shared/Hero/HeroDemo";
import HeroFeatures from "@/components/shared/Hero/HeroFeatures";
import HeroPricing from "@/components/shared/Hero/HeroPricing";
import HeroFAQ from "./HeroFAQ";
import Image from "next/image";
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

          {/* ProductHunt Launch Section */}
          <motion.div
            className="py-16 md:py-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🚀 We&apos;re Live on Product Hunt!
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                Help us reach the top by showing your support. Every vote
                counts!
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
              {/* ProductHunt Card */}
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <iframe
                    style={{ border: "none" }}
                    src="https://cards.producthunt.com/cards/products/1076425"
                    width="500"
                    height="405"
                    frameBorder="0"
                    scrolling="no"
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </motion.div>

              {/* ProductHunt Badge */}
              <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Vote for Rancho
                  </h3>
                  <p className="text-zinc-400 mb-6 max-w-xs">
                    Join our community and help us revolutionize learning with
                    AI
                  </p>
                </div>

                <a
                  href="https://www.producthunt.com/products/rancho-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-rancho&#0045;2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105 active:scale-95"
                >
                  <Image
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=978517&theme=light&t=1750057679660"
                    alt="Rancho - Reimagine learning with AI. Play. Watch. Master. | Product Hunt"
                    style={{ width: "250px", height: "54px" }}
                    width="250"
                    height="54"
                    className="rounded-lg shadow-lg"
                  />
                </a>

                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>✨</span>
                  <span>Click to support us on Product Hunt</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

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
