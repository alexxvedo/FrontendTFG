import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub,
    Google({
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    }),
  ],
  session: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  // Configuración para aceptar localhost como host confiable
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Si no hay cuenta o usuario, no podemos hacer nada
      if (!account || !user.email) return true;

      try {
        // Buscar si existe un usuario con el mismo email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // Si no existe un usuario previo, permitir el inicio de sesión normal
        if (!existingUser) return true;

        // Verificar si ya tiene una cuenta con este proveedor
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: account.provider,
          },
        });

        // Si ya tiene una cuenta con este proveedor, permitir el inicio de sesión
        if (existingAccount) return true;

        // Si llegamos aquí, el usuario existe pero está intentando iniciar sesión
        // con un proveedor diferente al que usó originalmente
        
        // Crear una nueva cuenta para este proveedor y vincularla al usuario existente
        // Usamos una consulta SQL directa para evitar problemas de tipo
        await prisma.$executeRaw`
          INSERT INTO "Account" (
            "userId", "type", "provider", "providerAccountId", 
            "refresh_token", "access_token", "expires_at", 
            "token_type", "scope", "id_token", "session_state",
            "createdAt", "updatedAt"
          ) 
          VALUES (
            ${existingUser.id}, ${account.type}, ${account.provider}, ${account.providerAccountId},
            ${account.refresh_token || null}, ${account.access_token || null}, 
            ${account.expires_at ? Number(account.expires_at) : null},
            ${account.token_type || null}, ${account.scope || null}, 
            ${account.id_token || null}, ${account.session_state || null},
            NOW(), NOW()
          )
        `;

        return true;
      } catch (error) {
        console.error("Error en el proceso de inicio de sesión:", error);
        return false;
      }
    },
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Página a la que redirigir en caso de error
  },
});
