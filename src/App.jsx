import { useState, useEffect, useRef } from 'react';

// 全局样式字符串（避免 JSX 解析冲突）
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
    --shadow-soft: 0 2px 16px rgba(80,60,40,0.06);
    --shadow-popup: 0 8px 32px rgba(80,60,40,0.1);
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
    height:100vh; height:100dvh; width:100vw; overflow:hidden; display:flex; justify-content:center; align-items:center;
    background: var(--bg-outer); transition: background 0.5s;
    font-size: calc(var(--font-size-base) * var(--ui-scale));
    user-select: none; -webkit-user-select: none;
  }
  .bg-container {
    position:fixed; top:0; left:0; right:0; bottom:0; z-index:-1; background-size:cover; background-position:center;
    pointer-events:none;
  }
  .bg-default { background: linear-gradient(175deg, #e8e0d5, #efe8dc, #f2ece2, #e5ddd3, #d9cfc3, #e3d9cb, #ece3d6, #f0e8db, #e8ddd0); }
  .bg-default::before {
    content:''; position:absolute; bottom:0; left:0; right:0; height:38%;
    background: linear-gradient(180deg, transparent, rgba(230,218,205,0.3) 18%, rgba(215,200,182,0.5) 45%, rgba(200,185,165,0.65) 100%);
    animation: mistFloat 10s ease-in-out infinite;
  }
  .bg-default::after {
    content:''; position:absolute; bottom:8%; left:-3%; right:-3%; height:28%;
    background: radial-gradient(ellipse at 35% 50%, rgba(255,250,242,0.45) 0%, transparent 58%);
    animation: mistFloat2 14s ease-in-out infinite;
  }
  @keyframes mistFloat { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:0.9;transform:translateX(18px)} }
  @keyframes mistFloat2 { 0%,100%{opacity:0.45;transform:translateX(0)} 50%{opacity:0.75;transform:translateX(-16px)} }
  .sidebar { position:fixed; left:0; top:0; bottom:0; width:275px; background:var(--sidebar-bg); backdrop-filter:blur(22px); z-index:50; transform:translateX(-100%); transition:0.32s; border-right:1px solid var(--border-subtle); border-radius:0 16px 16px 0; display:flex; flex-direction:column; }
  .sidebar.open { transform:translateX(0); }
  .sidebar-header { padding:18px 14px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--divider); }
  .new-chat-btn { background:linear-gradient(135deg, var(--accent), var(--accent2)); border:none; color:#fff; padding:7px 14px; border-radius:18px; cursor:pointer; font-weight:500; font-size:0.85em; }
  .chat-list { flex:1; overflow-y:auto; padding:6px 8px; }
  .chat-item { padding:11px 12px; margin:3px 0; border-radius:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-size:0.9em; color:var(--text-primary); }
  .chat-item.active { background:var(--badge-bg); font-weight:500; }
  .chat-title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:170px; }
  .chat-delete { opacity:0.35; padding:4px 6px; border-radius:6px; }
  .chat-delete:hover { opacity:1; background:rgba(200,100,80,0.12); color:#c06050; }
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
  .typing-indicator span:nth-child(1) { animation-delay:0s; }
  .typing-indicator span:nth-child(2) { animation-delay:0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay:0.4s; }
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
  // ==================== 状态 ====================
  const [agentConfig, setAgentConfig] = useState(() => {
    const saved = localStorage.getItem('ins_agent_config');
    return saved ? JSON.parse(saved) : {
      name: '智能体',
      prompt: '你是一个贴心、知识渊博的AI助手，回答简洁生动，富有温度。',
      voiceIndex: 0,
      autoSpeak: true,
      maxTokens: 1024,
      temperature: 0.7,
      avatar: null,
    };
  });
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('ins_conversations');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const savedId = localStorage.getItem('ins_currentChatId');
    // 注意：此时 conversations 已经是初始化后的值，可直接使用
    if (savedId && conversations[savedId]) return savedId;
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    // 添加初始对话
    conversations[id] = { title: '新对话', messages: [], history: [] };
    return id;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('ins_theme') || 'light');
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('ins_uiScale')) || 1);
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('ins_fontSize')) || 15);
  const [customBg, setCustomBg] = useState(() => localStorage.getItem('ins_customBg') || null);
  const [appWidth, setAppWidth] = useState(() => parseInt(localStorage.getItem('ins_appWidth')) || 520);
  const [appHeight, setAppHeight] = useState(() => parseInt(localStorage.getItem('ins_appHeight')) || 700);
  const [editMsg, setEditMsg] = useState(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 声音
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 持久化
  useEffect(() => { localStorage.setItem('ins_agent_config', JSON.stringify(agentConfig)); }, [agentConfig]);
  useEffect(() => { localStorage.setItem('ins_conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('ins_currentChatId', currentChatId); }, [currentChatId]);
  useEffect(() => { localStorage.setItem('ins_theme', theme); document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', uiScale);
    document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');
    localStorage.setItem('ins_uiScale', uiScale);
    localStorage.setItem('ins_fontSize', fontSize);
  }, [uiScale, fontSize]);
  useEffect(() => {
    if (customBg) localStorage.setItem('ins_customBg', customBg);
    else localStorage.removeItem('ins_customBg');
  }, [customBg]);
  useEffect(() => { localStorage.setItem('ins_appWidth', appWidth); localStorage.setItem('ins_appHeight', appHeight); }, [appWidth, appHeight]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations[currentChatId]?.messages]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2100);
  };

  const speak = (text) => {
    if (!agentConfig.autoSpeak) return;
    speechSynthesis.cancel();
    const cleaned = text.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length > 2000) return;
    const u = new SpeechSynthesisUtterance(cleaned);
    if (voices[agentConfig.voiceIndex]) u.voice = voices[agentConfig.voiceIndex];
    u.rate = 1.0; u.volume = 0.9;
    speechSynthesis.speak(u);
  };

  const createNewChat = () => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    setConversations(prev => ({ ...prev, [id]: { title: '新对话', messages: [], history: [] } }));
    setCurrentChatId(id);
    setSidebarOpen(false);
    showToast('✨ 新对话已创建');
  };

  // 发送消息（完全函数式更新）
  const sendMessage = async (text = null) => {
    const inputText = text || document.getElementById('userInput')?.value.trim();
    if (!inputText || isTyping) return;
    document.getElementById('userInput').value = '';
    setIsTyping(true);

    // 先添加用户消息
    setConversations(prev => {
      const chat = prev[currentChatId] || { messages: [], history: [], title: '新对话' };
      const userMsg = { role: 'user', content: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      const newMessages = [...chat.messages, userMsg];
      const newHistory = [...chat.history, { role: 'user', content: inputText }];
      const newTitle = chat.messages.length === 0 ? inputText.slice(0, 25) + (inputText.length > 25 ? '...' : '') : chat.title;
      return { ...prev, [currentChatId]: { ...chat, messages: newMessages, history: newHistory, title: newTitle } };
    });

        try {
      const response = await fetch('https://my-agent-backend-f3qq.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '请求失败');
      const replyText = data.reply;

      const aiMsg = { role: 'ai', content: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setConversations(prev => {
        const chat = prev[currentChatId];
        if (!chat) return prev;
        return {
          ...prev,
          [currentChatId]: {
            ...chat,
            messages: [...chat.messages, aiMsg],
            history: [...chat.history, { role: 'assistant', content: replyText }],
          }
        };
      });
      speak(replyText);
    } catch (e) {
      showToast('回复生成失败：' + e.message);
    }
    setIsTyping(false);
  };

  const regenerate = async () => {
    if (isTyping) return;
    setIsTyping(true);
    let userContent = '';
    setConversations(prev => {
      const chat = prev[currentChatId];
      if (!chat) return prev;
      const msgs = chat.messages;
      const lastAiIdx = msgs.map((m, i) => m.role === 'ai' ? i : -1).filter(i => i !== -1).pop();
      if (lastAiIdx === undefined) return prev;
      const newMsgs = msgs.slice(0, lastAiIdx);
      const userMsg = newMsgs[newMsgs.length - 1];
      if (!userMsg || userMsg.role !== 'user') return prev;
      userContent = userMsg.content;
      const newHistory = chat.history.slice(0, lastAiIdx);
      return { ...prev, [currentChatId]: { ...chat, messages: newMsgs, history: newHistory } };
    });
    if (userContent) await sendMessage(userContent);
    else setIsTyping(false);
  };

  const handleEdit = (msg) => {
    setEditMsg(msg);
    setEditText(msg.content);
  };

  const submitEdit = async () => {
    if (!editMsg || !editText.trim()) return;
    // 截断消息列表到该消息之前
    setConversations(prev => {
      const chat = prev[currentChatId];
      if (!chat) return prev;
      const idx = chat.messages.indexOf(editMsg);
      if (idx === -1) return prev;
      const newMessages = chat.messages.slice(0, idx);
      const newHistory = chat.history.slice(0, idx);
      return { ...prev, [currentChatId]: { ...chat, messages: newMessages, history: newHistory } };
    });
    setEditMsg(null);
    await sendMessage(editText.trim());
  };

  const deleteChat = (id) => {
    setConversations(prev => {
      if (Object.keys(prev).length <= 1) {
        showToast('至少保留一个对话');
        return prev;
      }
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (currentChatId === id) {
      const remaining = Object.keys(conversations).filter(k => k !== id);
      if (remaining.length > 0) setCurrentChatId(remaining[0]);
    }
    showToast('对话已删除');
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let messages = [];
        const content = ev.target.result;
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (Array.isArray(data)) messages = data;
        } else {
          const lines = content.split('\n').filter(l => l.trim());
          for (const line of lines) {
            if (line.startsWith('用户:') || line.startsWith('user:'))
              messages.push({ role: 'user', content: line.replace(/^(用户:|user:)\s*/i, '') });
            else if (line.startsWith('AI:') || line.startsWith('ai:'))
              messages.push({ role: 'ai', content: line.replace(/^(AI:|ai:)\s*/i, '') });
          }
        }
        if (messages.length === 0) { showToast('未识别到任何聊天记录'); return; }
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
        const newChat = {
          title: `导入记录 ${new Date().toLocaleDateString()}`,
          messages: messages.map(m => ({ ...m, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })),
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
        };
        setConversations(prev => ({ ...prev, [id]: newChat }));
        setCurrentChatId(id);
        showToast(`成功导入 ${messages.length} 条记录`);
      } catch (err) {
        showToast('文件解析失败，请检查格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openMemory = () => { setMemoryOpen(true); setSidebarOpen(false); };
  const closeMemory = () => setMemoryOpen(false);

  const saveSettings = () => {
    const name = document.getElementById('setName')?.value.trim() || agentConfig.name;
    const prompt = document.getElementById('setPrompt')?.value.trim() || agentConfig.prompt;
    const autoSpeak = document.getElementById('setAutoSpeak')?.checked ?? agentConfig.autoSpeak;
    const maxTokens = parseInt(document.getElementById('setMaxTokens')?.value) || 1024;
    const temperature = parseFloat(document.getElementById('setTemperature')?.value) || 0.7;
    const voiceIdx = parseInt(document.getElementById('setVoice')?.value) || 0;
    const scale = parseFloat(document.getElementById('setScale')?.value) || 1;
    const size = parseInt(document.getElementById('setFontSize')?.value) || 15;
    setAgentConfig(prev => ({ ...prev, name, prompt, autoSpeak, maxTokens, temperature, voiceIndex: voiceIdx }));
    setUiScale(scale);
    setFontSize(size);
    const bgFile = document.getElementById('bgFileInput')?.files[0];
    if (bgFile) {
      const reader = new FileReader();
      reader.onload = () => setCustomBg(reader.result);
      reader.readAsDataURL(bgFile);
    }
    setSettingsOpen(false);
    showToast('✅ 设定已保存');
  };

  const clearConversation = () => {
    if (isTyping) { showToast('请先停止生成'); return; }
    setConversations(prev => ({
      ...prev,
      [currentChatId]: { title: '新对话', messages: [], history: [] }
    }));
    setSettingsOpen(false);
    showToast('🗑️ 对话已清空');
    setTimeout(() => {
      const aiMsg = { role: 'ai', content: '嗨！我是你的智能助手，有什么想聊的吗？🌿', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setConversations(prev => {
        const chat = prev[currentChatId] || { messages: [], history: [] };
        return {
          ...prev,
          [currentChatId]: { ...chat, messages: [aiMsg], history: [{ role: 'assistant', content: aiMsg.content }] }
        };
      });
    }, 300);
  };

  const resizeStart = (e) => {
    if (window.innerWidth < 768) return;
    const startX = e.clientX, startY = e.clientY, w = appWidth, h = appHeight;
    const onMove = (ev) => {
      const newW = Math.max(340, Math.min(900, w + ev.clientX - startX));
      const newH = Math.max(420, Math.min(window.innerHeight * 0.92, h + ev.clientY - startY));
      setAppWidth(newW);
      setAppHeight(newH);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  };

  // 当前对话（用于渲染，但操作已全部函数式，此处仅读取）
  const chat = conversations[currentChatId] || { messages: [], history: [], title: '新对话' };

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
          {Object.entries(conversations).map(([id, c]) => (
            <div key={id} className={`chat-item ${id === currentChatId ? 'active' : ''}`}>
              <span className="chat-title" onClick={() => { setCurrentChatId(id); setSidebarOpen(false); }}>{c.title}</span>
              <span className="chat-delete" onClick={(e) => { e.stopPropagation(); deleteChat(id); }}>🗑️</span>
            </div>
          ))}
        </div>
        <div className="memory-btn" onClick={openMemory}>📚 记忆库 · 浏览全部记录</div>
        <div className="memory-btn" onClick={() => fileInputRef.current?.click()}>📥 导入聊天记录</div>
        <input type="file" ref={fileInputRef} accept=".txt,.json" style={{ display: 'none' }} onChange={handleFileImport} />
      </div>

      <div className="app-container" style={{ width: window.innerWidth >= 768 ? appWidth : '100%', height: window.innerWidth >= 768 ? appHeight : '100dvh' }}>
        {window.innerWidth >= 768 && <div className="resize-handle" onMouseDown={resizeStart} />}
        <div className="header">
          <span className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</span>
          <div className="avatar-wrapper" onClick={() => avatarInputRef.current?.click()}>
            <div className="avatar" id="avatarDisplay">
              {agentConfig.avatar ? <img src={agentConfig.avatar} alt="头像" /> : '🤖'}
            </div>
            <div className="avatar-edit-badge">✎</div>
          </div>
          <div className="header-info">
            <span className="header-name">{agentConfig.name}</span>
            <span className="header-desc"> </span>
          </div>
          <span className="theme-toggle-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="切换主题">🌓</span>
          <span className="theme-toggle-btn" onClick={() => setSettingsOpen(true)} title="设置" style={{ fontSize: '1.3em', marginLeft: 4 }}>⚙️</span>
        </div>

        <div className="messages">
          {chat.messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`msg-wrapper ${msg.role}`}>
                <div
                  className="msg-bubble"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                  onClick={() => msg.role === 'user' && handleEdit(msg)}
                >
                  {msg.content}
                </div>
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

      {/* 记忆库弹窗 */}
      {memoryOpen && (
        <div className="memory-overlay" onClick={closeMemory}>
          <div className="memory-panel" onClick={(e) => e.stopPropagation()}>
            <h3>📚 所有对话记录</h3>
            {Object.keys(conversations).length === 0 ? <p>暂无记录</p> : (
              Object.entries(conversations).map(([id, c]) => (
                <details key={id}>
                  <summary>{c.title} ({c.messages.length}条消息)</summary>
                  <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                    {c.messages.map((m, i) => (
                      <p key={i}><b>{m.role === 'user' ? '🧑 我' : '🤖 AI'}:</b> {m.content.slice(0, 120)}{m.content.length > 120 ? '...' : ''}</p>
                    ))}
                  </div>
                </details>
              ))
            )}
            <button className="modal-btn secondary" onClick={closeMemory} style={{ marginTop: 16 }}>关闭</button>
          </div>
        </div>
      )}

      {/* 设置弹窗 */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>⚙️ 智能体设置</h3>
            <div className="avatar-upload-section">
              <div className="avatar-upload-preview" onClick={() => avatarInputRef.current?.click()}>
                {agentConfig.avatar ? <img src={agentConfig.avatar} alt="头像" /> : '🤖'}
              </div>
              <button className="avatar-upload-btn" onClick={() => avatarInputRef.current?.click()}>📷 上传头像</button>
            </div>
            <div className="modal-field"><label>智能体名字</label><input type="text" id="setName" defaultValue={agentConfig.name} /></div>
            <div className="modal-field"><label>系统提示词</label><textarea id="setPrompt" rows="3" defaultValue={agentConfig.prompt} /></div>
            <div className="modal-field"><label>语音选择</label><select id="setVoice" defaultValue={agentConfig.voiceIndex}>
              {voices.map((v, i) => <option key={i} value={i}>{v.name} ({v.lang})</option>)}
            </select></div>
            <div className="modal-field"><label><input type="checkbox" id="setAutoSpeak" defaultChecked={agentConfig.autoSpeak} /> 自动朗读AI回复</label></div>
            <div className="modal-field"><label>最大回复长度 (tokens)</label><input type="number" id="setMaxTokens" defaultValue={agentConfig.maxTokens} /></div>
            <div className="modal-field"><label>温度 <span id="tempVal">{agentConfig.temperature}</span></label><input type="range" id="setTemperature" min="0" max="1" step="0.05" defaultValue={agentConfig.temperature} onChange={(e) => document.getElementById('tempVal').textContent = e.target.value} /></div>
            <div className="modal-field"><label>界面缩放 <span id="scaleVal">{uiScale.toFixed(2)}</span></label><input type="range" id="setScale" min="0.8" max="1.5" step="0.05" defaultValue={uiScale} onChange={(e) => document.getElementById('scaleVal').textContent = parseFloat(e.target.value).toFixed(2)} /></div>
            <div className="modal-field"><label>字号 <span id="fontSizeVal">{fontSize}px</span></label><input type="range" id="setFontSize" min="12" max="22" step="1" defaultValue={fontSize} onChange={(e) => document.getElementById('fontSizeVal').textContent = e.target.value + 'px'} /></div>
            <div className="modal-field"><label>自定义背景图片</label><input type="file" id="bgFileInput" accept="image/*" /></div>
            <button className="modal-btn primary" onClick={saveSettings}>💾 保存设定</button>
            <button className="modal-btn danger" onClick={clearConversation}>🗑️ 清空当前对话</button>
            <button className="modal-btn secondary" onClick={() => setSettingsOpen(false)}>取消</button>
          </div>
        </div>
      )}

      {/* 编辑消息弹窗 */}
      {editMsg && (
        <div className="modal-overlay" onClick={() => setEditMsg(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ 编辑消息</h3>
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="modal-btn primary" onClick={submitEdit}>保存并重发</button>
              <button className="modal-btn secondary" onClick={() => setEditMsg(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const max = 200;
            let w = img.width, h = img.height;
            if (w > h) { if (w > max) { h = h * max / w; w = max; } } else { if (h > max) { w = w * max / h; h = max; } }
            canvas.width = Math.round(w); canvas.height = Math.round(h);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            setAgentConfig(prev => ({ ...prev, avatar: canvas.toDataURL('image/jpeg', 0.8) }));
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }} />

      {toastMsg && <div className="toast show">{toastMsg}</div>}

      <style>{globalStyles}</style>
    </>
  );
}