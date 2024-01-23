/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `chat_id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "chat_id",
ADD COLUMN     "chat_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_chat_id_key" ON "users"("chat_id");
