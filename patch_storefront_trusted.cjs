const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(/Trusted by industry leaders in 42 states/g, 'Trusted by local business owners');

fs.writeFileSync('src/Storefront.tsx', code);
