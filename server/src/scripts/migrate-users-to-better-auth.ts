/**
 * One-time migration: creates Better Auth `account` rows for existing users
 * so they can log in via Better Auth with their current passwords.
 *
 * Legacy `User.password` values are bcrypt hashes (`$2…`). Those are copied as-is.
 * Any non-bcrypt value is hashed with Better Auth’s scrypt (`hashPassword`).
 *
 * Run: npx tsx --env-file .env src/scripts/migrate-users-to-better-auth.ts
 */
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../lib/prisma";

function isBcryptHash(value: string): boolean {
  return value.startsWith("$2");
}

async function main() {
  const users = await prisma.user.findMany({
    where: { password: { not: "" } },
    select: { id: true, password: true },
  });

  console.log(`Found ${users.length} users to migrate.`);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const existing = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const password = isBcryptHash(user.password)
      ? user.password
      : await hashPassword(user.password);

    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password,
      },
    });
    created++;
  }

  console.log(`Migration complete. Created: ${created}, Skipped (already exists): ${skipped}`);
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
