import { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { addSyncOperation } from './db'

export type SyncAction = {
  type: string
  payload: any
}

type SyncMiddleware = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, [...Mps, ['zustand/sync', unknown]], Mcs>,
  name: string
) => StateCreator<T, Mps, [['zustand/sync', unknown], ...Mcs]>

declare module 'zustand/vanilla' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface StoreMutators<S, A> {
    'zustand/sync': WithSync<S>
  }
}

type WithSync<S> = S

export const syncMiddlewareImpl = <T extends object>(
  f: StateCreator<T, [], []>,
  name: string
): StateCreator<T, [], []> => {
  return (set: any, get: any, api: any) => {
    const wrappedSet: typeof set = async (...args: any[]) => {
      // Execute the normal state update
      set(...args)

      // In a real scenario, you'd extract the action type/payload from args.
      // For this implementation, we assume args[0] contains the partial state change
      const stateChange = args[0]
      
      // Determine if the change should be synced
      // Exclude functions and non-data properties
      const payload = typeof stateChange === 'function' 
        ? stateChange(get()) 
        : stateChange

      const actionType = `UPDATE_${name.toUpperCase()}`

      try {
        // Enqueue the mutation to IndexedDB for background sync
        await addSyncOperation(actionType, payload)
        
        // Attempt to sync immediately if online
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          triggerImmediateSync()
        }
      } catch (err) {
        console.error(`[SyncMiddleware] Failed to queue sync operation for ${name}`, err)
      }
    }

    return f(wrappedSet, get, api)
  }
}

export const syncMiddleware = syncMiddlewareImpl as unknown as SyncMiddleware

// Global function to trigger immediate sync attempt
export async function triggerImmediateSync() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    if (reg.active) {
      // Send message to SW to process the queue now
      reg.active.postMessage({ type: 'SYNC_NOW' })
    }
  }
}
