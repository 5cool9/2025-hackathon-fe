// src/api/client.ts
import axios from 'axios';
import { getAccessToken } from '../utils/token';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://43.200.244.250';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // Authorization
  const token = getAccessToken?.();
  if (token) {
    (config.headers ||= {} as any).Authorization = `Bearer ${token}`;
  }

  // FormData vs JSON
  const isFormData = config.data && typeof (config.data as any)?.append === 'function';

  if (isFormData) {
    const h = (config.headers ||= {} as any);
    const ct = String(h['Content-Type'] || h['content-type'] || '');
    // ✅ 이미 multipart/form-data로 "요청에서" 강제한 경우는 보존
    if (!/multipart\/form-data/i.test(ct)) {
      delete h['Content-Type'];
      delete h['content-type']; // axios가 boundary 포함 헤더 자동 설정
    }

    // (선택) 디버그 로그
    try {
      const parts = (config.data as any)?._parts;
      if (Array.isArray(parts)) {
        const summary = parts
          .map(([k, v]: any[]) => {
            if (k === 'images' || k === 'newImages') {
              const name = typeof v === 'object' ? v?.name : String(v);
              const type = typeof v === 'object' ? v?.type : '';
              return `- ${k} {name:${name}, type:${type}}`;
            }
            const val =
              typeof v === 'string'
                ? v.slice(0, 100)
                : typeof v === 'object'
                ? JSON.stringify(v).slice(0, 100)
                : String(v);
            return `- ${k} ${val}`;
          })
          .join('\n');
        console.log('🧩', (config.method || 'POST').toUpperCase(), config.url, '(form+files) parts:\n' + summary);
      } else {
        console.log('🧩', (config.method || 'POST').toUpperCase(), config.url, 'multipart/form-data');
      }
    } catch {}
  } else {
    // 쓰기 메서드에서만 JSON 지정
    const m = (config.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(m)) {
      (config.headers ||= {} as any)['Content-Type'] = 'application/json';
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('✅', res.status, res.config.method?.toUpperCase(), res.config.url);
    return res;
  },
  (err) => {
    const status = err?.response?.status;
    const method = err?.config?.method?.toUpperCase();
    const url = err?.config?.url;
    const data = err?.response?.data;
    console.log('❌', status, method, url, data);
    return Promise.reject(err);
  }
);
