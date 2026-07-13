const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(/<div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">\s*<a href="\/admin" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2">\s*<Shield className="w-3 h-3" \/> Partner Portal\s*<\/a>\s*<\/div>/, '');

fs.writeFileSync('src/Storefront.tsx', code);
