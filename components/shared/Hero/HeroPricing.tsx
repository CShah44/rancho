"use client";

import { motion } from "framer-motion";
import { Check, Star, Coins, TrendingUp } from "lucide-react";

const plans = [
  {
    name: "Starter Pack",
    credits: 50,
    price: "₹99",
    popular: false,
    bestValue: false,
    features: ["10 Video Generations", "5 Game Generations"],
    color: "from-zinc-700 to-zinc-800",
    borderColor: "border-zinc-600",
  },
  {
    name: "Popular Pack",
    credits: 150,
    price: "₹249",
    popular: true,
    bestValue: false,
    features: ["30 Video Generations", "15 Game Generations"],
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500",
  },
  {
    name: "Pro Pack",
    credits: 350,
    price: "₹499",
    popular: false,
    bestValue: true,
    features: ["70 Video Generations", "35 Game Generations"],
    color: "from-green-500 to-emerald-600",
    borderColor: "border-green-500",
  },
  {
    name: "Business Pack",
    credits: 1000,
    price: "₹1,399",
    popular: false,
    bestValue: false,
    features: ["200 Video Generations", "100 Game Generations"],
    color: "from-purple-500 to-pink-600",
    borderColor: "border-purple-500",
  },
];

export default function HeroPricing() {
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
            <Coins className="w-4 h-4 text-amber-400 mr-2" />
            <span className="text-sm font-medium text-zinc-300">
              Simple Credit System
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start Learning for{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Free
            </span>
          </h2>

          <h3 className="text-neutral-300 mb-4">
            with 100 one-time credits on sign up!
          </h3>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Pay only for what you use. No subscriptions, no hidden fees.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative p-6 rounded-3xl border-2 ${
              plan.borderColor
            } bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${
              plan.popular ? "ring-2 ring-amber-500/50 shadow-amber-500/20" : ""
            } ${
              plan.bestValue
                ? "ring-2 ring-green-500/50 shadow-green-500/20"
                : ""
            }`}
          >
            {/* Badge */}
            {(plan.popular || plan.bestValue) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-black text-xs font-bold ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                >
                  {plan.popular ? (
                    <>
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Best Value
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-2xl font-bold text-white">
                  {plan.credits.toLocaleString()}
                </span>
                <span className="text-zinc-400 text-sm">credits</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {plan.price}
              </div>
              <div className="text-zinc-400 text-xs">One-time payment</div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-zinc-300 text-xs">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Razorpay Protected</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Instant Delivery</span>
          </div>
        </div>
        <p className="text-zinc-500 text-sm">
          Credits are added instantly to your account and never expire.
          <br />
          Video generation costs 5 credits • Game generation costs 10 credits
        </p>
      </motion.div>
    </motion.section>
  );
}
