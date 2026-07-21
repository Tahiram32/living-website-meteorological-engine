const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace(/<Route path="\/admin" element={<AdminDashboard \/>} \/>/, '<Route path="/internal-fleet-admin" element={<AdminDashboard />} />');

fs.writeFileSync('src/main.tsx', code);
