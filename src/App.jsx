import { useState, useEffect, useRef } from 'react';

// ========== 配置 ==========
const BACKEND_URL = 'https://my-agent-backend-f3qq.onrender.com'; // ← 改成你自己的 Render 地址

// ========== 全局样式 ==========
const globalStyles = `
  :root {
    --bg-outer: #f5f0e9;
    --text-primary: #4a3f3a;
    --text-secondary: #8c7f76;
    --text-tertiary: #b0a59c;
    --surface-header: rgba(255,252,248,0.6);
    --border-subtle: rgba(180,170,158,0.3);
    --bubble-user: #e7efe3;
    --bubble-ai: rgba(255,252,248,0.85);
    --accent: #d4a5a5;
    --accent2: #c3bef0;
    --accent-warm: #e0c9b8;
    --pearl-base: rgba(255,252,248,0.65);
    --sidebar-bg: rgba(255,252,248,0.85);
    --sidebar-hover: rgba(180,150,130,0.08);
    --modal-bg: #fefcf9;
    --input-bg: rgba(255,252,248,0.9);
    --input-border: rgba(180,160,140,0.25);
    --toast-bg: rgba(60,45,35,0.85);
    --toast-color: #fff;
    --font-size-base: 15px;
    --ui-scale: 1;
    --badge-bg: rgba(212,165,165,0.2);
    --divider: rgba(180,160,140,0.2);
    --scrollbar-thumb: rgba(160,140,120,0.25);
  }
  [data-theme="dark"] {
    --bg-outer: #1c1a18;
    --text-primary: #e4ded8;
    --text-secondary: #a0988e;
    --text-tertiary: #6b635b;
    --surface-header: rgba(32,30,28,0.7);
    --border-subtle: rgba(90,80,70,0.35);
    --bubble-user: #2a3528;
    --bubble-ai: rgba(36,34,30,0.9);
    --accent: #c49b9b;
    --accent2: #9b95d4;
    --accent-warm: #b8957e;
    --pearl-base: rgba(38,35,32,0.7);
    --sidebar-bg: rgba(30,28,25,0.9);
    --modal-bg: #252320;
    --input-bg: rgba(40,37,33,0.9);
    --input-border: rgba(100,88,75,0.35);
    --toast-bg: rgba(240,235,225,0.9);
    --toast-color: #1c1a18;
    --badge-bg: rgba(196,155,155,0.2);
    --divider: rgba(100,88,75,0.25);
    --scrollbar-thumb: rgba(120,105,90,0.3);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { height:100%; -webkit-tap-highlight-color:transparent; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", sans-serif;
    height:100vh; height:100dvh; width:100vw; overflow:hidden; display:flex; justify-content:center; align-items:center;
    background: var(--bg-outer); transition: background 0.5s;
    font-size: calc(var(--font-size-base) * var(--ui-scale));
    user-select: none; -webkit-user-select: none;
  }
  .bg-container { position:fixed; top:0; left:0; right:0; bottom:0; z-index:-1; background-size:cover; background-position:center; pointer-events:none; }
  .bg-default { background: linear-gradient(175deg, #e8e0d5, #efe8dc, #f2ece2, #e5ddd3, #d9cfc3, #e3d9cb, #ece3d6, #f0e8db, #e8ddd0); }
  .bg-default::before { content:''; position:absolute; bottom:0; left:0; right:0; height:38%; background: linear-gradient(180deg, transparent, rgba(230,218,205,0.3) 18%, rgba(215,200,182,0.5) 45%, rgba(200,185,165,0.65) 100%); animation: mistFloat 10s ease-in-out infinite; }
  .bg-default::after { content:''; position:absolute; bottom:8%; left:-3%; right:-3%; height:28%; background: radial-gradient(ellipse at 35% 50%, rgba(255,250,242,0.45) 0%, transparent 58%); animation: mistFloat2 14s ease-in-out infinite; }
  @keyframes mistFloat { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:0.9;transform:translateX(18px)} }
  @keyframes mistFloat2 { 0%,100%{opacity:0.45;transform:translateX(0)} 50%{opacity:0.75;transform:translateX(-16px)} }
  .sidebar { position:fixed; left:0; top:0; bottom:0; width:275px; background:var(--sidebar-bg); backdrop-filter:blur(22px); z-index:50; transform:translateX(-100%); transition:0.32s; border-right:1px solid var(--border-subtle); border-radius:0 16px 16px 0; display:flex; flex-direction:column; }
  .sidebar.open { transform:translateX(0); }
  .sidebar-header { padding:18px 14px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--divider); }
  .new-chat-btn { background:linear-gradient(135deg, var(--accent), var(--accent2)); border:none; color:#fff; padding:7px 14px; border-radius:18px; cursor:pointer; font-weight:500; font-size:0.85em; }
  .chat-list { flex:1; overflow-y:auto; padding:6px 8px; }
  .chat-item { padding:11px 12px; margin:3px 0; border-radius:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-size:0.9em; color:var(--text-primary); }
  .chat-item.active { background:var(--badge-bg); font-weight:500; }
  .chat-title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:170px; flex:1; }
  .chat-item-actions { display:flex; gap:4px; opacity:0; transition:opacity 0.2s; }
  .chat-item:hover .chat-item-actions { opacity:1; }
  .chat-item-actions span { cursor:pointer; padding:2px 4px; border-radius:4px; font-size:0.8em; }
  .chat-item-actions span:hover { background:rgba(0,0,0,0.08); }
  .memory-btn { margin:10px 12px; padding:10px; border-radius:12px; background:var(--sidebar-hover); color:var(--text-secondary); cursor:pointer; text-align:center; font-size:0.88em; }
  .memory-btn:hover { background:var(--badge-bg); color:var(--text-primary); }
  .sidebar-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.3); z-index:45; display:none; }
  .sidebar-overlay.show { display:block; }
  .app-container { width:100%; max-width:520px; height:100vh; height:100dvh; display:flex; flex-direction:column; background: radial-gradient(ellipse at 22% 18%, rgba(255,235,225,0.55) 0%, transparent 48%), radial-gradient(ellipse at 72% 55%, rgba(210,220,240,0.4) 0%, transparent 50%), radial-gradient(ellipse at 55% 28%, rgba(250,242,225,0.5) 0%, transparent 44%), radial-gradient(ellipse at 28% 65%, rgba(215,225,210,0.35) 0%, transparent 46%), radial-gradient(ellipse at 65% 78%, rgba(240,225,215,0.38) 0%, transparent 42%), linear-gradient(162deg, var(--pearl-base) 0%, rgba(252,248,240,0.45) 48%, var(--pearl-base) 100%); backdrop-filter:blur(18px); border:1px solid var(--border-subtle); position:relative; }
  @media (min-width:768px) { .app-container { height:88vh; border-radius:22px; margin:16px; } }
  .header { display:flex; align-items:center; padding:10px 14px; background:var(--surface-header); backdrop-filter:blur(10px); border-bottom:1px solid var(--border-subtle); }
  .sidebar-toggle { font-size:1.3em; cursor:pointer; color:var(--text-secondary); }
  .avatar-wrapper { position:relative; cursor:pointer; }
  .avatar { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, var(--accent), var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:20px; overflow:hidden; border:2px solid rgba(255,255,255,0.5); }
  .avatar img { width:100%; height:100%; object-fit:cover; }
  .avatar-edit-badge { position:absolute; bottom:-2px; right:-3px; width:18px; height:18px; background:var(--accent-warm); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; color:#fff; }
  .header-info { flex:1; margin-left:10px; }
  .header-name { font-weight:600; color:var(--text-primary); }
  .header-desc { font-size:0.72em; color:var(--text-tertiary); }
  .theme-toggle-btn { cursor:pointer; font-size:1.2em; padding:5px 7px; }
  .messages { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:7px; }
  .msg-wrapper { max-width:83%; animation:msgIn 0.28s ease-out; }
  .msg-wrapper.user { align-self:flex-end; }
  .msg-wrapper.ai { align-self:flex-start; }
  .msg-bubble { padding:10px 15px; border-radius:18px; font-size:0.94em; line-height:1.55; word-break:break-word; user-select:text; }
  .msg-wrapper.user .msg-bubble { background:var(--bubble-user); border-bottom-right-radius:6px; }
  .msg-wrapper.ai .msg-bubble { background:var(--bubble-ai); border-bottom-left-radius:6px; border:1px solid var(--border-subtle); }
  .msg-time { font-size:0.65em; color:var(--text-tertiary); margin-top:2px; }
  .ai-actions { display:flex; gap:12px; margin-top:4px; margin-left:8px; font-size:0.9em; color:var(--text-secondary); }
  .ai-actions span { cursor:pointer; opacity:0.7; }
  .ai-actions span:hover { opacity:1; }
  .typing-indicator { align-self:flex-start; padding:12px 16px; background:var(--bubble-ai); border-radius:18px; display:flex; gap:4px; border:1px solid var(--border-subtle); }
  .typing-indicator span { width:7px; height:7px; background:var(--text-tertiary); border-radius:50%; animation:typing 1.4s infinite; }
  @keyframes typing { 0%,80%,100%{transform:scale(0.6);opacity:0.35} 40%{transform:scale(1);opacity:1} }
  .input-area { display:flex; padding:8px 12px; background:var(--surface-header); backdrop-filter:blur(10px); border-top:1px solid var(--border-subtle); }
  #userInput { flex:1; padding:10px 15px; border:1.5px solid var(--input-border); border-radius:22px; background:var(--input-bg); resize:none; font-family:inherit; font-size:0.94em; color:var(--text-primary); }
  #sendBtn { width:41px; height:41px; border-radius:50%; border:none; background:linear-gradient(135deg, var(--accent), var(--accent2)); color:#fff; font-size:1.1em; cursor:pointer; margin-left:8px; display:flex; align-items:center; justify-content:center; }
  #sendBtn:disabled { opacity:0.35; }
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:300; display:flex; justify-content:center; align-items:flex-end; }
  .modal-sheet { width:100%; max-width:500px; background:var(--modal-bg); border-radius:22px 22px 0 0; padding:20px; max-height:82vh; overflow-y:auto; color:var(--text-primary); }
  .modal-field { margin-bottom:13px; }
  .modal-field label { display:block; font-size:0.82em; margin-bottom:4px; color:var(--text-secondary); }
  .modal-field input, .modal-field textarea, .modal-field select { width:100%; padding:10px; border:1.5px solid var(--input-border); border-radius:12px; background:var(--input-bg); color:var(--text-primary); font-family:inherit; }
  .modal-btn { width:100%; padding:12px; border:none; border-radius:14px; font-weight:600; cursor:pointer; margin-top:7px; font-size:0.95em; }
  .modal-btn.primary { background:linear-gradient(135deg, var(--accent), var(--accent2)); color:#fff; }
  .modal-btn.secondary { background:rgba(0,0,0,0.04); color:var(--text-secondary); }
  .modal-btn.danger { background:rgba(210,100,80,0.08); color:#c06050; }
  .toast { position:fixed; top:18px; left:50%; transform:translateX(-50%); background:var(--toast-bg); color:var(--toast-color); padding:10px 22px; border-radius:22px; z-index:400; opacity:0; transition:0.35s; pointer-events:none; }
  .toast.show { opacity:1; }
  .memory-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:350; display:flex; justify-content:center; align-items:center; }
  .memory-panel { background:var(--modal-bg); width:90%; max-width:620px; max-height:80vh; border-radius:20px; padding:20px; overflow-y:auto; color:var(--text-primary); }
`;

