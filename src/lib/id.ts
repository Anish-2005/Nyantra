export function generateBeneficiaryId(randomize = false): string {
  const ts = Date.now().toString();
  if (randomize) {
    const suffix = Math.floor(100 + Math.random() * 900).toString();
    return `BEN${ts}${suffix}`;
  }
  return `BEN${ts}`;
}
