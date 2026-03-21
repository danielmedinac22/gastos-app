import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Comida", icon: "🍔" },
  { name: "Transporte", icon: "🚗" },
  { name: "Entretenimiento", icon: "🎬" },
  { name: "Salud", icon: "💊" },
  { name: "Hogar", icon: "🏠" },
  { name: "Servicios", icon: "💡" },
  { name: "Compras", icon: "🛒" },
  { name: "Educación", icon: "📚" },
  { name: "Suscripciones", icon: "📱" },
  { name: "Otro", icon: "📦" },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", monthlyIncome: 0 },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
