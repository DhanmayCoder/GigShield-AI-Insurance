import { pgTable, serial, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const txTypeEnum = pgEnum("tx_type", ["premium", "payout", "interest"]);

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  deliveryId: text("delivery_id").notNull(),
  type: txTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletTxSchema = createInsertSchema(walletTransactionsTable).omit({ id: true, createdAt: true });
export type InsertWalletTx = z.infer<typeof insertWalletTxSchema>;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
