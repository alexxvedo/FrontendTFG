"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  return (
    <main
      className={`min-h-screen ${
        isDark ? "bg-[#0A0A0F] text-white" : "bg-[#F8F9FC] text-gray-800"
      } overflow-hidden`}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          isDark
            ? "from-blue-900/20 via-purple-900/20 to-pink-900/20"
            : "from-blue-100/40 via-purple-100/40 to-pink-100/40"
        } animate-gradient`}
      />

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-96 h-96 ${
            isDark ? "bg-blue-600/30" : "bg-blue-300/30"
          } rounded-full blur-3xl animate-float`}
        />
        <div
          className={`absolute top-1/2 -left-40 w-96 h-96 ${
            isDark ? "bg-purple-600/20" : "bg-purple-300/20"
          } rounded-full blur-3xl animate-float-delayed`}
        />
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div
                  className={`absolute inset-0 ${
                    isDark ? "bg-blue-500/50" : "bg-blue-400/50"
                  } blur-sm rounded-full`}
                />
                <span
                  className={`relative text-2xl font-bold bg-gradient-to-r ${
                    isDark
                      ? "from-blue-400 to-purple-400"
                      : "from-blue-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                >
                  FlashMind AI
                </span>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <Link href="/register">
                <Button
                  className={`bg-gradient-to-r from-blue-500 to-purple-500 ${
                    !isDark && "text-white"
                  } hover:opacity-90 transition-all`}
                >
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Login Form */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <motion.div
              {...fadeIn}
              className={`relative ${
                isDark ? "bg-[#0F0F16]/90" : "bg-white shadow-lg"
              } p-8 rounded-2xl overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  isDark
                    ? "from-blue-500/5 to-purple-500/5"
                    : "from-blue-100/10 to-purple-100/10"
                }`}
              />
              <div className="relative">
                <h2
                  className={`text-3xl font-bold mb-6 bg-gradient-to-r ${
                    isDark
                      ? "from-white via-blue-200 to-purple-200"
                      : "from-blue-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                >
                  Iniciar Sesión
                </h2>

                {error && (
                  <div
                    className={`mb-4 p-3 ${
                      isDark
                        ? "bg-red-500/20 border border-red-500/50 text-red-200"
                        : "bg-red-100 border border-red-300 text-red-600"
                    } rounded-lg text-sm`}
                  >
                    {error}
                  </div>
                )}

                <div className="text-center mb-8">
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Inicia sesión con tu cuenta de redes sociales para continuar
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className={`w-full ${
                      isDark
                        ? "border-gray-700 hover:bg-white/5"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    } transition-all py-6`}
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Continuar con Google
                  </Button>

                  <Button
                    variant="outline"
                    className={`w-full ${
                      isDark
                        ? "border-gray-700 hover:bg-white/5"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    } transition-all py-6`}
                    onClick={() => handleSocialLogin("github")}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    Continuar con GitHub
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } text-sm`}
                  >
                    ¿No tienes una cuenta?{" "}
                    <Link
                      href="/register"
                      className={`${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-500"
                      }`}
                    >
                      Regístrate
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
