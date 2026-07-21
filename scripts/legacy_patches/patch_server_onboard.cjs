const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `              vertical: { type: Type.STRING, description: "Business vertical (Roofing, HVAC, Plumbing, Solar, Landscaping, Pest Control, Snow Removal, Pool Maintenance, Locksmith, etc.)" },`;
const rep1 = `              business_type: { type: Type.STRING, description: "Must be exactly FIELD_SERVICE, APPOINTMENT_BASED, or RETAIL_HOSPITALITY based on the business type." },
              vertical: { type: Type.STRING, description: "Business vertical (Roofing, HVAC, Plumbing, Solar, Landscaping, Pest Control, Snow Removal, Pool Maintenance, Locksmith, etc.)" },`;

content = content.replace(target1, rep1);

const target2 = `            required: ["vertical", "trigger_type", "primary_triggers", "emergencyCopyFocus", "city", "phone", "themeColor", "icon"]`;
const rep2 = `            required: ["business_type", "vertical", "trigger_type", "primary_triggers", "emergencyCopyFocus", "city", "phone", "themeColor", "icon"]`;

content = content.replace(target2, rep2);

fs.writeFileSync('server.ts', content);
console.log("Patched server onboarding");
