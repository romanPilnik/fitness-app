import { io, type Socket } from 'socket.io-client';
import { getApiOrigin } from '@/api/config';

let socket: Socket | null = null;

function isAiGenerationEnabled(): boolean {
  const raw = import.meta.env.VITE_AI_GENERATION_ENABLED;
  if (raw === undefined || raw === '') {
    return import.meta.env.DEV;
  }
  const v = raw.trim().toLowerCase();
  if (v === 'false' || v === '0' || v === 'no') {
    return false;
  }
  return v === 'true' || v === '1' || v === 'yes';
}

export function connectWorkoutGenerationSocket(): Socket | null {
  if (!isAiGenerationEnabled()) {
    return null;
  }

  const url = getApiOrigin();
  if (socket) {
    return socket;
  }

  socket = io(url, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function disconnectWorkoutGenerationSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getWorkoutGenerationSocket(): Socket | null {
  return socket;
}
