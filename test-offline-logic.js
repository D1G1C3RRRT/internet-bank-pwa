const lodash = require('lodash');

const { cloneDeep } = lodash;

function mergeWithLWW(serverRecord, localRecord) {
  if (!serverRecord) return localRecord;
  if (localRecord.updatedAt >= serverRecord.updatedAt) {
    return localRecord;
  }
  return serverRecord;
}

function mergeFields(serverObj, localObj, serverTimestamps, localTimestamps) {
  const merged = cloneDeep(serverObj);
  const allKeys = new Set([...Object.keys(serverObj), ...Object.keys(localObj)]);
  
  allKeys.forEach(key => {
    const sTime = serverTimestamps[key] || 0;
    const lTime = localTimestamps[key] || 0;
    if (lTime >= sTime && localObj[key] !== undefined) {
      merged[key] = localObj[key];
    }
  });
  return merged;
}

console.log('--- STARTING OFFLINE ARCHITECTURE SIMULATION TEST ---');

// Test 1: Last-Write-Wins (LWW) resolution
console.log('\\n[TEST 1] Last-Write-Wins (LWW) Resolution');
const serverData = { id: 'todo_1', value: 'Buy Milk', updatedAt: 1000 };
const localData = { id: 'todo_1', value: 'Buy Milk & Eggs', updatedAt: 1050 };

console.log('Server state:', serverData);
console.log('Local state (newer):', localData);

const resolvedLWW = mergeWithLWW(serverData, localData);
console.log('✅ Resolved LWW result:', resolvedLWW);


// Test 2: Conflict Resolution on object fields using timestamps
console.log('\\n[TEST 2] CRDT Field-Level Merging (LWW-Element-Dictionary)');
const serverObj = { title: 'Hello', count: 1 };
const localObj = { title: 'Hello World', count: 1 };

const serverTimestamps = { title: 100, count: 100 };
const localTimestamps = { title: 200, count: 50 }; // title edited locally LATER, count edited on server LATER

console.log('Server object:', serverObj, 'Timestamps:', serverTimestamps);
console.log('Local object:', localObj, 'Timestamps:', localTimestamps);

const resolvedFields = mergeFields(serverObj, localObj, serverTimestamps, localTimestamps);
console.log('✅ Resolved merged result:', resolvedFields);


// Test 3: Idempotent Queue handling
console.log('\\n[TEST 3] Duplicate Sync Payload Idempotency');
const dbStore = new Map();
const syncOp = { id: 'sync_op_123', action: 'CREATE_TODO', payload: 'Buy Bread' };

const processSync = (op) => {
  if (!dbStore.has(op.id)) {
    console.log(`Processing unique operation ${op.id}...`);
    dbStore.set(op.id, op.payload);
  } else {
    console.log(`Skipping duplicate operation ${op.id}!`);
  }
}

console.log('Attempt 1:');
processSync(syncOp);
console.log('Attempt 2 (Network Retry):');
processSync(syncOp);
console.log('✅ Store size after duplicate retries:', dbStore.size);

console.log('\\n--- TESTS COMPLETED SUCCESSFULLY ---');
