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

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-gradient" />

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/50 blur-sm rounded-full" />
                <span className="relative text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FlashMind AI
                </span>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-all"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all">
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn} className="space-y-8">
              <h1 className="text-6xl font-bold leading-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Aprende Mejor, Juntos
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Crea workspaces colaborativos, genera flashcards con IA, estudia
                con repetición espaciada y analiza tu progreso en tiempo real.
              </p>
              <div className="flex items-center space-x-6">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all px-8 py-6 text-lg">
                  Crear Workspace
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-white/5 transition-all px-8 py-6 text-lg"
                >
                  Ver Demo
                </Button>
              </div>
            </motion.div>

            {/* Preview del Workspace */}
            <motion.div {...fadeIn} className="relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#0F0F16] rounded-xl p-8 ring-1 ring-gray-800/50 backdrop-blur-xl">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">
                          Conectados
                        </span>
                      </div>
                      <div className="text-2xl font-bold">5</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="text-xs text-gray-400">
                          de 8 miembros
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-400">
                          Colecciones
                        </span>
                      </div>
                      <div className="text-2xl font-bold">5</div>
                      <span className="text-xs text-gray-400">Activas</span>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">
                          Actividad
                        </span>
                      </div>
                      <div className="text-2xl font-bold">24</div>
                      <span className="text-xs text-gray-400">Últimas 24h</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-green-400">
                          Ana está estudiando ahora
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Arquitectura de Software - Tema 3
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
          <div className="container mx-auto px-6">
            <motion.div {...fadeIn} className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Todo lo que Necesitas para Estudiar Mejor
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Una plataforma completa con herramientas avanzadas para mejorar
                tu experiencia de aprendizaje.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Flashcards */}
              <motion.div
                {...fadeIn}
                className="relative group rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 group-hover:opacity-30 transition-all" />
                <div className="relative bg-[#0F0F16]/90 p-8 h-full">
                  <Brain className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">
                    Sistema de Flashcards
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Crea y estudia flashcards con dos modos de estudio: Libre y
                    Repetición Espaciada.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          Modo Libre
                        </span>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <p className="text-xs text-gray-400">
                        Practica sin restricciones
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          Repetición Espaciada
                        </span>
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-xs text-gray-400">
                        Sistema inteligente de repaso
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Creación de Contenido */}
              <motion.div
                {...fadeIn}
                className="relative group rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 group-hover:opacity-30 transition-all" />
                <div className="relative bg-[#0F0F16]/90 p-8 h-full">
                  <PenTool className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">
                    Creación de Contenido
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Crea flashcards manualmente o utiliza IA para generarlas
                    automáticamente.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">
                          Generación con IA
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        A partir de cualquier texto o tema
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <PenTool className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">
                          Creación Manual
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Control total sobre tu contenido
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Análisis y Estadísticas */}
              <motion.div
                {...fadeIn}
                className="relative group rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 group-hover:opacity-30 transition-all" />
                <div className="relative bg-[#0F0F16]/90 p-8 h-full">
                  <BarChart className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">
                    Análisis Detallado
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Visualiza tu progreso y mejora tu rendimiento con
                    estadísticas detalladas.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          Rendimiento
                        </span>
                        <span className="text-sm text-blue-400">85%</span>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-400">
                          45
                        </div>
                        <p className="text-xs text-gray-400">Repasos</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-400">
                          3.5h
                        </div>
                        <p className="text-xs text-gray-400">Tiempo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-t from-transparent to-gray-900/50">
          <div className="container mx-auto px-6">
            <motion.div {...fadeIn} className="text-center">
              <h2 className="text-4xl font-bold mb-4">
                Empieza a Estudiar de Forma Inteligente
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Únete a nuestra comunidad. Crea tu workspace, invita a tu equipo
                y mejora tu forma de estudiar.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all px-8 py-6 text-lg">
                  Crear Cuenta Gratuita
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-white/5 transition-all px-8 py-6 text-lg"
                >
                  Ver Tutorial
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
