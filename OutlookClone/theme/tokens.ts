export const spacing = (n: number) => n * 8;

export const colors = {
  bg: "#0D0E10",        // dark background like your screenshot
  card: "#131417",
  text: "#ECEFF3",
  subtext: "#A9B1BD",
  divider: "rgba(255,255,255,0.06)",
  blue: "#1677FF",      // “New Email” pill vibe
  unreadDot: "#1EA7FD",
  chip: "#2A2B2F",
  chipActive: "#5D5F66",
};

export const type = { h1: 28, h2: 18, body: 15, small: 13 } as const;
export const radius = { m: 12, l: 16, xl: 24 } as const;
