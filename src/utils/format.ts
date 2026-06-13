export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function formatHours(hours: number): string {
  if (hours < 24) {
    return `${hours}小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days}天`;
  }
  return `${days}天${remainingHours}小时`;
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) {
    return text;
  }
  return text.slice(0, maxLen) + '...';
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}${random}`;
}
