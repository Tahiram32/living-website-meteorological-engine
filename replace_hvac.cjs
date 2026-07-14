const fs = require('fs');
const glob = require('glob'); // maybe not available, use child_process or simple fs read
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Rename interface
    content = content.replace(/HVACClient/g, 'TenantClient');
    content = content.replace(/hvac-clients/g, 'tenant-clients');
    content = content.replace(/hvac/g, 'business');
    content = content.replace(/HVAC/g, 'Local Business');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

const files = [
    'src/types.ts',
    'src/edge-routing-worker.ts',
    'src/AdminDashboard.tsx',
    'seed.ts',
    'meteorological-sync-engine.ts',
    'server.ts',
    'metadata.json'
];

files.forEach(replaceInFile);
console.log("Replaced HVAC references in main files.");
