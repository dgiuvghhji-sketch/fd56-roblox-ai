const express = require('express');
const https = require('https');
const app = express();

app.use(express.json());

let usersDB = [];
let chatsDB = {};

function callGeminiAPI(username, promptText, callback) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const systemInstruction = `أنت مساعد ذكاء اصطناعي خاص بالنظام. أنت تتحدث الآن مع المستخدم "${username}". رد عليه كشخص حقيقي وبشكل مباشر ومرتب باسمه، وبدون ذكر أنك نموذج لغوي ما لم يطلب ذلك.`;
    const fullPrompt = `${systemInstruction}\nالمستخدم: ${promptText}`;

    const postData = JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }]
    });

    // الطريقة الصحيحة لاستدعاء API جوجل مع المفتاح في الرابط
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.candidates && 
                    parsed.candidates[0].content && 
                    parsed.candidates[0].content.parts && 
                    parsed.candidates[0].content.parts[0].text) {
                    callback(null, parsed.candidates[0].content.parts[0].text);
                } else if (parsed.error) {
                    callback(null, "خطأ من جوجل: " + (parsed.error.message || "تأكد من إعدادات المفتاح"));
                } else {
                    callback(null, "أهلاً بك يا " + username + "، أنا جاهز لأوامرك.");
                }
            } catch (e) {
                callback("خطأ في معالجة البيانات");
            }
        });
    });

    req.on('error', (e) => { callback(e); });
    req.write(postData);
    req.end();
}

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>FD_56 Elite AI System</title>
    <style>
        :root {
            --bg-color: #030303;
            --panel-color: #0d0d0d;
            --gold-primary: #FFD700;
            --gold-secondary: #C5A059;
            --text-main: #FFFFFF;
            --text-muted: #AAAAAA;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        html, body { width: 100%; height: 100%; overflow: hidden; background-color: var(--bg-color); color: var(--text-main); position: fixed; }
        
        #neural-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
        
        #auth-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 3, 3, 0.95); display: flex; justify-content: center; align-items: center; z-index: 200; }
        .auth-box { background: var(--panel-color); border: 2px solid var(--gold-primary); padding: 25px; border-radius: 16px; width: 90%; max-width: 350px; text-align: center; box-shadow: 0 0 25px rgba(255, 215, 0, 0.3); }
        .auth-box h2 { color: var(--gold-primary); margin-bottom: 20px; font-size: 22px; }
        .auth-box input { width: 100%; padding: 12px; margin: 10px 0; background: #151515; border: 1px solid #444; color: #fff; border-radius: 8px; outline: none; }
        .auth-box input:focus { border-color: var(--gold-primary); }
        .auth-box button { width: 100%; padding: 12px; margin-top: 15px; background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary)); color: #000; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
        .auth-switch { margin-top: 15px; color: var(--text-muted); font-size: 14px; cursor: pointer; }
        .auth-switch span { color: var(--gold-primary); text-decoration: underline; }

        #app-container { display: none; width: 100%; height: 100%; display: flex; flex-direction: row; z-index: 10; position: relative; }
        
        sidebar { position: absolute; right: -280px; top: 0; width: 280px; height: 100%; background: rgba(10, 10, 10, 0.98); border-left: 1px solid rgba(255, 215, 0, 0.4); display: flex; flex-direction: column; padding: 20px; transition: 0.3s ease; z-index: 150; box-shadow: -5px 0 25px rgba(0,0,0,0.9); }
        sidebar.open { right: 0; }
        .sidebar-header { font-size: 18px; color: var(--gold-primary); font-weight: bold; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .close-sidebar { background: none; border: none; color: var(--gold-primary); font-size: 20px; cursor: pointer; }
        .new-chat-btn { background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-bottom: 20px; transition: 0.3s; }
        .new-chat-btn:hover { background: var(--gold-primary); color: #000; }
        .chat-history-list { flex-grow: 1; overflow-y: auto; }
        .logout-btn { background: #b52a2a; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px; }

        .chat-main { flex-grow: 1; width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(3, 3, 3, 0.75); }
        .chat-header { padding: 12px 20px; background: rgba(10, 10, 10, 0.95); border-bottom: 1px solid rgba(255, 215, 0, 0.2); display: flex; justify-content: space-between; align-items: center; height: 60px; }
        .chat-header h1 { font-size: 15px; color: var(--gold-primary); }
        .menu-toggle-btn { background: none; border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; }
        
        .chat-messages { flex-grow: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .message { max-width: 85%; padding: 12px 16px; border-radius: 12px; line-height: 1.5; font-size: 14px; white-space: pre-wrap; word-wrap: break-word; }
        
        .message.user { background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary)); color: #000; align-self: flex-start; font-weight: 600; }
        .message.ai { background: #141414; color: #fff; align-self: flex-end; border: 1px solid rgba(255, 215, 0, 0.35); }
        
        .chat-input-area { padding: 15px; background: rgba(10, 10, 10, 0.95); border-top: 1px solid rgba(255, 215, 0, 0.2); display: flex; gap: 10px; height: 75px; }
        .chat-input-area input { flex-grow: 1; padding: 12px; background: #121212; border: 1px solid #444; color: #fff; border-radius: 10px; outline: none; font-size: 14px; }
        .chat-input-area input:focus { border-color: var(--gold-primary); }
        .chat-input-area button { padding: 0 20px; background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary)); color: #000; font-weight: bold; border: none; border-radius: 10px; cursor: pointer; font-size: 15px; }
    </style>
</head>
<body>
    <canvas id="neural-canvas"></canvas>
    <div id="auth-container">
        <div class="auth-box">
            <h2 id="auth-title">تسجيل الدخول - FD_56</h2>
            <input type="text" id="username" placeholder="اسم المستخدم">
            <input type="password" id="password" placeholder="الرقم السري">
            <button onclick="handleAuth()" id="auth-btn">دخول</button>
            <div class="auth-switch" onclick="toggleAuthMode()">ليس لديك حساب؟ <span id="switch-text">أنشئ حساب جديد</span></div>
        </div>
    </div>

    <div id="app-container">
        <div class="chat-main">
            <div class="chat-header">
                <h1 id="welcome-user">FD_56 Elite AI</h1>
                <button class="menu-toggle-btn" onclick="toggleSidebar()">☰ القائمة</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message ai">أهلاً بك. أنا جاهز لأوامرك ومساعدتك في كل ما تريده.</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="user-input" placeholder="اكتب رسالتك هنا..." onkeypress="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()">إرسال ⚡</button>
            </div>
        </div>

        <sidebar id="sidebar-menu">
            <div class="sidebar-header">
                <span>سجل المحادثات</span>
                <button class="close-sidebar" onclick="toggleSidebar()">✕</button>
            </div>
            <button class="new-chat-btn" onclick="newChat(); toggleSidebar();">+ محادثة جديدة</button>
            <div class="chat-history-list" id="history-list"></div>
            <button class="logout-btn" onclick="logout()">تسجيل خروج</button>
        </sidebar>
    </div>

    <script>
        const API_URL = "/api";
        let currentUser = null;
        let isSignupMode = false;

        const canvas = document.getElementById('neural-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        for (let i = 0; i < 65; i++) {
            particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.9, vy: (Math.random() - 0.5) * 0.9, radius: Math.random() * 3 + 1.5 });
        }

        function animateNeural() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
            ctx.lineWidth = 1.2;
            particles.forEach((p, index) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
                for (let j = index + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    if (Math.hypot(p.x - p2.x, p.y - p2.y) < 140) {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animateNeural);
        }
        animateNeural();

        function toggleSidebar() {
            document.getElementById('sidebar-menu').classList.toggle('open');
        }

        function toggleAuthMode() {
            isSignupMode = !isSignupMode;
            document.getElementById('auth-title').innerText = isSignupMode ? "إنشاء حساب جديد - FD_56" : "تسجيل الدخول - FD_56";
            document.getElementById('auth-btn').innerText = isSignupMode ? "تسجيل" : "دخول";
            document.getElementById('switch-text').innerText = isSignupMode ? "لديك حساب بالفعل؟ تسجيل دخول" : "أنشئ حساب جديد";
        }

        async function handleAuth() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            if (!username || !password) return alert("يرجى ملء جميع الحقول!");
            const endpoint = isSignupMode ? '/signup' : '/login';
            try {
                const res = await fetch(API_URL + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (res.ok) {
                    currentUser = username;
                    document.getElementById('auth-container').style.display = 'none';
                    document.getElementById('app-container').style.display = 'flex';
                    document.getElementById('welcome-user').innerText = 'مرحباً، ' + username;
                    loadHistory();
                } else { alert(data.message); }
            } catch (e) { alert("حدث خطأ في الاتصال بالخادم."); }
        }

        function logout() {
            currentUser = null;
            document.getElementById('app-container').style.display = 'none';
            document.getElementById('auth-container').style.display = 'flex';
        }

        async function loadHistory() {
            try {
                const res = await fetch(API_URL + '/chats/' + currentUser);
                const data = await res.json();
                const messagesDiv = document.getElementById('chat-messages');
                messagesDiv.innerHTML = '<div class="message ai">أهلاً بك يا ' + currentUser + '. أنا جاهز لخدمتك وتنفيذ أوامرك.</div>';
                data.chats.forEach(chat => {
                    messagesDiv.innerHTML += '<div class="message ' + (chat.role === 'user' ? 'user' : 'ai') + '">' + escapeHtml(chat.text) + '</div>';
                });
            } catch(e) {}
        }

        async function sendMessage() {
            const input = document.getElementById('user-input');
            const text = input.value.trim();
            if (!text) return;
            const messagesDiv = document.getElementById('chat-messages');
            messagesDiv.innerHTML += '<div class="message user">' + escapeHtml(text) + '</div>';
            input.value = '';
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            try {
                const res = await fetch(API_URL + '/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUser, message: text })
                });
                const data = await res.json();
                messagesDiv.innerHTML += '<div class="message ai">' + escapeHtml(data.reply) + '</div>';
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            } catch (e) {
                messagesDiv.innerHTML += '<div class="message ai">عذراً، حدث خطأ في الاتصال.</div>';
            }
        }

        function escapeHtml(text) {
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        function newChat() { loadHistory(); }
    </script>
</body>
</html>`);
});

app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'يرجى إدخال البيانات كاملة' });
    if (usersDB.find(u => u.username === username)) return res.status(400).json({ success: false, message: 'اسم المستخدم مستخدم مسبقاً' });
    usersDB.push({ username, password });
    chatsDB[username] = [];
    res.json({ success: true, message: 'تم إنشاء الحساب بنجاح' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
    else res.status(401).json({ success: false, message: 'خطأ في اسم المستخدم أو الرقم السري' });
});

app.get('/api/chats/:username', (req, res) => {
    res.json({ chats: chatsDB[req.params.username] || [] });
});

app.post('/api/chat', (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) return res.status(400).json({ reply: "بيانات ناقصة" });
    
    if (!chatsDB[username]) chatsDB[username] = [];
    chatsDB[username].push({ role: 'user', text: message });

    callGeminiAPI(username, message, (err, replyText) => {
        if (err) {
            res.status(500).json({ reply: "عذراً، حدث خطأ في النظام." });
        } else {
            chatsDB[username].push({ role: 'ai', text: replyText });
            res.json({ reply: replyText });
        }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
