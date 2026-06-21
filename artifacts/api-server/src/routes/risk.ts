import { Router, type IRouter } from "express";
import { CalculateRiskScoreBody } from "@workspace/api-zod";

const router: IRouter = Router();

function simulateEnvironmentData() {
  const hour = new Date().getHours();
  const baseRain = Math.random() * 40 + (hour >= 15 && hour <= 19 ? 30 : 0);
  const baseTemp = Math.random() * 30 + (hour >= 11 && hour <= 16 ? 25 : 10);
  const basePollution = Math.random() * 40 + (hour >= 8 && hour <= 10 ? 30 : hour >= 18 && hour <= 21 ? 25 : 10);
  const baseTraffic = Math.random() * 30 + (hour >= 8 && hour <= 10 ? 40 : hour >= 17 && hour <= 20 ? 50 : 5);
  const strikeRaw = Math.random();
  const baseStrike = strikeRaw > 0.85 ? 80 + Math.random() * 20 : strikeRaw > 0.70 ? 40 + Math.random() * 40 : Math.random() * 20;

  const rainfall_mm = parseFloat((baseRain * 0.3).toFixed(1));
  const temperature_c = parseFloat((baseTemp * 0.5 + 15).toFixed(1));
  const aqi = parseFloat((basePollution * 3 + 50).toFixed(0));
  const traffic_levels = ["Low", "Moderate", "High", "Very High"];
  const traffic_level = baseTraffic > 70 ? traffic_levels[3] : baseTraffic > 50 ? traffic_levels[2] : baseTraffic > 25 ? traffic_levels[1] : traffic_levels[0];
  const strike_alert = baseStrike > 60;

  return {
    rain: Math.min(100, Math.max(0, parseFloat(baseRain.toFixed(1)))),
    temp: Math.min(100, Math.max(0, parseFloat(baseTemp.toFixed(1)))),
    pollution: Math.min(100, Math.max(0, parseFloat(basePollution.toFixed(1)))),
    traffic: Math.min(100, Math.max(0, parseFloat(baseTraffic.toFixed(1)))),
    strike: Math.min(100, Math.max(0, parseFloat(baseStrike.toFixed(1)))),
    timestamp: new Date().toISOString(),
    rawData: {
      rainfall_mm,
      temperature_c,
      aqi,
      traffic_level,
      strike_alert,
    },
  };
}

function calcRiskScore(plan: string, env: { rain: number; temp: number; pollution: number; traffic: number; strike: number }) {
  let score = 0;
  const breakdown = { rain: 0, temp: 0, pollution: 0, traffic: 0, strike: 0 };

  if (plan === "gold") {
    breakdown.rain = 0.30 * env.rain;
    breakdown.temp = 0.20 * env.temp;
    breakdown.pollution = 0.20 * env.pollution;
    breakdown.traffic = 0.20 * env.traffic;
    breakdown.strike = 0.10 * env.strike;
  } else if (plan === "silver") {
    breakdown.rain = 0.375 * env.rain;
    breakdown.temp = 0.25 * env.temp;
    breakdown.pollution = 0.25 * env.pollution;
    breakdown.strike = 0.125 * env.strike;
  } else {
    breakdown.rain = 0.60 * env.rain;
    breakdown.temp = 0.40 * env.temp;
  }

  score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  score = Math.min(100, Math.max(0, parseFloat(score.toFixed(1))));

  return { score, breakdown };
}

function getPayoutTier(score: number): { tier: "none" | "small" | "medium" | "full"; description: string } {
  if (score >= 80) return { tier: "full", description: "Full Payout — High Risk Conditions" };
  if (score >= 60) return { tier: "medium", description: "Medium Payout — Elevated Risk" };
  if (score >= 40) return { tier: "small", description: "Small Payout — Moderate Risk" };
  return { tier: "none", description: "No Payout — Risk is Low" };
}

router.get("/environment", (_req, res) => {
  const data = simulateEnvironmentData();
  res.json(data);
});

router.post("/score", (req, res) => {
  const parsed = CalculateRiskScoreBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", message: parsed.error.message });
  }

  const { plan, environmentData } = parsed.data;
  const env = environmentData ?? simulateEnvironmentData();
  const { score, breakdown } = calcRiskScore(plan, env as { rain: number; temp: number; pollution: number; traffic: number; strike: number });
  const { tier, description } = getPayoutTier(score);

  res.json({
    score,
    plan,
    payoutTier: tier,
    payoutDescription: description,
    breakdown,
  });
});

export default router;
