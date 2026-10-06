-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CONSIDERING', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('WON', 'PLACED', 'SUBMITTED', 'DID_NOT_FINISH');

-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizer" TEXT,
    "category" TEXT,
    "status" "Status" NOT NULL DEFAULT 'CONSIDERING',
    "startDate" DATE,
    "deadline" TIMESTAMPTZ(3),
    "prize" TEXT,
    "link" TEXT,
    "notes" TEXT,
    "result" "Result",
    "resultDetail" TEXT,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hackathon_archivedAt_deadline_idx" ON "Hackathon"("archivedAt", "deadline");

-- CreateIndex
CREATE INDEX "Hackathon_status_idx" ON "Hackathon"("status");

