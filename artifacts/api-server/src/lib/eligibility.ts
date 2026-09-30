const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

export function isEligibleForClaim(registeredAt: Date): boolean {
  return Date.now() - registeredAt.getTime() >= THREE_WEEKS_MS;
}
