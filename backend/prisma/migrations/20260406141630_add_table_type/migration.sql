-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Standing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableType" TEXT NOT NULL DEFAULT 'apertura',
    "team" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "form" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Standing" ("createdAt", "drawn", "form", "goalsAgainst", "goalsFor", "group", "id", "lost", "played", "points", "team", "won") SELECT "createdAt", "drawn", "form", "goalsAgainst", "goalsFor", "group", "id", "lost", "played", "points", "team", "won" FROM "Standing";
DROP TABLE "Standing";
ALTER TABLE "new_Standing" RENAME TO "Standing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
