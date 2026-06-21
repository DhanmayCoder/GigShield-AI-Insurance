import { pgTable, serial, text, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const planEnum = pgEnum("plan", ["bronze", "silver", "gold"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  panCard: text("pan_card").notNull().unique(),
  deliveryId: text("delivery_id").notNull().unique(),
  zone: text("zone").notNull(),
  plan: planEnum("plan").notNull().default("bronze"),
  walletBalance: real("wallet_balance").notNull().default(0),
  totalSaved: real("total_saved").notNull().default(0),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, registeredAt: true, walletBalance: true, totalSaved: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
