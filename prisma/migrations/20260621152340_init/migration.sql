-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "verifiedRoleId" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_guildId_key" ON "Config"("guildId");
