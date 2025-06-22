"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Brain,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  Star,
  Rocket,
  Heart,
} from "lucide-react";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = mounted && theme === "dark";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/workspaces" });
    } catch (error) {
      setError(
        "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo."
      );
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen ${
        isDark ? "bg-[#0A0A0F] text-white" : "bg-[#FAFBFC] text-gray-900"
      } overflow-hidden relative`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isDark
              ? "from-blue-900/30 via-purple-900/20 to-pink-900/30"
              : "from-blue-50/80 via-purple-50/60 to-pink-50/80"
          }`}
        />

        {/* Animated Orbs */}
        <motion.div
          animate={floatingAnimation}
          className={`absolute -top-40 -right-40 w-96 h-96 ${
            isDark ? "bg-blue-500/20" : "bg-blue-400/20"
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1.5 },
          }}
          className={`absolute top-1/2 -left-40 w-80 h-80 ${
            isDark ? "bg-purple-500/20" : "bg-purple-400/20"
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 3 },
          }}
          className={`absolute bottom-20 right-1/4 w-64 h-64 ${
            isDark ? "bg-pink-500/20" : "bg-pink-400/20"
          } rounded-full blur-3xl`}
        />

        {/* Grid Pattern */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPC9zdmc+')] opacity-20"
              : "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzk5OTk5OSIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPC9zdmc+')] opacity-30"
          }`}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-10 h-10 ${
                  isDark
                    ? "bg-gradient-to-br from-blue-500 to-purple-600"
                    : "bg-gradient-to-br from-blue-600 to-purple-700"
                } rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <span
              className={`text-2xl font-bold bg-gradient-to-r ${
                isDark
                  ? "from-blue-400 to-purple-400"
                  : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent`}
            >
              FlashMind AI
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/">
              <Button
                variant="ghost"
                className={`${
                  isDark
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-all duration-300`}
              >
                <span>Volver al Inicio</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-40 container mx-auto px-6 min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Welcome Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="flex justify-start">
                <div
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                    isDark
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                      : "bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200"
                  } backdrop-blur-sm`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isDark ? "text-pink-400" : "text-pink-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-pink-300" : "text-pink-700"
                    }`}
                  >
                    Bienvenido de Vuelta
                  </span>
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.div variants={fadeInUp} className="space-y-6">
                <h1
                  className={`text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r ${
                    isDark
                      ? "from-white via-blue-200 to-purple-200"
                      : "from-gray-900 via-blue-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                >
                  Continúa tu
                  <br />
                  <span className="relative">
                    Aventura
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 1 }}
                      className={`absolute bottom-2 left-0 h-2 ${
                        isDark
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gradient-to-r from-blue-400 to-purple-400"
                      } rounded-full`}
                    />
                  </span>
                </h1>

                <p
                  className={`text-xl md:text-2xl max-w-2xl leading-relaxed ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Accede a tus workspaces, continúa estudiando con tus
                  flashcards y sigue mejorando con la ayuda de la IA.
                </p>
              </motion.div>

              {/* Features Preview */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8"
              >
                {[
                  { icon: Rocket, label: "Acceso Instantáneo", color: "blue" },
                  { icon: Users, label: "Colaboración", color: "purple" },
                  { icon: Brain, label: "IA Avanzada", color: "pink" },
                  {
                    icon: Sparkles,
                    label: "Progreso Continuo",
                    color: "green",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className={`flex items-center space-x-3 p-3 rounded-xl ${
                      isDark
                        ? "bg-white/5 backdrop-blur-sm border border-white/10"
                        : "bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm"
                    }`}
                  >
                    <feature.icon
                      className={`w-5 h-5 ${
                        feature.color === "blue"
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : feature.color === "purple"
                          ? isDark
                            ? "text-purple-400"
                            : "text-purple-600"
                          : feature.color === "pink"
                          ? isDark
                            ? "text-pink-400"
                            : "text-pink-600"
                          : isDark
                          ? "text-green-400"
                          : "text-green-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {feature.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div
                  className={`relative ${
                    isDark
                      ? "bg-gray-900/80 border border-gray-800/50"
                      : "bg-white/90 border border-gray-200/50 shadow-2xl"
                  } rounded-3xl p-8 backdrop-blur-xl`}
                >
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center`}
                    >
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2
                      className={`text-3xl font-bold mb-3 bg-gradient-to-r ${
                        isDark
                          ? "from-white to-gray-300"
                          : "from-gray-900 to-gray-600"
                      } bg-clip-text text-transparent`}
                    >
                      Acceder a FlashMind
                    </h2>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Inicia sesión o crea tu cuenta para comenzar
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-6 p-4 rounded-xl ${
                        isDark
                          ? "bg-red-500/20 border border-red-500/30 text-red-200"
                          : "bg-red-50 border border-red-200 text-red-600"
                      } text-sm flex items-center space-x-2`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Social Login Buttons */}
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`w-full ${
                        isDark
                          ? "border-gray-700 hover:bg-white/5 text-white"
                          : "border-gray-300 hover:bg-gray-50 text-gray-700"
                      } transition-all duration-300 py-6 group`}
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                          />
                        </svg>
                        <span className="font-medium">
                          Continuar con Google
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className={`w-full ${
                        isDark
                          ? "border-gray-700 hover:bg-white/5 text-white"
                          : "border-gray-300 hover:bg-gray-50 text-gray-700"
                      } transition-all duration-300 py-6 group`}
                      onClick={() => handleSocialLogin("github")}
                      disabled={isLoading}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                          />
                        </svg>
                        <span className="font-medium">
                          Continuar con GitHub
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="mt-6 flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Iniciando sesión...
                      </span>
                    </div>
                  )}

                  {/* Info Text */}
                  <div className="mt-8 text-center">
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } text-sm`}
                    >
                      Al continuar, se creará automáticamente tu cuenta si es la
                      primera vez que accedes
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-gray-200/20">
                    <div className="flex items-center justify-center space-x-6 text-xs">
                      <div className="flex items-center space-x-1">
                        <Shield
                          className={`w-3 h-3 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        />
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-600"}
                        >
                          Seguro
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap
                          className={`w-3 h-3 ${
                            isDark ? "text-yellow-400" : "text-yellow-600"
                          }`}
                        />
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-600"}
                        >
                          Rápido
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart
                          className={`w-3 h-3 ${
                            isDark ? "text-pink-400" : "text-pink-600"
                          }`}
                        />
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-600"}
                        >
                          Confiable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
