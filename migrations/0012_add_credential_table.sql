-- DropTable
PRAGMA foreign_keys=off;
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credentialId" TEXT NOT NULL,
    "publicKey" BLOB NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'invoice',
    "userId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "supplierLogo" TEXT,
    "supplierName" TEXT,
    "supplierContact" TEXT,
    "customer" TEXT,
    "notesA" TEXT,
    "notesB" TEXT,
    "items" TEXT NOT NULL DEFAULT '[]',
    "taxes" TEXT NOT NULL DEFAULT '[]',
    "labels" TEXT NOT NULL DEFAULT '{"invoiceNumber":"Invoice #","invoiceDate":"Date","itemDescription":"Description","itemQuantity":"Quantity","itemPrice":"Price","subtotal":"Subtotal","total":"Total"}',
    "currency" TEXT NOT NULL DEFAULT '$',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("createdAt", "currency", "customer", "date", "id", "items", "labels", "notesA", "notesB", "number", "status", "supplierContact", "supplierLogo", "supplierName", "taxes", "title", "updatedAt", "userId") SELECT "createdAt", "currency", "customer", "date", "id", "items", "labels", "notesA", "notesB", "number", "status", "supplierContact", "supplierLogo", "supplierName", "taxes", "title", "updatedAt", "userId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_userId_number_key" ON "Invoice"("userId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Credential_userId_key" ON "Credential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");

-- CreateIndex
CREATE INDEX "Credential_credentialId_idx" ON "Credential"("credentialId");

-- CreateIndex
CREATE INDEX "Credential_userId_idx" ON "Credential"("userId");
