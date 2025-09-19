// lib/api.ts
import axios from 'axios'
export const sat = axios.create({ baseURL: '/sat' })
export const broker = axios.create({ baseURL: '/broker' })
import { v4 as uuidv4 } from 'uuid';

function attach(instance: any, name: string) {
  instance.interceptors.request.use((cfg: { headers: { [x: string]: string }; method: string; baseURL: any; url: any }) => {
    cfg.headers['X-Correlation-Id'] =  uuidv4();
    console.debug(`[API:${name}] ${cfg.method?.toUpperCase()} ${cfg.baseURL}${cfg.url}`)
    return cfg
  })
  instance.interceptors.response.use(
    r => { console.debug(`[API:${name}] ${r.status} ${r.config.url}`); return r },
    e => { console.error(`[API:${name}] ERROR`, e?.response?.status, e?.message); return Promise.reject(e) }
  )
}
attach(sat, 'sat'); attach(broker, 'broker');
