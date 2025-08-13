import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@jmpp/db';
import { UserSignInSchema } from '@jmpp/types';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Validate input
          const validated = UserSignInSchema.parse({
            email: credentials.email,
            password: credentials.password,
          });

          // Find user by email
          const user = await prisma.user.findUnique({
            where: {
              email: validated.email,
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            validated.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/sign-in', // Redirect errors to sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
