const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>شات ذكاء جوجل الحقيقي (موقع FD_56)</title>
            <style>
                body { font-family: Tahoma, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; display: flex; flex-direction: column; height: 90vh; }
                h2 { text-align: center; color: #58a6ff; }
                #chat-box { flex: 1; border: 1px solid #30363d; background: #161b22; border-radius: 8px; padding: 15px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px; }
                .message { padding: 10px 15px; border-radius: 8px; max-width: 75%; line-height: 1.5; word-wrap: break-word; }
                .user { background: #1f6feb; color: #fff; align-self: flex-end; }
                .ai { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; align-self: flex-start; }
                .input-area { display: flex; gap: 10px; }
                input { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid #30363d; background: #0d1117; color: #fff; font-size: 16px; }
                button { padding: 12px 20px; background: #238636; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
                button:hover { background: #2ea043; }
            </style>
        </head>
        <body>
            <h2>🤖 شات ذكاء جوجل الحقيقي (موقع FD_56)</h2>
            <div id="chat-box">
                <div class="message ai">أهلاً بك يا FD_56! أنا جاهز، اكتب أي شيء وتحت أمرك برّد حقيقي فوري.</div>
            </div>
            <div class="input-area">
                <input type="text" id="user-input" placeholder="اكتب رسالتك هنا..." onkeydown="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()">إرسال</button>
            </div>
            <script>
                async function sendMessage() {
                    const input = document.getElementById('user-input');
                    const chatBox = document.getElementById('chat-box');
                    const messageText = input.value.trim();
                    if (!messageText) return;
                    chatBox.innerHTML += \`<div class="message user">أنت: \${messageText}</div>\`;
                    input.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;
                    const loadingId = 'loading_' + Date.now();
                    chatBox.innerHTML += \`<div id="\${loadingId}" class="message ai">جاري التفكير... ⏳</div>\`;
                    chatBox.scrollTop = chatBox.scrollHeight;
                    try {
                        const res = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: messageText })
                        });
                        const data = await res.json();
                        document.getElementById(loadingId).remove();
                        chatBox.innerHTML += \`<div class="message ai"><b>Gemini:</b> \${data.reply}</div>\`;
                    } catch (err) {
                        document.getElementById(loadingId).remove();
                        chatBox.innerHTML += \`<div class="message ai" style="color: #ff7b72;">خطأ بالاتصال مع السيرفر.</div>\`;
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
        });
        res.json({ reply: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "خطأ بالاتصال مع جيميناي: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
