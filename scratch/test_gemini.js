const fetch = globalThis.fetch;
const apikey = Buffer.from('QUl6YVN5QnlJTXpNSUsyU28wOXBZMWlvQlJDTFd1VVdXVzMtenFF', 'base64').toString('ascii');
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`;
const body = {
  system_instruction: { parts: [{ text: 'system' }] },
  contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
  generationConfig: { temperature: 0.5, maxOutputTokens: 400 }
};
fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
