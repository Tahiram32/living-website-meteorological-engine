const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The block we want to remove starts with:
// // Simulate Cloud Scheduler in our monolithic test environment
// if (serviceRole === "unified") {
// ...
// }
// app.listen(PORT...

const startIndex = code.indexOf('// Simulate Cloud Scheduler in our monolithic test environment');
if (startIndex !== -1) {
  // Let's find the closing brace of the `if (serviceRole === "unified") {` block.
  // We can just regex replace everything from `// Simulate Cloud Scheduler` up to and including `}, 30000);\n    }\n`
  const endIndexStr = '}, 30000);\n    }\n';
  const endIndex = code.indexOf(endIndexStr, startIndex);
  if (endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex + endIndexStr.length);
    code = before + after;
    fs.writeFileSync('server.ts', code);
    console.log("Removed inner loops!");
  } else {
    console.log("Could not find endIndexStr");
  }
} else {
  console.log("Could not find startIndex");
}
