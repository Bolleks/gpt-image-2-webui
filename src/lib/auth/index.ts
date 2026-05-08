import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { seedPhraseToHash, seedPhraseToUserId, validateSeedPhrase } from '@/lib/auth/seed';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'seed-phrase',
      credentials: {
        seedPhrase: { label: 'Seed-фраза', type: 'text' },
      },
      async authorize(credentials) {
        const seedPhrase = credentials.seedPhrase as string;
        if (!seedPhrase) return null;

        const validation = validateSeedPhrase(seedPhrase);
        if (!validation.valid) return null;

        const hash = seedPhraseToHash(seedPhrase);
        const userId = seedPhraseToUserId(seedPhrase);

        const user = await db.query.users.findFirst({
          where: eq(users.seedPhraseHash, hash),
        });

        if (!user) return null;

        return { id: user.id };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
});