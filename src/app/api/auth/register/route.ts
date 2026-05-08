import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { generateSeedPhrase, seedPhraseToHash, seedPhraseToUserId } from '@/lib/auth/seed';

export async function POST(request: NextRequest) {
  try {
    const seedPhrase = generateSeedPhrase();
    const hash = seedPhraseToHash(seedPhrase);
    const id = seedPhraseToUserId(seedPhrase);

    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.seedPhraseHash, hash),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Такой пользователь уже существует. Попробуйте ещё раз.' },
        { status: 409 }
      );
    }

    await db.insert(users).values({
      id,
      seedPhraseHash: hash,
    });

    return NextResponse.json({ id, seedPhrase });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка регистрации' },
      { status: 500 }
    );
  }
}