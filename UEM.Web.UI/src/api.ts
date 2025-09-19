import axios from 'axios';
export const broker = axios.create({ baseURL: import.meta.env.VITE_BROKER ?? 'https://localhost:7201' });
//export const listEndpoints = async () => (await axios.get((import.meta.env.VITE_SAT ?? 'https://localhost:7200') + '/api/agents')).data;
// export const listEndpoints = async () => (await axios.get('/sat/api/agents')).data;

// export const sendCommand = async (agentId: string, cmd: string) => (await broker.post('/api/commands', { agentId, type:'run-shell', payload: { command: cmd } })).data;


export const listEndpoints = async () => (await axios.get('/sat/api/agents')).data;
export const sendCommand   = async (agentId: string, cmd: string) =>
  (await axios.post('/broker/api/commands', { agentId, type:'run-shell', payload:{ command: cmd } })).data;

