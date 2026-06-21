import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimsTable = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimId: text("claim_id").notNull().unique(),
  deliveryId: text("delivery_id").notNull(),
  riskScore: real("risk_score").notNull(),
  payoutAmount: real("payout_amount").notNull(),
  payoutTier: text("payout_tier").notNull(),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClaimSchema = createInsertSchema(claimsTable).omit({ id: true, createdAt: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claimsTable.$inferSelect;
