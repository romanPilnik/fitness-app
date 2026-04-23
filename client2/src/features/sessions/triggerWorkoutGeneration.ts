import {
  connectWorkoutGenerationSocket,
  disconnectWorkoutGenerationSocket,
} from '@/lib/socket'

export function triggerWorkoutGeneration(sessionId: string): void {
  const socket = connectWorkoutGenerationSocket()
  if (!socket) return
  const s = socket

  const timeout = setTimeout(cleanup, 60_000)

  function cleanup() {
    s.off('generation:result', done)
    s.off('generation:error', done)
    clearTimeout(timeout)
    disconnectWorkoutGenerationSocket()
  }

  function done() {
    cleanup()
  }

  s.on('generation:result', done)
  s.on('generation:error', done)
  s.emit('generation:start', { sessionId })
}
