export function calculateTotalScore(
  ground: number,
  toilet: number,
  odor: number,
  supplies: number,
  facility: number
): number {
  const sum = ground + toilet + odor + supplies + facility;
  return Math.round((sum / 5) * 10) / 10;
}

export function getScoreLevel(score: number): { label: string; color: string } {
  if (score >= 4.5) {
    return { label: '优秀', color: 'green' };
  }
  if (score >= 4) {
    return { label: '良好', color: 'teal' };
  }
  if (score >= 3) {
    return { label: '一般', color: 'yellow' };
  }
  if (score >= 2) {
    return { label: '较差', color: 'orange' };
  }
  return { label: '严重', color: 'red' };
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) {
    return 'text-green-600 bg-green-100';
  }
  if (score >= 4) {
    return 'text-teal-600 bg-teal-100';
  }
  if (score >= 3) {
    return 'text-yellow-600 bg-yellow-100';
  }
  if (score >= 2) {
    return 'text-orange-600 bg-orange-100';
  }
  return 'text-red-600 bg-red-100';
}
