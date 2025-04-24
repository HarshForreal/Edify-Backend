/*
  Warnings:

  - A unique constraint covering the columns `[enrollmentId,sessionId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Progress_enrollmentId_sessionId_key" ON "Progress"("enrollmentId", "sessionId");
