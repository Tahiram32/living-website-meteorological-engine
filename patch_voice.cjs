const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target1 = `      let syndicateTrade = null;`;
const replacement1 = `      let syndicateTrade = null;
      let zeroPartnersFound = false;`;

code = code.replace(target1, replacement1);

const target2 = `          } else {
            console.log(
              \`[SWARM AI FAIL] No available syndicate partners in \${client.city}.\`,
            );
          }`;
const replacement2 = `          } else if (syndicateRes.status === 404) {
            zeroPartnersFound = true;
            console.log(
              \`[SWARM AI FAIL] 0 partners found in Geohash query for \${client.city}. Activating Fallback Waitlist.\`,
            );
          } else {
            console.log(
              \`[SWARM AI FAIL] Syndicate API returned status \${syndicateRes.status}\`,
            );
          }`;

code = code.replace(target2, replacement2);

const target3 = `          : !hasAvailableSlot && client.syndicateEnabled && isFieldService
            ? \`🚨 CRITICAL OVERRIDE 🚨: We are currently fully booked and our partner network in your area is at capacity.`;
const replacement3 = `          : zeroPartnersFound
            ? \`🚨 CRITICAL OVERRIDE 🚨: We are currently fully booked and our partner network in your area is at capacity.`;

code = code.replace(target3, replacement3);

fs.writeFileSync('server.ts', code);
