const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());

// تهيئة الاتصال الحقيقي بـ Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// صفحة شات حقيقية وجميلة تفتحها من المتصفح مباشرة لتجربة السيرفر
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>شات Gemini الحقيقي - FD_56</title>
            <style>
                body { font-family: Tahoma, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: height; min-height: 90vh; }
                .chat-container { width: 100%; max-width: 600px; background: #1e293b; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; height: 80vh; }
                .chat-header { background: #3b82f6; padding: 15px; font-weight: bold; text-align: center; font-size: 18px; }
                .chat-box { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
                .message { padding: 10px 15px; border-radius: 8px; max-width: 80%; line-height: 1.5; word-wrap: break-word; }
                .user-msg { background: #2563eb; align-self: flex-start; }
                .ai-msg { background: #334155; align-self: flex-end; border: 1px solid #475569; }
                .chat-input-area { display: flex; padding: 10px; background: #0f172a; border-top: 1px solid #334155; }
                input { flex: 1; padding: 12px; border: none; border-radius: 6px; background: #1e293b; color: white; font-size: 16px; outline: none; }
                button { background: #3b82f6; color: white; border: none; padding: 0 20px; margin-right: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }
                button:hover { background: #2563eb; }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="chat-header">🤖 شات ذكاء جوجل الحقيقي (موقع FD_56)</div>
                <div class="chat-box" id="chatBox">
                    <div class="message ai-msg">أهلاً بك يا FD_56! أنا جاهز، اكتب أي شيء وتحت أمرك برّد حقيقي فوري.</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="userInput" placeholder="اكتب رسالتك هنا..." onkeypress="if(event.key === 'Enter') sendMessage()">
                    <button onclick="sendMessage()">إرسال</button>
                </div>
            </div>

            <script>
                async function sendMessage() {
                    const inputField = document.getElementById('userInput');
                    const chatBox = document.getElementById('chatBox');
                    const text = inputField.value.trim();
                    if (!text) return;

                    // عرض رسالة المستخدم
                    chatBox.innerHTML += \`<div class="message user-msg"><b>أنت:</b> \${text}</div>\`;
                    inputField.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // رسالة انتظار
                    const loadingId = 'loading-' + Date.now();
                    chatBox.innerHTML += \`<div id="\${loadingId}" class="message ai-msg" style="color: #94a3b8;">جاري التفكير والرد الحقيقي...</div>\`;
                    chatBox.scrollTop = chatBox.scrollHeight;

                    try {
                        const response = await fetch('/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: text })
                        });
                        const data = await response.json();
                        
                        // إزالة رسالة الانتظار وضع الرد الحقيقي
                        document.getElementById(loadingId).remove();
                        chatBox.innerHTML += \`<div class="message ai-msg"><b>Gemini:</b> \${data.reply}</div>\`;
                    } catch (error) {
                        document.getElementById(loadingId).remove();
                        chatBox.innerHTML += \`<div class="message ai-msg" style="color: #ef4444;">حدث خطأ في الاتصال بالسيرفر.</div>\`;
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

// نقطة استقبال الـ API (المستخدمة من الشات أو من لعبة روبلوكس)
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ reply: "الرجاء إرسال نص صحيح." });
        }

        // إرسال الطلب لموديل جيميناي الحقيقي
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
        });

        res.json({ reply: response.text });

    } catch (error) {
        console.error("خطأ حقيقي من Gemini:", error);
        res.status(500).json({ reply: "خطأ بالاتصال مع جيميناي: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
