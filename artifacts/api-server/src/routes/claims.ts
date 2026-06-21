import { Router, type IRouter } from "express";
import { db, usersTable, claimsTable, walletTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitClaimBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const PAYOUT_AMOUNTS: Record<string, Record<string, number>> = {
  bronze: { small: 300, medium: 600, full: 1000 },
  silver: { small: 400, medium: 800, full: 1500 },
  gold: { small: 500, medium: 1000, full: 2000 },
};

function isEligibleForClaim(registeredAt: Date): boolean {
  const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;
  return Date.now() - registeredAt.getTime() >= THREE_WEEKS_MS;
}

function getPayoutTier(score: number): "none" | "small" | "medium" | "full" {
  if (score >= 80) return "full";
  if (score >= 60) return "medium";
  if (score >= 40) return "small";
  return "none";
}

const ZONE_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
  North: { lat: 28.7041, lng: 77.1025, radius: 0.15 },
  South: { lat: 12.9716, lng: 77.5946, radius: 0.15 },
  East: { lat: 22.5726, lng: 88.3639, radius: 0.15 },
  West: { lat: 19.076, lng: 72.8777, radius: 0.15 },
  Central: { lat: 23.2599, lng: 77.4126, radius: 0.15 },
};

function isInZone(zone: string, lat?: number, lng?: number): boolean {
  if (lat == null || lng == null) return true;
  const zoneData = ZONE_COORDS[zone];
  if (!zoneData) return true;
  const dist = Math.sqrt(Math.pow(lat - zoneData.lat, 2) + Math.pow(lng - zoneData.lng, 2));
  return dist <= zoneData.radius;
}

router.post("/", async (req, res) => {
  const parsed = SubmitClaimBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, reason: "Invalid request data" });
  }

  const { deliveryId, riskScore, plan, currentLatitude, currentLongitude } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.deliveryId, deliveryId)).limit(1);
  if (!user) {
    return res.status(400).json({ success: false, reason: "User not found" });
  }

  if (!isEligibleForClaim(user.registeredAt)) {
    return res.status(400).json({
      success: false,
      reason: "Account must be at least 3 weeks old to file a claim",
      rejectionReason: "cooling_period",
    });
  }

  if (!isInZone(user.zone, currentLatitude ?? undefined, currentLongitude ?? undefined)) {
    return res.status(400).json({
      success: false,
      reason: `You must be in your registered zone (${user.zone}) to file a claim`,
      rejectionReason: "zone_mismatch",
    });
  }

  const payoutTier = getPayoutTier(riskScore);
  if (payoutTier === "none") {
    return res.status(400).json({
      success: false,
      reason: "Risk score is too low for a payout (must be 40 or above)",
      rejectionReason: "low_risk_score",
    });
  }

  const payoutAmount = PAYOUT_AMOUNTS[plan]?.[payoutTier] ?? 0;
  const claimId = `CLM-${randomUUID().slice(0, 8).toUpperCase()}`;

  await db.insert(claimsTable).values({
    claimId,
    deliveryId,
    riskScore,
    payoutAmount,
    payoutTier,
    plan,
    status: "approved",
  });

  await db.update(usersTable)
    .set({
      walletBalance: (user.walletBalance ?? 0) + payoutAmount,
      totalSaved: (user.totalSaved ?? 0) + payoutAmount,
    })
    .where(eq(usersTable.deliveryId, deliveryId));

  await db.insert(walletTransactionsTable).values({
    deliveryId,
    type: "payout",
    amount: payoutAmount,
    description: `Claim ${claimId} - ${payoutTier} payout (Score: ${riskScore})`,
  });

  return res.json({
    success: true,
    payoutAmount,
    payoutTier,
    claimId,
    reason: `Claim approved! ₹${payoutAmount} added to your wallet.`,
  });
});

router.get("/:deliveryId", async (req, res) => {
  const { deliveryId } = req.params;
  const claims = await db.select().from(claimsTable).where(eq(claimsTable.deliveryId, deliveryId));

  const totalPaid = claims.reduce((sum, c) => sum + c.payoutAmount, 0);

  return res.json({
    deliveryId,
    claims: claims.map((c) => ({
      id: c.id,
      claimId: c.claimId,
      riskScore: c.riskScore,
      payoutAmount: c.payoutAmount,
      payoutTier: c.payoutTier,
      plan: c.plan,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    })),
    totalPaid,
  });
});

export default router;
