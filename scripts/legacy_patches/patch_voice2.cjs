const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    let audioBase64 = null;
    try {
      const ttsClient = new textToSpeech.TextToSpeechClient();
      const request = {
        input: { text: aiSpeechText },
        voice: { languageCode: 'en-US', name: 'en-US-Journey-F' },
        audioConfig: { audioEncoding: 'MP3' },
      };
      const [response] = await ttsClient.synthesizeSpeech(request);
      if (response.audioContent) {
        audioBase64 = response.audioContent.toString('base64');
      }
    } catch (ttsErr) {
      console.warn("TTS Generation Failed:", ttsErr.message);
    }`;
    
const replacement = `    let audioBase64 = null;
    try {
      const ttsClient = new textToSpeech.TextToSpeechClient();
      const request: any = {
        input: { text: aiSpeechText },
        voice: { languageCode: 'en-US', name: 'en-US-Journey-F' },
        audioConfig: { audioEncoding: 'MP3' },
      };
      const [response] = await ttsClient.synthesizeSpeech(request) as any;
      if (response && response.audioContent) {
        audioBase64 = Buffer.from(response.audioContent).toString('base64');
      }
    } catch (ttsErr: any) {
      console.warn("TTS Generation Failed:", ttsErr.message);
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
console.log("Fixed TS error in TTS");
