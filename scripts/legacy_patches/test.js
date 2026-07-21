const serviceAccountKey = '{"type":"service_account"} {"type":"service_account"}';
let cleanedKey = serviceAccountKey.trim();
let firstBrace = cleanedKey.indexOf('{');
if (firstBrace !== -1) {
  let depth = 0;
  let lastBrace = -1;
  for (let i = firstBrace; i < cleanedKey.length; i++) {
    if (cleanedKey[i] === '{') depth++;
    else if (cleanedKey[i] === '}') {
      depth--;
      if (depth === 0) {
        lastBrace = i;
        break;
      }
    }
  }
  if (lastBrace !== -1) {
    cleanedKey = cleanedKey.substring(firstBrace, lastBrace + 1);
  }
}
console.log(cleanedKey);
