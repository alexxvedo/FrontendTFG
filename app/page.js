"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Users,
  FileText,
  MessageSquare,
  Sparkles,
  Activity,
  BarChart,
  Clock,
  Zap,
  Book,
  Layers,
  PenTool,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  // Use a state to track if the component has mounted
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  
  // Only access theme after component has mounted to prevent hydration mismatch
  const isDark = mounted && theme === "dark";

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  // If not mounted yet, return a pre-rendered version with dark theme (matching your design system)
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
        {/* Pre-rendered content with dark theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-gradient" />
        <div className="absolute inset-0 overflow-hidden">
          {/* Loading state or minimal UI */}
        </div>
      </main>
    );
  }

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
              {session?.user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Hola, </span>
                    <span className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {session.user.name}
                    </span>
                  </div>
                  <Link href="/workspaces">
                    <Button
                      className={`bg-gradient-to-r from-blue-500 to-purple-500 ${
                        !isDark && "text-white"
                      } hover:opacity-90 transition-all`}
                    >
                      Acceder a Workspaces
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className={`${
                        isDark
                          ? "text-white hover:bg-white/10"
                          : "text-gray-700 hover:bg-gray-200/50"
                      } transition-all`}
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className={`bg-gradient-to-r from-blue-500 to-purple-500 ${
                        !isDark && "text-white"
                      } hover:opacity-90 transition-all`}
                    >
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn} className="space-y-8">
              <h1
                className={`text-6xl font-bold leading-tight bg-gradient-to-r ${
                  isDark
                    ? "from-white via-blue-200 to-purple-200"
                    : "from-blue-600 to-purple-600"
                } bg-clip-text text-transparent`}
              >
                Aprende Mejor, Juntos
              </h1>
              <p
                className={`text-xl ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } leading-relaxed`}
              >
                Crea workspaces colaborativos, genera flashcards con IA, estudia
                con repetición espaciada y analiza tu progreso en tiempo real.
              </p>
              <div className="flex items-center space-x-6">
                <Button
                  className={`bg-gradient-to-r from-blue-500 to-purple-500 ${
                    !isDark && "text-white"
                  } hover:opacity-90 transition-all px-8 py-6 text-lg`}
                >
                  Crear Workspace
                </Button>
                <Button
                  variant="outline"
                  className={`${
                    isDark
                      ? "border-gray-700 hover:bg-white/5"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  } transition-all px-8 py-6 text-lg`}
                >
                  Ver Demo
                </Button>
              </div>
            </motion.div>

            {/* Preview del Workspace */}
            <motion.div {...fadeIn} className="relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div
                  className={`relative ${
                    isDark
                      ? "bg-[#0F0F16] ring-1 ring-gray-800/50"
                      : "bg-white ring-1 ring-gray-200/50 shadow-lg"
                  } rounded-xl p-8 backdrop-blur-xl`}
                >
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div
                      className={`${
                        isDark
                          ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Users
                          className={`w-4 h-4 ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          Conectados
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          !isDark && "text-gray-800"
                        }`}
                      >
                        5
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          de 8 miembros
                        </span>
                      </div>
                    </div>
                    <div
                      className={`${
                        isDark
                          ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Layers
                          className={`w-4 h-4 ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          Colecciones
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          !isDark && "text-gray-800"
                        }`}
                      >
                        5
                      </div>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Activas
                      </span>
                    </div>
                    <div
                      className={`${
                        isDark
                          ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity
                          className={`w-4 h-4 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          Actividad
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          !isDark && "text-gray-800"
                        }`}
                      >
                        24
                      </div>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Últimas 24h
                      </span>
                    </div>
                  </div>
                  <div
                    className={`${
                      isDark
                        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm"
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span
                          className={`text-sm ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          Ana está estudiando ahora
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Arquitectura de Software - Tema 3
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className={`py-20 bg-gradient-to-b from-transparent ${
            isDark ? "to-gray-900/50" : "to-blue-50"
          }`}
        >
          <div className="container mx-auto px-6">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2
                className={`text-4xl font-bold mb-4 ${
                  !isDark && "text-gray-800"
                }`}
              >
                Todo lo que Necesitas para Estudiar Mejor
              </h2>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } max-w-2xl mx-auto`}
              >
                Una plataforma completa con herramientas avanzadas para mejorar
                tu experiencia de aprendizaje.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Flashcards */}
              <motion.div
                {...fadeIn}
                className={`relative group rounded-2xl overflow-hidden ${
                  !isDark && "shadow-lg"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    isDark
                      ? "from-blue-500 to-purple-500"
                      : "from-blue-100 to-purple-100"
                  } opacity-20 group-hover:opacity-30 transition-all`}
                />
                <div
                  className={`relative ${
                    isDark ? "bg-[#0F0F16]/90" : "bg-white"
                  } p-8 h-full`}
                >
                  <Brain
                    className={`w-8 h-8 ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    } mb-4`}
                  />
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      !isDark && "text-gray-800"
                    }`}
                  >
                    Sistema de Flashcards
                  </h3>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mb-6`}
                  >
                    Crea y estudia flashcards con dos modos de estudio: Libre y
                    Repetición Espaciada.
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`${
                        isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          Modo Libre
                        </span>
                        <Zap
                          className={`w-4 h-4 ${
                            isDark ? "text-yellow-400" : "text-yellow-600"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Practica sin restricciones
                      </p>
                    </div>
                    <div
                      className={`${
                        isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          Repetición Espaciada
                        </span>
                        <Clock
                          className={`w-4 h-4 ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Sistema inteligente de repaso
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Creación de Contenido */}
              <motion.div
                {...fadeIn}
                className={`relative group rounded-2xl overflow-hidden ${
                  !isDark && "shadow-lg"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    isDark
                      ? "from-blue-500 to-purple-500"
                      : "from-blue-100 to-purple-100"
                  } opacity-20 group-hover:opacity-30 transition-all`}
                />
                <div
                  className={`relative ${
                    isDark ? "bg-[#0F0F16]/90" : "bg-white"
                  } p-8 h-full`}
                >
                  <PenTool
                    className={`w-8 h-8 ${
                      isDark ? "text-purple-400" : "text-purple-600"
                    } mb-4`}
                  />
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      !isDark && "text-gray-800"
                    }`}
                  >
                    Creación de Contenido
                  </h3>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mb-6`}
                  >
                    Crea flashcards manualmente o utiliza IA para generarlas
                    automáticamente.
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`${
                        isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain
                          className={`w-4 h-4 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          Generación con IA
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        A partir de cualquier texto o tema
                      </p>
                    </div>
                    <div
                      className={`${
                        isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <PenTool
                          className={`w-4 h-4 ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          Creación Manual
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Control total sobre tu contenido
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Análisis y Estadísticas */}
              <motion.div
                {...fadeIn}
                className={`relative group rounded-2xl overflow-hidden ${
                  !isDark && "shadow-lg"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    isDark
                      ? "from-blue-500 to-purple-500"
                      : "from-blue-100 to-purple-100"
                  } opacity-20 group-hover:opacity-30 transition-all`}
                />
                <div
                  className={`relative ${
                    isDark ? "bg-[#0F0F16]/90" : "bg-white"
                  } p-8 h-full`}
                >
                  <BarChart
                    className={`w-8 h-8 ${
                      isDark ? "text-green-400" : "text-green-600"
                    } mb-4`}
                  />
                  <h3
                    className={`text-xl font-semibold mb-3 ${
                      !isDark && "text-gray-800"
                    }`}
                  >
                    Análisis Detallado
                  </h3>
                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mb-6`}
                  >
                    Visualiza tu progreso y mejora tu rendimiento con
                    estadísticas detalladas.
                  </p>
                  <div className="space-y-3">
                    <div
                      className={`${
                        isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          Rendimiento
                        </span>
                        <span
                          className={`text-sm ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          85%
                        </span>
                      </div>
                      <div
                        className={`w-full ${
                          isDark ? "bg-gray-700/30" : "bg-gray-200"
                        } rounded-full h-2`}
                      >
                        <div
                          className={`${
                            isDark ? "bg-blue-400" : "bg-blue-500"
                          } h-2 rounded-full`}
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={`${
                          isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                        } rounded-lg p-3 text-center`}
                      >
                        <div
                          className={`text-lg font-bold ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          45
                        </div>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Repasos
                        </p>
                      </div>
                      <div
                        className={`${
                          isDark ? "bg-gray-800/50" : "bg-gray-50 shadow-sm"
                        } rounded-lg p-3 text-center`}
                      >
                        <div
                          className={`text-lg font-bold ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          3.5h
                        </div>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Tiempo
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section
          className={`py-20 bg-gradient-to-t from-transparent ${
            isDark ? "to-gray-900/50" : "to-blue-50"
          }`}
        >
          <div className="container mx-auto px-6">
            <motion.div {...fadeIn} className="text-center">
              <h2
                className={`text-4xl font-bold mb-4 ${
                  !isDark && "text-gray-800"
                }`}
              >
                Empieza a Estudiar de Forma Inteligente
              </h2>
              <p
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } max-w-2xl mx-auto mb-8`}
              >
                Únete a nuestra comunidad. Crea tu workspace, invita a tu equipo
                y mejora tu forma de estudiar.
              </p>
              <div className="flex items-center justify-center space-x-4">
                {session?.user ? (
                  <Link href="/workspaces">
                    <Button
                      className={`bg-gradient-to-r from-blue-500 to-purple-500 ${
                        !isDark && "text-white"
                      } hover:opacity-90 transition-all px-8 py-6 text-lg`}
                    >
                      Acceder a Workspaces
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button
                        className={`bg-gradient-to-r from-blue-500 to-purple-500 ${
                          !isDark && "text-white"
                        } hover:opacity-90 transition-all px-8 py-6 text-lg`}
                      >
                        Crear Cuenta Gratuita
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className={`${
                        isDark
                          ? "border-gray-700 hover:bg-white/5"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      } transition-all px-8 py-6 text-lg`}
                    >
                      Ver Tutorial
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
