const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

export function timeAgo(iso: string): string {
  const mins = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);

  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function clock(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function dayLabel(iso: string): string {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  if (sameDay(iso, now)) return 'Today';
  if (sameDay(iso, yesterday)) return 'Yesterday';

  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export const gradeLabel = (g: string | null) => (g ? (g === 'R' ? 'Grade R' : `Grade ${g}`) : '');

const orange = { bg: '#fdeadb', fg: '#9a4a0b', bar: '#d9701b' };
const blue = { bg: '#e3ebfb', fg: '#1f4096', bar: '#2f55b8' };

const tones: Record<string, { bg: string; fg: string; bar: string }> = {
  general: { bg: '#eef1f6', fg: '#3b4a68', bar: '#64748b' },
  urgent: { bg: '#fde8ec', fg: '#a3263c', bar: '#c9485e' },
  event: { bg: '#def5f7', fg: '#0a6a73', bar: '#0e9aa7' },
  newsletter: { bg: '#ece6fb', fg: '#5a3fb0', bar: '#7c5cd6' },
  reminder: { bg: '#fdf1d6', fg: '#8a5d05', bar: '#d99a1b' },
  project: { bg: '#dff3ee', fg: '#176b5b', bar: '#1f8f7a' },
  homework: blue,
  assignment: blue,
  test: orange,
  question_paper: orange,
};

export const toneFor = (type: string) => tones[type] ?? tones.general;