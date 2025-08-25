// src/utils/url.ts
// 서버가 '/srv/app/app/..' 또는 '/uploads/..' 같은 상대경로를 주면 절대 URL로 바꿔줍니다.
// http(s) / file:// 은 그대로 사용
const HOST = 'http://43.200.244.250';

export const absUrl = (u?: string | null): string | undefined => {
  if (!u) return undefined;
  const s = String(u);
  if (/^https?:\/\//i.test(s) || s.startsWith('file://')) return s;

  // '/srv/app/app' 프리픽스 제거
  let path = s.replace(/^\/?srv\/app\/app/i, '');
  if (!path.startsWith('/')) path = `/${path}`;
  return `${HOST}${path}`;
};
