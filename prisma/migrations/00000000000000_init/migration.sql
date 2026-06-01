-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ATHLETE', 'AGENT', 'CLUB');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FootPreference" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "AthleteLevel" AS ENUM ('PROFESSIONAL', 'AMATEUR', 'YOUTH');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('FREE', 'EMPLOYED');

-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('REPRESENTED', 'UNREPRESENTED');

-- CreateEnum
CREATE TYPE "ContractorType" AS ENUM ('AGENT', 'CLUB');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'PHOTO', 'EXTERNAL_LINK');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'AUDIO', 'INVITE_CARD');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "naturalidade" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "dominantFoot" "FootPreference" NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "level" "AthleteLevel" NOT NULL,
    "availability" "AvailabilityStatus" NOT NULL DEFAULT 'FREE',
    "agencyStatus" "AgencyStatus" NOT NULL DEFAULT 'UNREPRESENTED',
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "jerseyNumber" INTEGER,
    "avatarUrl" TEXT,
    "expectedSalary" DECIMAL(10,2),
    "city" TEXT,
    "state" TEXT,
    "socialMedia" TEXT,
    "additionalInfo" TEXT,
    "lastClub" TEXT,
    "goals" INTEGER,
    "assists" INTEGER,
    "gamesThisSeason" INTEGER,
    "minutesPlayed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_stats" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "position" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "dominantFoot" "FootPreference" NOT NULL,
    "lastClub" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_media" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "gameInfo" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "fileSizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ContractorType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT,
    "cnpj" TEXT,
    "companyName" TEXT,
    "socialMedia" TEXT,
    "additionalInfo" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessagePreview" TEXT,
    "athleteUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "contractorUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "audioUrl" TEXT,
    "proposalId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_userId_key" ON "athletes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_cpf_key" ON "athletes"("cpf");

-- CreateIndex
CREATE INDEX "athletes_availability_level_position_idx" ON "athletes"("availability", "level", "position");

-- CreateIndex
CREATE INDEX "athletes_availability_agencyStatus_idx" ON "athletes"("availability", "agencyStatus");

-- CreateIndex
CREATE INDEX "athletes_state_availability_idx" ON "athletes"("state", "availability");

-- CreateIndex
CREATE INDEX "athletes_gender_availability_idx" ON "athletes"("gender", "availability");

-- CreateIndex
CREATE INDEX "athletes_height_idx" ON "athletes"("height");

-- CreateIndex
CREATE INDEX "athletes_birthDate_idx" ON "athletes"("birthDate");

-- CreateIndex
CREATE UNIQUE INDEX "season_stats_athleteId_year_key" ON "season_stats"("athleteId", "year");

-- CreateIndex
CREATE INDEX "athlete_media_athleteId_mediaType_idx" ON "athlete_media"("athleteId", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_userId_key" ON "contractors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_cpf_key" ON "contractors"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_cnpj_key" ON "contractors"("cnpj");

-- CreateIndex
CREATE INDEX "favorites_contractorId_idx" ON "favorites"("contractorId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_contractorId_athleteId_key" ON "favorites"("contractorId", "athleteId");

-- CreateIndex
CREATE INDEX "conversations_athleteId_lastMessageAt_idx" ON "conversations"("athleteId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "conversations_contractorId_lastMessageAt_idx" ON "conversations"("contractorId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_athleteId_contractorId_key" ON "conversations"("athleteId", "contractorId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "profile_views_athleteId_viewedAt_idx" ON "profile_views"("athleteId", "viewedAt");

-- CreateIndex
CREATE INDEX "profile_views_contractorId_idx" ON "profile_views"("contractorId");

-- CreateIndex
CREATE INDEX "proposals_athleteId_status_idx" ON "proposals"("athleteId", "status");

-- CreateIndex
CREATE INDEX "proposals_contractorId_idx" ON "proposals"("contractorId");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_stats" ADD CONSTRAINT "season_stats_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_media" ADD CONSTRAINT "athlete_media_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_codes" ADD CONSTRAINT "email_verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

