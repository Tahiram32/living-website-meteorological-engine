const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    function startVoiceAgent() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {`;
      
const replacement = `    function startVoiceAgent() {
      if (!window.voiceAgentAudio) {
         window.voiceAgentAudio = new Audio();
         window.voiceAgentAudio.play().catch(() => {}); // Unlock audio on tap
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {`;

code = code.replace(target, replacement);

const target2 = `          if (data.audio_base64) {
             const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
             audio.play();`;
             
const replacement2 = `          if (data.audio_base64) {
             if (window.voiceAgentAudio) {
               window.voiceAgentAudio.src = "data:audio/mp3;base64," + data.audio_base64;
               window.voiceAgentAudio.play();
             } else {
               const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
               audio.play();
             }`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Patched audio autoplay in server.ts");
