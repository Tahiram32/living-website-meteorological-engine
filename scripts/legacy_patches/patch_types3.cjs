const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  '  vertical?: string; // e.g. "Roofing", "HVAC", "Plumbing", "Solar", "Pool Maintenance"',
  '  business_type?: "FIELD_SERVICE" | "APPOINTMENT_BASED" | "RETAIL_HOSPITALITY" | "OTHER";\n  vertical?: string; // e.g. "Roofing", "HVAC", "Plumbing", "Solar", "Pool Maintenance"'
);
fs.writeFileSync('src/types.ts', content);
console.log("Patched types");
