const key = 'AIzaSyAWmopnALUmK6_1Yvoe6po4hpHrGUsRNWs';
console.log('Base64:', Buffer.from(key).toString('base64'));
const fetch = globalThis.fetch;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
const body = {
  system_instruction: { parts: [{ text: 'system' }] },
  contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
  generationConfig: { temperature: 0.5, maxOutputTokens: 400 }
};
fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(r => r.json())
  .then(d => {
     if(d.error) console.log('ERROR:', JSON.stringify(d.error));
     else console.log('SUCCESS:', d.candidates[0].content.parts[0].text);
  });
