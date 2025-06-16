"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Zap,
  CreditCard,
  Video,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    id: 1,
    icon: <Sparkles className="h-5 w-5 text-blue-500" />,
    question: "Is Rancho currently in beta?",
    answer:
      "Yes! Rancho is currently in beta phase. We're actively developing new features and improving the platform based on user feedback. Beta users get early access to cutting-edge AI capabilities, though some features may still be experimental. We appreciate your patience as we work to make Rancho the best AI learning platform.",
  },
  {
    id: 2,
    icon: <CreditCard className="h-5 w-5 text-green-500" />,
    question: "How does the credit system work?",
    answer:
      "Rancho uses a simple credit-based system. New users get 100 free credits to start. Video generation costs 5 credits, while game creation costs 10 credits. Credits never expire and can be purchased in flexible packages. All payments are processed securely through Razorpay with instant credit delivery.",
  },
  {
    id: 3,
    icon: <Video className="h-5 w-5 text-purple-500" />,
    question: "What if my video generation fails or doesn't meet expectations?",
    answer:
      "We understand that AI-generated content can sometimes be unpredictable. Credits are not charged for a failed video generation. For quality concerns, we're continuously improving our AI models. You can always try different prompts or contact our support team for assistance.",
  },
  {
    id: 4,
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    question: "How long does it take to generate content?",
    answer:
      "Generation times vary by content type and complexity. Videos typically take 2-5 minutes, while games may take 3-7 minutes. During beta, processing times may fluctuate as we optimize our systems. You'll receive real-time updates on your generation progress.",
  },
  {
    id: 5,
    icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    question: "What are the current limitations?",
    answer:
      "As a beta platform, Rancho has some limitations: video length is currently capped, certain complex game mechanics may not be supported, and generation quality can vary. Due to limited server capacity during beta, you may experience longer wait times or temporary unavailability if there's high user traffic. We're actively working to expand capabilities, improve consistency, and scale our infrastructure with each update.",
  },
  {
    id: 6,
    icon: <HelpCircle className="h-5 w-5 text-indigo-500" />,
    question: "How can I get the best results?",
    answer:
      "For optimal results: be specific and descriptive in your prompts, avoid overly complex requests, and experiment with different phrasings. Our AI works best with clear, detailed instructions. Check our prompt guides and examples for inspiration and best practices.",
  },
];

export default function HeroFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to know
          </h2>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            Get answers to common questions about Rancho&apos;s beta features,
            pricing, and how to get the most out of our AI platform.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-zinc-800/30 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-800 rounded-xl">{faq.icon}</div>
                  <h3 className="text-lg font-semibold text-white">
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openItems.includes(faq.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pl-16">
                      <p className="text-zinc-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-800/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            We&apos;re here to help! As a beta platform, we value your feedback
            and are always ready to assist with any questions or issues you
            might encounter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://forms.gle/bG9bowdb5qryo8yB6"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Contact Support
            </a>
          </div>{" "}
        </motion.div>
      </div>
    </section>
  );
}
