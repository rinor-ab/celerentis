import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
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

        // Mock authentication - in production, this would call your API
        if (credentials.email === 'demo@celerentis.com' && credentials.password === 'demo123') {
          return {
            id: '1',
            email: 'demo@celerentis.com',
            name: 'Demo User',
            role: 'owner',
          };
        }

        // Mock other users
        if (credentials.email === 'admin@celerentis.com' && credentials.password === 'admin123') {
          return {
            id: '2',
            email: 'admin@celerentis.com',
            name: 'Admin User',
            role: 'admin',
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'owner';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};
