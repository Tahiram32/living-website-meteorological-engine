const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace top call button
content = content.replace(
  /<a href="tel:\$\{safePhoneUrl\}" class="inline-flex items-center gap-2 bg-primary hover-bg-primary-dark text-white font-bold py-2\.5 px-5 rounded shadow-lg transition-all text-sm uppercase tracking-wide">/g,
  '<button onclick="startVoiceAgent()" id="voice-agent-btn-header" class="inline-flex items-center gap-2 bg-primary hover-bg-primary-dark text-white font-bold py-2.5 px-5 rounded shadow-lg transition-all text-sm uppercase tracking-wide animate-pulse">'
);

// Replace second call button
content = content.replace(
  /<a href="tel:\$\{safePhoneUrl\}" class="bg-accent hover-bg-accent-dark text-slate-950 font-extrabold py-3\.5 px-8 text-sm uppercase tracking-wider shadow-xl transition-all rounded">/g,
  '<button onclick="startVoiceAgent()" id="voice-agent-btn-hero" class="bg-accent hover-bg-accent-dark text-slate-950 font-extrabold py-3.5 px-8 text-sm uppercase tracking-wider shadow-xl transition-all rounded animate-pulse">'
);

// Close tags for buttons (since they were <a> tags)
content = content.replace(
  /CALL \$\{safePhone\}\n        <\/a>/g,
  'TAP TO TALK (AI)\n        </button>'
);

content = content.replace(
  /Instant Service Dispatch\n        <\/a>/g,
  'Instant Service Dispatch (AI)\n        </button>'
);

const scriptInjection = `
  <script>
    function startVoiceAgent() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support the Web Speech API. Please try Google Chrome.");
        return;
      }
      
      const buttons = document.querySelectorAll('#voice-agent-btn-header, #voice-agent-btn-hero');
      buttons.forEach(b => {
         b.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> LISTENING...';
         b.classList.remove('animate-pulse');
         b.classList.add('bg-red-600');
      });

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = async function(event) {
        const transcript = event.results[0][0].transcript;
        
        buttons.forEach(b => {
           b.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> THINKING...';
        });

        try {
          const res = await fetch('/api/webhooks/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain: '\${domain}',
              transcript: transcript,
              callerNumber: 'Web Browser Caller'
            })
          });
          const data = await res.json();
          
          if (data.tts_text) {
             const utterance = new SpeechSynthesisUtterance(data.tts_text);
             window.speechSynthesis.speak(utterance);
          }
        } catch(e) {
          console.error("Voice Error", e);
        }
        
        buttons.forEach(b => {
           b.innerHTML = 'TAP TO TALK (AI)';
           b.classList.remove('bg-red-600');
           b.classList.add('animate-pulse');
        });
      };

      recognition.onerror = function(event) {
        buttons.forEach(b => {
           b.innerHTML = 'TAP TO TALK (AI)';
           b.classList.remove('bg-red-600');
           b.classList.add('animate-pulse');
        });
      };
    }
  </script>
</body>
`;

content = content.replace('</body>', scriptInjection);

fs.writeFileSync('server.ts', content);
console.log("Patched HTML");
