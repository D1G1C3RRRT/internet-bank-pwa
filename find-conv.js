const fs = require('fs');
const path = require('path');

const brainDir = '/Users/erikbabcan/.gemini/antigravity-ide/brain';
const ourConvId = '88653932-b4d5-4f79-9949-50a22bd22f99';

try {
  const dirs = fs.readdirSync(brainDir);
  const results = [];

  for (const dir of dirs) {
    if (dir === ourConvId || dir.startsWith('.')) continue;
    const fullPath = path.join(brainDir, dir);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        // Check transcript.jsonl mtime
        const transcriptPath = path.join(fullPath, '.system_generated', 'logs', 'transcript.jsonl');
        let mtime = stats.mtime;
        if (fs.existsSync(transcriptPath)) {
          const tStats = fs.statSync(transcriptPath);
          mtime = tStats.mtime;
        }
        results.push({ dir, mtime: mtime.getTime(), date: mtime });
      }
    } catch {
      // Ignore errors for individual dirs
    }
  }

  // Sort descending by mtime
  results.sort((a, b) => b.mtime - a.mtime);

  console.log('--- RECENT CONVERSATIONS ---');
  results.slice(0, 5).forEach(r => {
    console.log(`${r.dir} - Last Modified: ${r.date.toLocaleString()}`);
  });
} catch (err) {
  console.error('Error scanning brain dir:', err);
}
