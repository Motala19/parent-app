export const colors = {
  navy950: '#061231', navy900: '#0a1a42', navy800: '#0f2557', navy700: '#16327a', navy600: '#1f4096', navy500: '#2f55b8',
  navy200: '#c9d5f1', navy100: '#e6ecf8', navy50: '#f3f6fc',
  ink: '#12224d', inkSoft: '#263a6b', muted: '#6b7a9c',
  rose: '#c9485e', pink: '#ec7fa8',
};

export const gradients = {
  hero: [colors.navy950, colors.navy800, colors.navy600] as const,
  button: [colors.rose, colors.pink] as const,
};

// Soft card shadow (shadow* is iOS, elevation is Android)
export const shadow = {
  shadowColor: '#0a1a42',
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};