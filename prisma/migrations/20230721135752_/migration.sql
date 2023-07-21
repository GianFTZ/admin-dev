-- DropForeignKey
ALTER TABLE "PermissionGroup" DROP CONSTRAINT "PermissionGroup_roleId_fkey";

-- CreateTable
CREATE TABLE "_PermissionGroupToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionGroupToRole_AB_unique" ON "_PermissionGroupToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionGroupToRole_B_index" ON "_PermissionGroupToRole"("B");

-- AddForeignKey
ALTER TABLE "_PermissionGroupToRole" ADD CONSTRAINT "_PermissionGroupToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "PermissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionGroupToRole" ADD CONSTRAINT "_PermissionGroupToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
