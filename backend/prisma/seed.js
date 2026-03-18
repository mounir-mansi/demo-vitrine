// Script de création du compte admin
// Usage : node prisma/seed.js
// Nécessite EMAIL et PASSWORD en variables d'env ou modifiés directement ci-dessous

require("dotenv").config();
const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email    = process.env.ADMIN_EMAIL    || "admin@monsite.fr";
  const name     = process.env.ADMIN_NAME     || "Admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("❌  ADMIN_PASSWORD manquant. Exemple :");
    console.error("   ADMIN_PASSWORD=MonMotDePasse node prisma/seed.js");
    process.exit(1);
  }

  const hashed = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 5,
    parallelism: 1,
  });

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hashed, name },
    create: { email, password: hashed, name },
  });

  console.log(`✅  Admin créé : ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
