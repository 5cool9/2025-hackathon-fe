// src/theme/tokens.ts
// === Colors ===
export const colors = {
  // gray scale
  gray0:  '#ffffff',
  gray10: '#f5f5f5',
  gray15: '#e6e6e6',
  gray20: '#d6d6d6',
  gray25: '#a2a2a2',
  gray30: '#888888',
  gray40: '#444444',
  gray70: '#222222',
  gray90: '#222222',
  gray90_40: '#22222266',
  gray90_70: '#222222b3',

  // brand
  green90: '#7eb85b',

  // convenient aliases
  primary: '#7eb85b',
  text: '#222222',
  subText: '#888888',
  border: '#e6e6e6',
  bg: '#ffffff',
};

// === Spacing / Radius (원하면 수정) ===
export const spacing = { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 };
export const radius  = { sm: 8, md: 4, lg: 8, full: 999 };

// === Typography ===
// JSON의 150% lineHeight는 RN에서 숫자로 계산해야 하므로 헬퍼를 둡니다.
const lh = (fs: number) => Math.round(fs * 1.5);

// 폰트 패밀리/웨이트
export const fontFamily = {
  regular: 'Pretendard',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

// RN은 커스텀 폰트에서 weight가 안 먹는 경우가 있어요.
// 그런 경우 'Pretendard-Bold' 식으로 패밀리를 나눠 쓰면 됩니다.
export const fontWeight = {
  bold: '700',       // JSON: Bold
  medium: '500',     // JSON: Medium
  semibold: '600',   // JSON: SemiBold
} as const;

// 사이즈 스케일 (JSON 값을 숫자로)
export const fontSize = {
  h1: 32,
  h2: 24,
  h3: 24,
  h4: 20,
  h5: 18,
  b1: 16,
  b2: 16,
  b3: 14,
  b4: 12,
  b5: 11,
  b6: 8, // 너무 작으면 접근성 때문에 11 이상 권장
} as const;

// 최종 텍스트 스타일 프리셋
export const txt = {
  H1: { fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,    fontSize: fontSize.h1, lineHeight: lh(fontSize.h1) },
  H2: { fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,    fontSize: fontSize.h2, lineHeight: lh(fontSize.h2) },
  H3: { fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,  fontSize: fontSize.h3, lineHeight: lh(fontSize.h3) },
  H4: { fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,    fontSize: fontSize.h4, lineHeight: lh(fontSize.h4) },
  H5: { fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,    fontSize: fontSize.h5, lineHeight: lh(fontSize.h5) },

  B1: { fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, fontSize: fontSize.b1, lineHeight: lh(fontSize.b1) },
  B2: { fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,   fontSize: fontSize.b2, lineHeight: lh(fontSize.b2) },
  B3: { fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,   fontSize: fontSize.b3, lineHeight: lh(fontSize.b3) },
  B4: { fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, fontSize: fontSize.b4, lineHeight: lh(fontSize.b4) },
  B5: { fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, fontSize: fontSize.b5, lineHeight: lh(fontSize.b5) },
  B6: { fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,   fontSize: fontSize.b6, lineHeight: lh(fontSize.b6) },
};
