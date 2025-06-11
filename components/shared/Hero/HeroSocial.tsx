"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Sparkles } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Active Learners",
    color: "text-blue-400",
  },
  {
    icon: TrendingUp,
    value: "50K+",
    label: "Videos Generated",
    color: "text-green-400",
  },
  {
    icon: Award,
    value: "25K+",
    label: "Games Played",
    color: "text-purple-400",
  },
  {
    icon: Sparkles,
    value: "98%",
    label: "Satisfaction Rate",
    color: "text-amber-400",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    content:
      "Rancho turned complex anatomy into interactive 3D experiences. I finally understand!",
    avatar: "SC",
  },
  {
    name: "Alex Kumar",
    role: "High School Teacher",
    content:
      "My students are 10x more engaged. Physics has never been this fun to teach.",
    avatar: "AK",
  },
  {
    name: "Maya Patel",
    role: "Engineering Student",
    content:
      "The AI-generated games make learning algorithms feel like playing puzzles.",
    avatar: "MP",
  },
];

export default function HeroSocial() {
  return (
    <motion.section
      className="py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center group"
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-zinc-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Learners
            </span>
          </h2>
          <p className="text-xl text-zinc-400">
            Join thousands who&apos;ve transformed their learning experience
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                {testimonial.avatar}
              </div>
              <div>
                <div className="font-semibold text-white">
                  {testimonial.name}
                </div>
                <div className="text-sm text-zinc-400">{testimonial.role}</div>
              </div>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              &quot;{testimonial.content}&quot;
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
