/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:35701"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Suprimir advertencias específicas en la consola
  onDemandEntries: {
    // Período en ms en el que el servidor eliminará páginas no utilizadas
    maxInactiveAge: 25 * 1000,
    // Número de páginas que deben mantenerse en memoria
    pagesBufferLength: 2,
  },
  // Configuración para suprimir advertencias específicas
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Filtrar advertencias específicas en modo desarrollo
      config.infrastructureLogging = {
        level: "error", // Mostrar solo errores, no advertencias
      };
    }
    return config;
  },
};

module.exports = nextConfig;
