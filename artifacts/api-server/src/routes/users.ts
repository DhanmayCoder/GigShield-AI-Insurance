import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserPlanBody } from "@workspace/api-zod";

const router: IRouter = Router();

function isEligibleForClaim(registeredAt: Date): boolean {
  const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;
  return Date.now() - registeredAt.getTime() >= THREE_WEEKS_MS;
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    panCard: user.panCard,
    deliveryId: user.deliveryId,
    zone: user.zone,
    plan: user.plan,
    registeredAt: user.registeredAt.toISOString(),
    isEligibleForClaim: isEligibleForClaim(user.registeredAt),
    walletBalance: user.walletBalance,
    totalSaved: user.totalSaved,
  };
}

router.post("/", async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation error", message: parsed.error.message });
  }

  const { name, panCard, deliveryId, zone, plan } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.deliveryId, deliveryId)).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Conflict", message: "User with this Delivery ID already exists" });
  }

  const panExisting = await db.select().from(usersTable).where(eq(usersTable.panCard, panCard)).limit(1);
  if (panExisting.length > 0) {
    return res.status(409).json({ error: "Conflict", message: "User with this PAN Card already exists" });
  }

  const [user] = await db.insert(usersTable).values({ name, panCard, deliveryId, zone, plan }).returning();

  return res.status(201).json(formatUser(user));
});

router.get("/:deliveryId", async (req, res) => {
  const { deliveryId } = req.params;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.deliveryId, deliveryId)).limit(1);

  if (!user) {
    return res.status(404).json({ error: "Not Found", message: "User not found" });
  }

  return res.json(formatUser(user));
});

router.put("/:deliveryId/plan", async (req, res) => {
  const { deliveryId } = req.params;
  const parsed = UpdateUserPlanBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation error", message: parsed.error.message });
  }

  const [user] = await db.update(usersTable)
    .set({ plan: parsed.data.plan })
    .where(eq(usersTable.deliveryId, deliveryId))
    .returning();

  if (!user) {
    return res.status(404).json({ error: "Not Found", message: "User not found" });
  }

  return res.json(formatUser(user));
});

export default router;
