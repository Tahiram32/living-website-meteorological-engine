const fs = require('fs');
let code = fs.readFileSync('src/AdminDashboard.tsx', 'utf8');

const loginBlock = `
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-8 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-xl text-slate-900">NexusAI Portal</span>
          </div>
          <p className="text-sm text-slate-500 text-center mb-6">Zero-trust environment. Please authenticate.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passcode === ADMIN_API_KEY) {
              setIsAuthenticated(true);
            } else {
              alert("Unauthorized access attempt logged.");
            }
          }} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter Access Token"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
            <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }
`;

code = code.replace(/  return \(\n    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">/, loginBlock + '\n  return (\n    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">');
fs.writeFileSync('src/AdminDashboard.tsx', code);
