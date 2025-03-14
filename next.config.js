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
  eslint: {
    // Desactivar la verificación de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
