-- CreateTable
CREATE TABLE "Enterprise" (
    "id" TEXT NOT NULL,
    "name" CHAR(100) NOT NULL,
    "registration" CHAR(50) NOT NULL,
    "nickname" CHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "insert_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborator" (
    "id" TEXT NOT NULL,
    "name" CHAR(100) NOT NULL,
    "email" CHAR(256) NOT NULL,
    "enterpriseId" TEXT,

    CONSTRAINT "Colaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_colaborator" (
    "id" TEXT NOT NULL,
    "email" CHAR(256) NOT NULL,
    "enterpriseId" TEXT,

    CONSTRAINT "pending_colaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "colaboratorId" TEXT,
    "permissions" TEXT[],

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_name_key" ON "Enterprise"("name");

-- AddForeignKey
ALTER TABLE "Colaborator" ADD CONSTRAINT "Colaborator_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_colaborator" ADD CONSTRAINT "pending_colaborator_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_colaboratorId_fkey" FOREIGN KEY ("colaboratorId") REFERENCES "Colaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
