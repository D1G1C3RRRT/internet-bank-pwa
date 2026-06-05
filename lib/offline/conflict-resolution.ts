import { isEqual, cloneDeep } from 'lodash'

export interface TimestampedData {
  id: string
  updatedAt: number
  [key: string]: any
}

/**
 * Last-Write-Wins (LWW) resolution strategy.
 * Compares the updatedAt timestamps of two records and returns the latest one.
 */
export function mergeWithLWW<T extends TimestampedData>(serverRecord: T | null, localRecord: T): T {
  if (!serverRecord) return localRecord
  
  if (localRecord.updatedAt >= serverRecord.updatedAt) {
    return localRecord
  }
  return serverRecord
}

/**
 * Advanced object-level merging using field-level timestamps (LWW-Element-Dictionary)
 */
export function mergeFields(
  serverObj: Record<string, any>, 
  localObj: Record<string, any>, 
  serverTimestamps: Record<string, number>, 
  localTimestamps: Record<string, number>
) {
  const merged = cloneDeep(serverObj)
  const allKeys = new Set([...Object.keys(serverObj), ...Object.keys(localObj)])
  
  allKeys.forEach(key => {
    const sTime = serverTimestamps[key] || 0
    const lTime = localTimestamps[key] || 0
    
    // Client wins if strictly newer, or equal and client is the local initiator
    if (lTime >= sTime && localObj[key] !== undefined) {
      merged[key] = localObj[key]
    }
  })
  
  return merged
}

export function resolveConflict<T extends TimestampedData>(
  serverData: T | null,
  localData: T,
  strategy: 'client-wins' | 'server-wins' | 'lww' = 'lww'
): T {
  if (!serverData) return localData

  // Identity check
  if (isEqual(serverData, localData)) return serverData

  switch(strategy) {
    case 'client-wins': return localData
    case 'server-wins': return serverData
    case 'lww': return mergeWithLWW(serverData, localData)
    default: return mergeWithLWW(serverData, localData)
  }
}
