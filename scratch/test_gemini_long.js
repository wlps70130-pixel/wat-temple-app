const key = 'AIzaSyAWmopnALUmK6_1Yvoe6po4hpHrGUsRNWs';
const fetch = globalThis.fetch;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
const body = {
  system_instruction: { parts: [{ text: 'คุณคือวิศวกร เขียนรายงานยาวๆ' }] },
  contents: [{ role: 'user', parts: [{ text: 'เขียนบทความยาว 1000 คำ' }] }],
  generationConfig: { maxOutputTokens: 8000 }
};
fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(r => r.json())
  .then(d => {
       console.log('SUCCESS length:', d.candidates[0].content.parts[0].text.length);
       console.log('FINISH REASON:', d.candidates[0].finishReason);
  });
