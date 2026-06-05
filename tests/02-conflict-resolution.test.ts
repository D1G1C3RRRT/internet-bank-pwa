import { resolveConflict, mergeFields } from '@/lib/offline/conflict-resolution'

describe('Category 2: Conflict Resolution and Merging', () => {
  const serverObj = { id: 'obj_1', title: 'Original Title', amount: 100, updatedAt: 1000 }
  const localObj = { id: 'obj_1', title: 'Modified Title', amount: 150, updatedAt: 2000 }

  it('Test 1: should support client-wins and server-wins resolution strategies', () => {
    // Client wins
    const clientWins = resolveConflict(serverObj, localObj, 'client-wins')
    expect(clientWins).toEqual(localObj)

    // Server wins
    const serverWins = resolveConflict(serverObj, localObj, 'server-wins')
    expect(serverWins).toEqual(serverObj)
  })

  it('Test 2: should resolve conflicts via Last-Write-Wins (LWW) based on updatedAt timestamps', () => {
    // Local is newer
    const resolvedNewer = resolveConflict(serverObj, localObj, 'lww')
    expect(resolvedNewer).toEqual(localObj)

    // Server is newer
    const serverNewer = { ...serverObj, updatedAt: 3000 }
    const resolvedOlder = resolveConflict(serverNewer, localObj, 'lww')
    expect(resolvedOlder).toEqual(serverNewer)
  })

  it('Test 3: should merge objects field-by-field based on individual property edit timestamps', () => {
    const serverState = { title: 'Base Title', description: 'Base Desc', clicks: 10 }
    const clientState = { title: 'Updated Title', description: 'Base Desc', clicks: 12 }
    
    const serverTimestamps = { title: 100, description: 100, clicks: 500 } // clicks edited on server LATER
    const clientTimestamps = { title: 200, description: 100, clicks: 100 } // title edited on client LATER

    const merged = mergeFields(serverState, clientState, serverTimestamps, clientTimestamps)
    
    expect(merged.title).toBe('Updated Title') // Client wins because of newer timestamp
    expect(merged.clicks).toBe(10) // Server wins clicks because of newer timestamp
    expect(merged.description).toBe('Base Desc') // Equal values remain
  })
})
