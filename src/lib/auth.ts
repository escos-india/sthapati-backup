import { getUserByEmail } from '@/lib/users';
import type { UserStatus } from '@/models/User';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error('Missing Google OAuth environment variables.');
}

if (!nextAuthSecret) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable.');
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === 'saumitrakulkarni4823@gmail.com' && credentials?.password === 'sthapati@2025') {
          return {
            id: 'admin-static-id',
            email: 'saumitrakulkarni4823@gmail.com',
            name: 'Admin',
            image: null,
          };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const authMode = cookieStore.get('auth_mode')?.value;

        if (authMode === 'login') {
          await connectToDatabase();
          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            // Block login if user does not exist
            return '/auth/error?error=AccountNotFound';
          }

          if (existingUser.category === 'Architect' && existingUser.status === 'pending') {
            // Block login if architect is pending
            return '/auth/error?error=ProfileUnderReview';
          }

          if (existingUser.status === 'banned' || existingUser.status === 'rejected') {
            return `/auth/error?error=Account${existingUser.status.charAt(0).toUpperCase() + existingUser.status.slice(1)}`;
          }

          return true;
        }

        return true;
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      try {
        if (account && profile) {
          token.googleId = profile.sub ?? account.providerAccountId;
          token.picture = (profile as any).picture;
        }

        // Removed credentials-specific logic as provider is removed, 
        // but keeping structure compatible.
        // if (user && account?.provider === 'credentials') { ... } // Dormant

        if (!token.email) {
          return token;
        }

        if (token.email === 'saumitrakulkarni4823@gmail.com') {
          token.userStatus = 'active';
          token.userCategory = 'admin' as any;
          token.userDbId = 'admin-static-id';
          return token;
        }

        const userRecord = await getUserByEmail(token.email);
        token.userStatus = (userRecord?.status ?? null) as UserStatus | null;
        token.userCategory = userRecord?.category ?? null;
        token.userDbId = userRecord ? (userRecord as any)._id?.toString() ?? null : null;
        token.isProfileComplete = (userRecord as any)?.isProfileComplete ?? false;

        if (!token.googleId && userRecord?.googleId) {
          token.googleId = userRecord.googleId;
        }

        return token;
      } catch (error) {
        console.error("JWT Callback Error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.googleId = token.googleId as string | undefined;
        session.user.status = (token.userStatus as UserStatus | null) ?? undefined;
        session.user.category = (token.userCategory as string | null) ?? undefined;
        session.user.dbId = (token.userDbId as string | null) ?? undefined;
        (session.user as any).isProfileComplete = token.isProfileComplete;
      }
      return session;
    },
  },
};
