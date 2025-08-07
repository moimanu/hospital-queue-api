export function getCurrentTime(): string {
  return new Date().toTimeString().split(" ")[0]!;
}

export function calculateWaitTime(startDate: string, startTime: string): string {
  const now = new Date();
  const start = new Date(`${startDate}T${startTime}`);
  const ms = now.getTime() - start.getTime();
  return formatDuration(ms);
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
