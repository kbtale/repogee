export interface Contributor {
  username: string;
  xp: number;
  level: number;
  class: string;
}

export function rankContributors(contributors: Contributor[]): Contributor[] {
  return [...contributors].sort((a, b) => {
    if (b.xp !== a.xp) {
      return b.xp - a.xp;
    }
    return a.username.localeCompare(b.username);
  });
}

export function formatXPNumber(xp: number): string {
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'k';
  }
  return xp.toString();
}
