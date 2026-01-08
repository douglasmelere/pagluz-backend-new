-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "RepresentativeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ConsumerType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'RURAL', 'PUBLIC_POWER');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('MONOPHASIC', 'BIPHASIC', 'TRIPHASIC');

-- CreateEnum
CREATE TYPE "ConsumerStatus" AS ENUM ('AVAILABLE', 'ALLOCATED', 'IN_PROCESS', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ConsumerApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('SOLAR', 'HYDRO', 'BIOMASS', 'WIND');

-- CreateEnum
CREATE TYPE "GeneratorStatus" AS ENUM ('UNDER_ANALYSIS', 'AWAITING_ALLOCATION', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'CALCULATED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklisted_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklisted_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_representatives" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "RepresentativeStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "commercial_representatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" "DocumentType" DEFAULT 'CPF',
    "cpfCnpj" TEXT NOT NULL,
    "representativeName" TEXT,
    "representativeRg" TEXT,
    "phone" TEXT DEFAULT '',
    "email" TEXT DEFAULT '',
    "concessionaire" TEXT NOT NULL,
    "ucNumber" TEXT NOT NULL,
    "consumerType" "ConsumerType" NOT NULL,
    "phase" "PhaseType" NOT NULL,
    "averageMonthlyConsumption" DOUBLE PRECISION NOT NULL,
    "discountOffered" DOUBLE PRECISION NOT NULL,
    "receiveWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "street" TEXT DEFAULT '',
    "number" TEXT DEFAULT '',
    "complement" TEXT,
    "neighborhood" TEXT DEFAULT '',
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT DEFAULT '',
    "birthDate" TIMESTAMP(3),
    "observations" TEXT,
    "arrivalDate" TIMESTAMP(3),
    "status" "ConsumerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "allocatedPercentage" DOUBLE PRECISION,
    "generatorId" TEXT,
    "approvalStatus" "ConsumerApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "submittedByRepresentativeId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "invoiceUrl" TEXT,
    "invoiceFileName" TEXT,
    "invoiceUploadedAt" TIMESTAMP(3),
    "invoiceScannedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "representativeId" TEXT,

    CONSTRAINT "consumers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generators" (
    "id" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "installedPower" DOUBLE PRECISION NOT NULL,
    "concessionaire" TEXT NOT NULL,
    "ucNumber" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "GeneratorStatus" NOT NULL DEFAULT 'UNDER_ANALYSIS',
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "representative_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "representativeId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "representative_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "representativeId" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "kwhConsumption" DOUBLE PRECISION NOT NULL,
    "kwhPrice" DOUBLE PRECISION NOT NULL,
    "commissionValue" DOUBLE PRECISION NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumer_change_requests" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "representativeId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB NOT NULL,
    "changedFields" TEXT[],
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumer_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blacklisted_tokens_token_key" ON "blacklisted_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_representatives_email_key" ON "commercial_representatives"("email");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_representatives_cpfCnpj_key" ON "commercial_representatives"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "representative_tokens_token_key" ON "representative_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "generators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "representative_tokens" ADD CONSTRAINT "representative_tokens_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumer_change_requests" ADD CONSTRAINT "consumer_change_requests_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumer_change_requests" ADD CONSTRAINT "consumer_change_requests_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumer_change_requests" ADD CONSTRAINT "consumer_change_requests_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
