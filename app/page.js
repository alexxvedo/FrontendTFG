"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Brain,
  Users,
  Sparkles,
  Zap,
  ArrowRight,
  Globe,
  Shield,
  BookOpen,
  Target,
  Rocket,
  Heart,
  Award,
  FileText,
  MessageSquare,
  Clock,
  BarChart3,
  Layers,
  Edit3,
  Download,
  Upload,
  Repeat,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { data: session } = useSession();

  const isDark = mounted && theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
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
            transition: { ...floatingAnimation.transition, delay: 1 },
          }}
          className={`absolute top-1/2 -left-40 w-80 h-80 ${
            isDark ? "bg-purple-500/20" : "bg-purple-400/20"
          } rounded-full blur-3xl`}
        />
        <motion.div
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 },
          }}
          className={`absolute bottom-20 right-1/3 w-64 h-64 ${
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

          <div className="flex items-center space-x-6">
            <ThemeToggle />
            {session?.user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Hola,{" "}
                  </span>
                  <span className="font-semibold">{session.user.name}</span>
                </div>
                <Link href="/workspaces">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300">
                    <span>Workspaces</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={`${
                      isDark
                        ? "text-white hover:bg-white/10"
                        : "text-gray-700 hover:bg-gray-100"
                    } transition-all duration-300`}
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300">
                    <span>Comenzar</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-40 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isDark
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                    : "bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200"
                } backdrop-blur-sm`}
              >
                <Sparkles
                  className={`w-4 h-4 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  Potenciado por IA Avanzada
                </span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <h1
                className={`text-6xl md:text-8xl font-bold leading-tight bg-gradient-to-r ${
                  isDark
                    ? "from-white via-blue-200 to-purple-200"
                    : "from-gray-900 via-blue-600 to-purple-600"
                } bg-clip-text text-transparent`}
              >
                Estudia
                <br />
                <span className="relative">
                  Inteligente
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
                className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Transforma tu forma de aprender con flashcards inteligentes,
                colaboración en tiempo real y análisis de progreso impulsado por
                IA.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              {session?.user ? (
                <Link href="/workspaces">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-lg px-8 py-4"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Ir a Workspaces
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-lg px-8 py-4"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Comenzar Gratis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`${
                        isDark
                          ? "border-gray-600 text-white hover:bg-white/5"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      } transition-all duration-300 text-lg px-8 py-4`}
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Ya tengo cuenta
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Features Preview Cards */}
            <motion.div variants={fadeInUp} className="pt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                  {
                    icon: Layers,
                    title: "Workspaces",
                    description: "Organiza tus estudios por materias",
                    color: "blue",
                  },
                  {
                    icon: BookOpen,
                    title: "Colecciones",
                    description: "Agrupa flashcards por temas",
                    color: "purple",
                  },
                  {
                    icon: FileText,
                    title: "Notas Colaborativas",
                    description: "Edita en tiempo real con tu equipo",
                    color: "green",
                  },
                  {
                    icon: BarChart3,
                    title: "Análisis de Progreso",
                    description: "Visualiza tu rendimiento",
                    color: "pink",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`p-6 rounded-2xl ${
                      isDark
                        ? "bg-white/5 backdrop-blur-sm border border-white/10"
                        : "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg"
                    } group cursor-pointer transition-all duration-300`}
                  >
                    <feature.icon
                      className={`w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300 ${
                        feature.color === "blue"
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : feature.color === "purple"
                          ? isDark
                            ? "text-purple-400"
                            : "text-purple-600"
                          : feature.color === "green"
                          ? isDark
                            ? "text-green-400"
                            : "text-green-600"
                          : isDark
                          ? "text-pink-400"
                          : "text-pink-600"
                      }`}
                    />
                    <h3
                      className={`text-lg font-bold mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`relative z-30 py-32 ${
          isDark
            ? "bg-gradient-to-b from-transparent to-gray-900/30"
            : "bg-gradient-to-b from-transparent to-white/50"
        }`}
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2
              className={`text-5xl font-bold mb-6 bg-gradient-to-r ${
                isDark ? "from-white to-gray-300" : "from-gray-900 to-gray-600"
              } bg-clip-text text-transparent`}
            >
              Todo lo que Necesitas
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Una plataforma completa con todas las herramientas para estudiar
              de manera eficiente
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Brain,
                title: "Generación con IA",
                description:
                  "Crea flashcards automáticamente desde documentos PDF, texto o temas específicos usando Google Gemini",
                gradient: "from-blue-500 to-cyan-500",
                features: [
                  "Sube documentos PDF",
                  "Generación automática",
                  "Preguntas inteligentes",
                ],
              },
              {
                icon: Repeat,
                title: "Dos Modos de Estudio",
                description:
                  "Practica con modo libre o utiliza repetición espaciada para optimizar tu aprendizaje",
                gradient: "from-purple-500 to-pink-500",
                features: [
                  "Modo libre",
                  "Repetición espaciada",
                  "Algoritmo adaptativo",
                ],
              },
              {
                icon: Users,
                title: "Colaboración Real",
                description:
                  "Trabaja en equipo con notas colaborativas, chat en tiempo real y workspaces compartidos",
                gradient: "from-green-500 to-emerald-500",
                features: [
                  "Edición colaborativa",
                  "Chat integrado",
                  "Sincronización en vivo",
                ],
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500`}
                />
                <div
                  className={`relative h-full p-8 rounded-3xl ${
                    isDark
                      ? "bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm"
                      : "bg-white/80 border border-gray-200/50 backdrop-blur-sm shadow-xl"
                  } transition-all duration-500 group-hover:border-opacity-100`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-600"
                    } mb-6 leading-relaxed`}
                  >
                    {feature.description}
                  </p>

                  <div className="space-y-3">
                    {feature.features.map((item, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            feature.gradient.includes("blue")
                              ? "text-blue-500"
                              : feature.gradient.includes("purple")
                              ? "text-purple-500"
                              : "text-green-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Features Showcase */}
      <section className="relative z-30 py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2
              className={`text-5xl font-bold mb-6 bg-gradient-to-r ${
                isDark ? "from-white to-gray-300" : "from-gray-900 to-gray-600"
              } bg-clip-text text-transparent`}
            >
              Funcionalidades Avanzadas
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Descubre todas las herramientas que tenemos para potenciar tu
              aprendizaje
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Upload,
                title: "Carga de Documentos",
                description:
                  "Sube archivos PDF y genera flashcards automáticamente",
                color: "blue",
              },
              {
                icon: Edit3,
                title: "Editor de Notas",
                description:
                  "Editor de texto enriquecido para tomar notas colaborativas",
                color: "green",
              },
              {
                icon: MessageSquare,
                title: "Chat en Tiempo Real",
                description: "Comunícate con tu equipo mientras estudias",
                color: "purple",
              },
              {
                icon: BarChart3,
                title: "Estadísticas Detalladas",
                description: "Analiza tu progreso con gráficos y métricas",
                color: "pink",
              },
              {
                icon: Clock,
                title: "Sistema de Repetición",
                description: "Algoritmo inteligente que optimiza tus repasos",
                color: "orange",
              },
              {
                icon: Download,
                title: "Exportación",
                description:
                  "Descarga tus flashcards y notas en diferentes formatos",
                color: "teal",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl ${
                  isDark
                    ? "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10"
                    : "bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl"
                } transition-all duration-300 group cursor-pointer`}
              >
                <feature.icon
                  className={`w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-300 ${
                    feature.color === "blue"
                      ? "text-blue-500"
                      : feature.color === "green"
                      ? "text-green-500"
                      : feature.color === "purple"
                      ? "text-purple-500"
                      : feature.color === "pink"
                      ? "text-pink-500"
                      : feature.color === "orange"
                      ? "text-orange-500"
                      : "text-teal-500"
                  }`}
                />
                <h3
                  className={`text-xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className={`relative z-30 py-32 ${
          isDark
            ? "bg-gradient-to-t from-gray-900/50 to-transparent"
            : "bg-gradient-to-t from-blue-50/50 to-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-8">
              <Heart
                className={`w-16 h-16 mx-auto mb-6 ${
                  isDark ? "text-pink-400" : "text-pink-500"
                }`}
              />
              <h2
                className={`text-5xl font-bold mb-6 bg-gradient-to-r ${
                  isDark
                    ? "from-white to-gray-300"
                    : "from-gray-900 to-gray-600"
                } bg-clip-text text-transparent`}
              >
                Comienza Hoy Mismo
              </h2>
              <p
                className={`text-xl ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mb-12`}
              >
                Crea tu primer workspace y descubre una nueva forma de estudiar
                con la ayuda de la inteligencia artificial.
              </p>
            </div>

            {session?.user ? (
              <Link href="/workspaces">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 text-xl px-12 py-6"
                >
                  <Award className="w-6 h-6 mr-3" />
                  Ir a Mis Workspaces
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 text-xl px-12 py-6"
                >
                  <Award className="w-6 h-6 mr-3" />
                  Crear Mi Primer Workspace
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            )}

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield
                  className={`w-4 h-4 ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                />
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  100% Gratuito
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap
                  className={`w-4 h-4 ${
                    isDark ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Sin Límites
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe
                  className={`w-4 h-4 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Multiplataforma
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
