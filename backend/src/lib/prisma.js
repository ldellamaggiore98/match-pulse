import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultUrl = `file:${path.resolve(__dirname, "../../dev.db")}`;
const dbUrl = process.env.DATABASE_URL ?? defaultUrl;

const adapter = new PrismaBetterSqlite3({ url: dbUrl });

export const prisma = new PrismaClient({ adapter });
