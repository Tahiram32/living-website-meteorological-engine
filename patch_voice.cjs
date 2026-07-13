const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importTarget = `import { Resend } from "resend";`;
const importReplacement = `import { Resend } from "resend";\nimport textToSpeech from "@google-cloud/text-to-speech";`;

code = code.replace(importTarget, importReplacement);

const voiceTarget = `    console.log(\`🗣️ [VOICE AGENT \${domain}] Received: "\${transcript}" | Responded in \${Date.now() - startTime}ms: "\${aiSpeechText}"\`);
    
    return res.status(200).json({
      success: true,
      audio_url: null,
      tts_text: aiSpeechText
    });`;

const voiceReplacement = `    console.log(\`🗣️ [VOICE AGENT \${domain}] Received: "\${transcript}" | Responded in \${Date.now() - startTime}ms: "\${aiSpeechText}"\`);
    
    let audioBase64 = null;
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
    }
    
    return res.status(200).json({
      success: true,
      audio_base64: audioBase64,
      tts_text: aiSpeechText
    });`;

code = code.replace(voiceTarget, voiceReplacement);

const htmlTarget = `          if (data.tts_text) {
             const utterance = new SpeechSynthesisUtterance(data.tts_text);
             window.speechSynthesis.speak(utterance);
          }`;
          
const htmlReplacement = `          if (data.audio_base64) {
             const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
             audio.play();
          } else if (data.tts_text) {
             const utterance = new SpeechSynthesisUtterance(data.tts_text);
             window.speechSynthesis.speak(utterance);
          }`;

code = code.replace(htmlTarget, htmlReplacement);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with TTS");
