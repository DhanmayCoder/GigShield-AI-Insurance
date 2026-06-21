import { Router, type IRouter } from "express";
import { db, usersTable, walletTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const INTEREST_RATE = 4.0;

router.get("/:deliveryId", async (req, res) => {
  const { deliveryId } = req.params;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.deliveryId, deliveryId)).limit(1);
  if (!user) {
    return res.status(404).json({ error: "Not Found", message: "User not found" });
  }

  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.deliveryId, deliveryId));

  const daysSinceRegistration = Math.floor(
    (Date.now() - user.registeredAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const interestEarned = parseFloat(
    ((user.totalSaved * INTEREST_RATE) / 100 * (daysSinceRegistration / 365)).toFixed(2)
  );

  return res.json({
    deliveryId,
    balance: user.walletBalance,
    totalSaved: user.totalSaved,
    interestRate: INTEREST_RATE,
    interestEarned,
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })),
  });
});

export default router;
