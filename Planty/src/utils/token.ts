// utils/token.ts
let accessToken: string | null = null;

export const setAccessToken = (token: string) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const removeAccessToken = () => { accessToken = null; };

// ↓ 추가: default로도 내보냄 (named export는 그대로 유지)
export default { setAccessToken, getAccessToken, removeAccessToken };
