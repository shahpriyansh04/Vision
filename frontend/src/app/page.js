"use client";

import { motion } from "framer-motion";
import { Pacifico } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  BookOpen,
  Search,
  MessageCircleQuestion,
  NotebookPen,
  Link2,
  BrainCircuit,
  Rocket,
  Video,
  Zap,
  Timer,
  LayoutTemplate,
  GraduationCap,
  Database,
  TestTube2,
  Globe,
  Users,
  ChevronRight,
} from "lucide-react";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  const coreFeatures = [
    {
      title: "Multimodal AI Analysis",
      icon: <BrainCircuit className="w-8 h-8" />,
      description: "Simultaneous processing of audio, visuals, and transcripts",
    },
    {
      title: "Timestamped Q&A",
      icon: <Timer className="w-8 h-8" />,
      description: "Instant answers with direct video navigation",
    },
    {
      title: "Smart Note Generation",
      icon: <NotebookPen className="w-8 h-8" />,
      description: "Automated summaries & structured study guides",
    },
    {
      title: "Contextual Linking",
      icon: <Link2 className="w-8 h-8" />,
      description: "Related concepts and resource discovery",
    },
  ];

  const premiumFeatures = [
    {
      title: "Dynamic Knowledge Base",
      icon: <Database className="w-8 h-8" />,
      description: "Continuous updates from verified sources",
    },
    {
      title: "AI Test Generator",
      icon: <TestTube2 className="w-8 h-8" />,
      description: "Personalized quizzes based on content",
    },
    {
      title: "Collaborative Learning",
      icon: <Users className="w-8 h-8" />,
      description: "Shared notes and group discussions",
    },
    {
      title: "Global Resources",
      icon: <Globe className="w-8 h-8" />,
      description: "Multilingual content support",
    },
  ];

  const workflowSteps = [
    {
      title: "Content Ingestion",
      description: "Upload or link any educational video",
      icon: <Video className="w-8 h-8" />,
    },
    {
      title: "AI Processing",
      description: "Multimodal analysis and indexing",
      icon: <LayoutTemplate className="w-8 h-8" />,
    },
    {
      title: "Interactive Learning",
      description: "Engage with AI-enhanced tools",
      icon: <GraduationCap className="w-8 h-8" />,
    },
  ];

  return (
    <div className="bg-[#030303]">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">Vision</span>
          </div>
          <div className="space-x-6">
            <Link
              href="/login"
              className="text-white/80 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-purple-500/[0.05] blur-3xl" />

        <div className="absolute inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-blue-500/[0.15]"
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          />
          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-purple-500/[0.15]"
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-36 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/60">
                AI-Powered Learning Platform
              </span>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                  Transform Video Learning
                </span>
                <br />
                <span
                  className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white/90 to-purple-300",
                    pacifico.className
                  )}
                >
                  with AI Intelligence
                </span>
              </h1>
            </motion.div>

            <motion.div
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-lg text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                Revolutionize educational video consumption through AI-powered
                interactivity, intelligent navigation, and contextual knowledge
                integration.
              </p>
            </motion.div>

            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/demo"
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Watch Demo
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Start Free Trial
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              AI-Powered Learning Features
            </h2>
            <p className="text-xl text-white/60">
              Transform passive watching into active knowledge acquisition
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all"
              >
                <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-xl bg-purple-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-col lg:flex-row gap-12 items-center"
          >
            <div className="flex-1">
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-white/10"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Video className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-6">
                Seamless Learning Workflow
              </h3>
              <p className="text-white/60 mb-8">
                Our AI-enhanced pipeline transforms raw video content into
                interactive learning experiences through three simple steps:
              </p>
              <div className="space-y-6">
                {workflowSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -30 }}
                    whileInView={{ x: 0 }}
                    className="flex items-start gap-4 p-4 bg-white/5 rounded-xl"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-500/20">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">
                        {step.title}
                      </h4>
                      <p className="text-white/50">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Advanced Learning Tools
            </h2>
            <p className="text-xl text-white/60">
              Premium features for enhanced educational experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {premiumFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-xl bg-blue-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50">{feature.description}</p>
                <div className="mt-4 flex items-center gap-2 text-blue-400">
                  <span className="text-sm">Learn More</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Revolutionize Your Learning?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Join educators and students worldwide transforming their video
              learning experience
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/signup"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-semibold transition-all flex items-center gap-2 mx-auto"
              >
                <Rocket className="w-6 h-6" />
                Start Free Trial
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-white/60">
            <div>
              <h4 className="text-white font-semibold mb-4">Vision</h4>
              <p className="text-sm leading-relaxed">
                Empowering learners through AI-enhanced video education.
                Developed with ❤️ for accessible learning.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="hover:text-white">
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/50">
            © 2024 Vision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