export default function App() {
  // ========== 状态 ==========
  const [agentConfig] = useState(() => {
    const saved = localStorage.getItem('ins_agent_config');
    return saved ? JSON.parse(saved) : {
      name: '智能体', prompt: '你是一个贴心、知识渊博的AI助手，回答简洁生动，富有温度。',
      voiceIndex: 0, autoSpeak: true, avatar: null,
    };
  });
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('ins_theme') || 'light');
  const [customBg, setCustomBg] = useState(() => localStorage.getItem('ins_customBg') || null);
  const [editMsg, setEditMsg] = useState(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // 声音
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const loadVoices = () => { const v = speechSynthesis.getVoices(); if (v.length) setVoices(v); };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => { localStorage.setItem('ins_theme', theme); document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ========== 加载会话列表 ==========
  const loadSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sessions`);
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
        if (data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(data.sessions[0].id);
        }
      }
    } catch (e) {
      console.error('加载会话列表失败:', e);
    }
  };

  // ========== 加载消息 ==========
  const loadMessages = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/${sessionId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map(m => ({
          role: m.role,
          content: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch (e) {
      console.error('加载消息失败:', e);
    }
  };

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { if (currentSessionId) loadMessages(currentSessionId); }, [currentSessionId]);

  // ========== 工具函数 ==========
  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2100); };
  const speak = (text) => {
    if (!agentConfig.autoSpeak) return;
    speechSynthesis.cancel();
    const cleaned = text.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length > 2000) return;
    const u = new SpeechSynthesisUtterance(cleaned);
    if (voices[agentConfig.voiceIndex]) u.voice = voices[agentConfig.voiceIndex];
    u.rate = 1.0; u.volume = 0.9; speechSynthesis.speak(u);
  };

  // ========== 新建会话 ==========
  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
    showToast('✨ 新对话已创建，发送第一条消息后将自动保存');
  };

  // ========== 发送消息 ==========
  const sendMessage = async (text = null) => {
    const inputText = text || document.getElementById('userInput')?.value.trim();
    if (!inputText || isTyping) return;
    document.getElementById('userInput').value = '';
    setIsTyping(true);

    const userMsg = { role: 'user', content: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);

    try {
      const body = { message: inputText };
      if (currentSessionId) body.sessionId = currentSessionId;

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '请求失败');

      const aiMsg = { role: 'ai', content: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);

      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
        loadSessions();
      }

      speak(data.reply);
    } catch (e) {
      showToast('回复生成失败：' + e.message);
    }
    setIsTyping(false);
  };

  // ========== 重新生成 ==========
  const regenerate = async () => {
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];
    setMessages(prev => prev.slice(0, -1));
    setIsTyping(true);
    try {
      const body = { message: lastUserMsg.content };
      if (currentSessionId) body.sessionId = currentSessionId;
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '请求失败');
      const aiMsg = { role: 'ai', content: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);
      speak(data.reply);
    } catch (e) {
      showToast('重新生成失败：' + e.message);
    }
    setIsTyping(false);
  };

  // ========== 编辑用户消息 ==========
  const handleEdit = (msg) => { setEditMsg(msg); setEditText(msg.content); };
  const submitEdit = async () => {
    if (!editMsg || !editText.trim()) return;
    const idx = messages.indexOf(editMsg);
    if (idx >= 0) setMessages(prev => prev.slice(0, idx));
    setEditMsg(null);
    await sendMessage(editText.trim());
  };

  // ========== 删除会话 ==========
  const deleteChat = async (id) => {
    if (!confirm('确定要删除这个对话吗？')) return;
    try {
      await fetch(`${BACKEND_URL}/api/sessions/${id}`, { method: 'DELETE' });
      if (currentSessionId === id) { setCurrentSessionId(null); setMessages([]); }
      loadSessions();
      showToast('对话已删除');
    } catch (e) {
      showToast('删除失败');
    }
  };

  // ========== 重命名会话 ==========
  const renameChat = async (id) => {
    const name = prompt('请输入新名称：');
    if (!name) return;
    try {
      await fetch(`${BACKEND_URL}/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      loadSessions();
      showToast('已重命名');
    } catch (e) {
      showToast('重命名失败');
    }
  };

  // ========== 导入文件 ==========
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target.result;
        const lines = content.split('\n').filter(l => l.trim());
        const importedMessages = [];
        for (const line of lines) {
          if (line.startsWith('用户:') || line.startsWith('user:'))
            importedMessages.push({ role: 'user', content: line.replace(/^(用户:|user:)\s*/i, '') });
          else if (line.startsWith('AI:') || line.startsWith('ai:'))
            importedMessages.push({ role: 'ai', content: line.replace(/^(AI:|ai:)\s*/i, '') });
        }
        if (importedMessages.length === 0) { showToast('未识别到聊天记录'); return; }
        setMessages(importedMessages.map(m => ({
          ...m,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
        showToast(`已导入 ${importedMessages.length} 条记录（仅本地预览）`);
      } catch (err) { showToast('文件解析失败'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ========== 记忆库 ==========
  const openMemory = () => { setMemoryOpen(true); setSidebarOpen(false); };
  const closeMemory = () => setMemoryOpen(false);

  // ========== 渲染 ==========
  return (
    <>
      <div className="bg-container bg-default" style={{ backgroundImage: customBg ? `url(${customBg})` : undefined }} />
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>💬 对话列表</h2>
          <button className="new-chat-btn" onClick={createNewChat}>＋ 新对话</button>
        </div>
        <div className="chat-list">
          {sessions.map(s => (
            <div key={s.id} className={`chat-item ${s.id === currentSessionId ? 'active' : ''}`}>
              <span className="chat-title" onClick={() => setCurrentSessionId(s.id)}>{s.name}</span>
              <span className="chat-item-actions">
                <span onClick={(e) => { e.stopPropagation(); renameChat(s.id); }}>✏️</span>
                <span onClick={(e) => { e.stopPropagation(); deleteChat(s.id); }}>🗑️</span>
              </span>
            </div>
          ))}
        </div>
        <div className="memory-btn" onClick={openMemory}>📚 记忆库</div>
        <div className="memory-btn" onClick={() => fileInputRef.current?.click()}>📥 导入聊天记录</div>
        <input type="file" ref={fileInputRef} accept=".txt,.json" style={{ display: 'none' }} onChange={handleFileImport} />
      </div>

      <div className="app-container">
        <div className="header">
          <span className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</span>
          <div className="avatar-wrapper" onClick={() => avatarInputRef.current?.click()}>
            <div className="avatar">{agentConfig.avatar ? <img src={agentConfig.avatar} alt="头像" /> : '🤖'}</div>
            <div className="avatar-edit-badge">✎</div>
          </div>
          <div className="header-info"><span className="header-name">{agentConfig.name}</span></div>
          <span className="theme-toggle-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>🌓</span>
          <span className="theme-toggle-btn" onClick={() => setSettingsOpen(true)} style={{ fontSize: '1.3em', marginLeft: 4 }}>⚙️</span>
        </div>

        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`msg-wrapper ${msg.role}`}>
                <div className="msg-bubble" style={{ userSelect: 'text', WebkitUserSelect: 'text' }} onClick={() => msg.role === 'user' && handleEdit(msg)}>{msg.content}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
              {msg.role === 'ai' && (
                <div className="ai-actions">
                  <span onClick={() => speak(msg.content)}>🔊</span>
                  <span onClick={regenerate}>🔄</span>
                  <span onClick={() => { navigator.clipboard.writeText(msg.content); showToast('已复制'); }}>📋</span>
                </div>
              )}
            </div>
          ))}
          {isTyping && <div className="typing-indicator"><span /><span /><span /></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <textarea id="userInput" placeholder="说点什么..." rows="1" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
          <button id="sendBtn" onClick={() => sendMessage()} disabled={isTyping}>➤</button>
        </div>
      </div>

      {memoryOpen && (
        <div className="memory-overlay" onClick={closeMemory}>
          <div className="memory-panel" onClick={e => e.stopPropagation()}>
            <h3>📚 会话列表</h3>
            {sessions.length === 0 ? <p>暂无记录</p> :
              sessions.map(s => (
                <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--divider)', cursor: 'pointer' }} onClick={() => { setCurrentSessionId(s.id); closeMemory(); }}>
                  {s.name} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8em' }}>({new Date(s.updated_at).toLocaleDateString()})</span>
                </div>
              ))
            }
            <button className="modal-btn secondary" onClick={closeMemory} style={{ marginTop: 16 }}>关闭</button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3>⚙️ 智能体设置</h3>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 20 }}>设置功能即将上线</p>
            <button className="modal-btn secondary" onClick={() => setSettingsOpen(false)} style={{ marginTop: 16 }}>关闭</button>
          </div>
        </div>
      )}

      {editMsg && (
        <div className="modal-overlay" onClick={() => setEditMsg(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3>✏️ 编辑消息</h3>
            <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="modal-btn primary" onClick={submitEdit}>保存并重发</button>
              <button className="modal-btn secondary" onClick={() => setEditMsg(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image(); img.onload = () => {
            const canvas = document.createElement('canvas'); const max = 200;
            let w = img.width, h = img.height;
            if (w > h) { if (w > max) { h = h * max / w; w = max; } } else { if (h > max) { w = w * max / h; h = max; } }
            canvas.width = Math.round(w); canvas.height = Math.round(h);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            localStorage.setItem('ins_agent_config', JSON.stringify({ ...agentConfig, avatar: canvas.toDataURL('image/jpeg', 0.8) }));
          }; img.src = ev.target.result;
        }; reader.readAsDataURL(file);
      }} />

      {toastMsg && <div className="toast show">{toastMsg}</div>}
      <style>{globalStyles}</style>
    </>
  );
}