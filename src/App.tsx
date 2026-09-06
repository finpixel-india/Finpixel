import { FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleX,
  Code2,
  Coffee,
  FileText,
  Globe2,
  GraduationCap,
  HeartPulse,
  Hotel,
  Instagram,
  Linkedin,
  Link2,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  MousePointer2,
  PackageCheck,
  Rocket,
  RotateCcw,
  Server,
  Send,
  ShieldCheck,
  Snowflake,
  Store,
  Sun,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

type ContentMap = Record<string, any>;
type SiteRow = { id: number; section: string; sort_order: number; content: any };
type ModalState = { open: boolean; interest: string };
type Theme = 'light' | 'dark';
type ChatMessage = { id: number; role: 'user' | 'assistant'; content: string; error?: boolean };

const GEMINI_PROXY_URL = 'https://mj-proxy.ashishsinghrajputa1.workers.dev/';
const CHAT_MODELS = [
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
  { value: 'gemma-4-31b-it', label: 'Gemma 4 31B IT' },
];
const EDITH_CONTEXT = `You are EDITH, Finpixel India's warm, capable female digital concierge. Finpixel India is an agile, remote-first technology studio founded by Ashish Singh and based in Bihar with a Pan-India vision. The studio builds premium hand-coded websites, 3D experiences, hosting systems, local SEO, social growth, and workflow automation for schools, colleges, hotels, restaurants, clinics, shops, malls, startups, and local brands. Finpixel does not use bloated builders such as Wix or WordPress; it focuses on clean HTML, CSS, JavaScript, strong accessibility, technical SEO, security, and excellent PageSpeed performance. The Trust First model is Demo First, Pay After Approval. Clients own their code, domain, and assets. Current website starting plans are Launch at ₹7,499, Growth at ₹14,999, and Scale at ₹24,999, with final pricing based on scope. Finpixel serves organisations across India and provides direct WhatsApp support. Answer constructively, clearly, and honestly in no more than 1,400 characters. Never invent clients, guarantees, or private facts. Guide visitors toward the right service, plan, free demo, or human conversation when useful. If a visitor repeatedly sends greetings, stop repeating pleasantries and direct them toward one of these useful next steps: explore work, review pricing, request a free demo, or contact the team on WhatsApp.`;

async function sendToGemini(messages: ChatMessage[], model: string) {
  const history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  messages.filter((message) => !message.error).forEach((message) => {
    const role = message.role === 'assistant' ? 'model' : 'user';
    const previous = history[history.length - 1];
    if (previous?.role === role) previous.parts[0].text += `\n\n${message.content}`;
    else history.push({ role, parts: [{ text: message.content }] });
  });
  while (history[0]?.role === 'model') history.shift();
  const contents = [
    { role: 'user', parts: [{ text: EDITH_CONTEXT }] },
    { role: 'model', parts: [{ text: 'Understood. I am EDITH, and I will assist as Finpixel India’s concise, trustworthy digital concierge.' }] },
    ...history,
  ];

  const response = await fetch(GEMINI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Provider': 'gemini', 'X-Model': model },
    body: JSON.stringify({ contents, generationConfig: { temperature: .55, topP: .9, maxOutputTokens: 380 } }),
  });
  let result: any = {};
  try { result = await response.json(); } catch { /* A readable HTTP error is shown below. */ }
  if (!response.ok) {
    const detail = result?.error?.message || result?.message || `Proxy returned ${response.status}`;
    if (model === 'gemma-4-31b-it' && [400, 404, 422].includes(response.status)) throw new Error(`Gemma 4 31B IT is unavailable through the Gemini API right now. Select a Gemini Flash-Lite model and try again. (${detail})`);
    throw new Error(`Unable to reach ${CHAT_MODELS.find((item) => item.value === model)?.label || model}. ${detail}`);
  }
  const rawText = result?.candidates?.[0]?.content?.parts?.filter((part: any) => !part.thought).map((part: any) => part.text || '').join('').trim();
  if (!rawText) throw new Error(`No text was returned by ${CHAT_MODELS.find((item) => item.value === model)?.label || model}. Please choose another model and retry.`);
  if (rawText.length <= 1400) return rawText;
  return `${rawText.slice(0, 1396).replace(/\s+\S*$/, '')}…`;
}

function ChatMessageContent({ text }: { text: string }) {
  const renderInline = (line: string) => line.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
  return <div className="chat-message-content">{text.split('\n').filter((line, index, lines) => line.trim() || (index > 0 && lines[index - 1].trim())).map((line, index) => {
    const bullet = line.trim().match(/^[-*]\s+(.+)/);
    if (bullet) return <div className="chat-message-bullet" key={index}><i />{renderInline(bullet[1])}</div>;
    return <p key={index}>{renderInline(line)}</p>;
  })}</div>;
}

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  business_type: string;
  message: string;
};

const emptyLead: LeadForm = {
  name: '',
  phone: '',
  email: '',
  business_type: '',
  message: '',
};

const iconMap: Record<string, typeof Code2> = {
  code: Code2,
  shield: ShieldCheck,
  chart: BarChart3,
  graduation: GraduationCap,
  hotel: Hotel,
  coffee: Coffee,
  health: HeartPulse,
  retail: Store,
  startup: Rocket,
  maps: Globe2,
  hosting: Server,
  social: Instagram,
  automation: Zap,
  approve: PackageCheck,
  ownership: LockKeyhole,
  speed: Zap,
  support: MessageCircle,
};

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand-mark ${light ? 'brand-mark--light' : ''}`} aria-label="Finpixel">
      <span className="logo-emblem" aria-hidden="true"><img src="/icons/finpixel-nav.webp" alt="" /></span>
      <span className="brand-word"><span className="brand-f"><i />F</span>inpixel</span>
    </span>
  );
}

function Reveal({ children, className = '', delay = 0, zoom = false }: { children: ReactNode; className?: string; delay?: number; zoom?: boolean }) {
  const reduceMotion = useReducedMotion();
  const lightweightMotion = reduceMotion || navigator.hardwareConcurrency <= 4 || window.matchMedia('(max-width: 820px), (pointer: coarse), (update: slow)').matches;
  return (
    <motion.div
      className={className}
      initial={lightweightMotion ? false : { opacity: 0, y: 10, scale: zoom ? .985 : 1 }}
      whileInView={lightweightMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.58, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CountUpText({ value }: { value: string }) {
  const elementRef = useRef<HTMLElement>(null);
  const parsed = value.match(/^(\d+(?:\.\d+)?)(.*)$/);

  useEffect(() => {
    if (!parsed || !elementRef.current) return;
    if (navigator.hardwareConcurrency <= 4 || window.matchMedia('(max-width: 820px), (prefers-reduced-motion: reduce), (update: slow)').matches) {
      elementRef.current.textContent = value;
      return;
    }
    let animationFrame = 0;
    const target = Number(parsed[1]);
    const suffix = parsed[2];
    const decimals = parsed[1].includes('.') ? parsed[1].split('.')[1].length : 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / 900, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (elementRef.current) elementRef.current.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return <b ref={elementRef} aria-label={value}>{parsed ? `0${parsed[2]}` : value}</b>;
}

function LiveCodeWindow({ config }: { config: any }) {
  const reduceMotion = useReducedMotion();
  const lightweightMotion = reduceMotion || navigator.hardwareConcurrency <= 4 || window.matchMedia('(max-width: 820px), (pointer: coarse), (update: slow)').matches;
  const windowRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const tokens = useMemo(() => config.code.match(/\S+\s*/g) || [], [config.code]);
  const [started, setStarted] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState(0);

  useEffect(() => {
    if (lightweightMotion) {
      setVisibleTokens(tokens.length);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
    }, { threshold: .22 });
    if (windowRef.current) observer.observe(windowRef.current);
    return () => observer.disconnect();
  }, [lightweightMotion, tokens.length]);

  useEffect(() => {
    if (!started || visibleTokens >= tokens.length) return;
    const timer = window.setTimeout(() => setVisibleTokens((current) => current + 1), 165);
    return () => window.clearTimeout(timer);
  }, [started, visibleTokens, tokens.length]);

  useEffect(() => {
    if (codeRef.current) codeRef.current.scrollTop = codeRef.current.scrollHeight;
  }, [visibleTokens]);

  const tokenClass = (token: string) => {
    const value = token.trim();
    if (value.startsWith('//')) return 'token-comment';
    if (/^(import|from|const|export|default|return|true|false|new)$/.test(value)) return 'token-keyword';
    if (/^['"`]/.test(value) || /['"`]([,;)]*)$/.test(value)) return 'token-string';
    if (/^\d/.test(value)) return 'token-number';
    if (/^[{}()[\],;.]+$/.test(value)) return 'token-punctuation';
    if (/^[a-zA-Z_$][\w$]*\(/.test(value)) return 'token-function';
    return '';
  };

  const replay = () => {
    setVisibleTokens(0);
    setStarted(true);
    if (codeRef.current) codeRef.current.scrollTop = 0;
  };

  return (
    <section className="code-showcase-section section">
      <div className="code-ambient code-ambient--one" /><div className="code-ambient code-ambient--two" />
      <div className="container">
        <Reveal className="section-heading centered"><Eyebrow>{config.eyebrow}</Eyebrow><h2>{config.headline}</h2><p>{config.subheadline}</p></Reveal>
        <Reveal zoom><div className="live-code-window" ref={windowRef}>
          <div className="code-window-bar"><div className="code-traffic"><i /><i /><i /></div><div className="code-tabs"><span className="active"><Code2 size={13} />{config.filename}</span><span>{config.secondaryFile}</span></div><div className="code-runtime"><i /><span>{visibleTokens >= tokens.length ? config.readyLabel : config.writingLabel}</span>{visibleTokens >= tokens.length && <button onClick={replay} aria-label="Replay live coding"><RotateCcw size={12} /></button>}</div></div>
          <div className="code-progress"><span style={{ width: `${tokens.length ? (visibleTokens / tokens.length) * 100 : 0}%` }} /></div>
          <div className="code-editor"><div className="code-gutter">{config.code.split('\n').map((_: string, index: number) => <span key={index}>{index + 1}</span>)}</div><pre ref={codeRef} aria-label="Live Finpixel code demonstration"><code>{tokens.slice(0, visibleTokens).map((token: string, index: number) => <span className={tokenClass(token)} key={`${index}-${token}`}>{token}</span>)}{visibleTokens < tokens.length && <i className="code-cursor" />}</code></pre><aside><div><span>{config.panelLabel}</span><b>{config.panelTitle}</b></div>{config.checks.map((check: string) => <p key={check}><CheckCircle2 size={13} />{check}</p>)}</aside></div>
          <div className="code-window-footer"><span>{config.language}</span><div>{config.metrics.map((metric: any) => <p key={metric.label}><b>{metric.value}</b>{metric.label}</p>)}</div></div>
        </div></Reveal>
      </div>
    </section>
  );
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <span className={`eyebrow ${dark ? 'eyebrow--dark' : ''}`}><i className="eyebrow-pixel" aria-hidden="true" />{children}</span>;
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32 101.5 32 2.8 131.6 2.8 253.9c0 44 11.5 86.9 33.4 124.7L.7 480l104.9-34.6c36.5 19.9 77.6 30.4 119.4 30.4h.1c122.3 0 222-99.6 222-221.9 0-59.3-23.2-115-66.2-156.8zM224.1 438.3c-37.2 0-73.6-10-105.4-28.9l-7.5-4.5-62.3 20.6 20.9-60.7-4.9-7.8c-20.7-32.9-31.6-71-31.6-110 0-105.6 86-191.5 191.7-191.5 51.2 0 99.3 19.9 135.5 56.1 36.2 36.2 56.1 84.3 56.1 135.5-.1 105.6-86.1 191.2-192.5 191.2zm105.1-143.5c-5.7-2.9-34.1-16.8-39.4-18.7-5.3-2-9.2-2.9-13.1 2.9-3.9 5.7-15 18.7-18.4 22.6-3.4 3.9-6.8 4.3-12.6 1.4-34.2-17.1-56.5-30.5-79.2-69.2-6-10.3 6-9.5 17.1-31.7 1.9-3.9.9-7.2-.5-10.1-1.4-2.9-13.1-31.5-17.9-43.2-4.7-11.4-9.7-9.8-13.1-10-3.4-.2-7.3-.2-11.2-.2s-10.2 1.4-15.5 7.2c-5.3 5.7-20.3 19.8-20.3 48.3s20.8 56 23.7 59.8c2.9 3.9 40.9 62.5 99.1 87.7 36.8 15.9 51.2 17.2 69.6 14.5 11.2-1.7 34.1-13.9 38.9-27.4 4.8-13.5 4.8-25.1 3.4-27.5-1.4-2.4-5.3-3.8-11-6.6z" /></svg>;
}

function ContactIcon({ type, size = 18 }: { type: string; size?: number }) {
  if (type === 'whatsapp') return <WhatsAppIcon size={size} />;
  if (type === 'email') return <Mail size={size} />;
  if (type === 'instagram') return <Instagram size={size} />;
  if (type === 'linkedin') return <Linkedin size={size} />;
  if (type === 'linktree') return <Link2 size={size} />;
  if (type === 'notion') return <FileText size={size} />;
  if (type === 'fiverr') return <span className="brand-glyph brand-glyph--fiverr">fi</span>;
  return <span className="brand-glyph">X</span>;
}

function AiChatbot({ config, onClose }: { config: any; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('finpixel-edith-chat') || '[]');
      if (Array.isArray(saved) && saved.length && saved.every((message) => ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')) return saved.slice(-40);
    } catch { /* Start a clean conversation if stored data is invalid. */ }
    return [{ id: 1, role: 'assistant', content: config.welcome }];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('finpixel-edith-model');
    return CHAT_MODELS.some((model) => model.value === saved) ? saved! : 'gemini-3.5-flash-lite';
  });
  const [modelOpen, setModelOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    localStorage.setItem('finpixel-edith-chat', JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('finpixel-edith-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', closeOnOutsideClick, true);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick, true);
  }, [onClose]);

  useEffect(() => {
    if (!modelOpen) return;
    const closePicker = (event: PointerEvent) => {
      if (!modelPickerRef.current?.contains(event.target as Node)) setModelOpen(false);
    };
    document.addEventListener('pointerdown', closePicker, true);
    return () => document.removeEventListener('pointerdown', closePicker, true);
  }, [modelOpen]);

  const sendMessage = async (text = input) => {
    const clean = text.trim();
    if (!clean || sending) return;
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: clean };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const reply = await sendToGemini(nextMessages, selectedModel);
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', content: error instanceof Error ? error.message : config.error, error: true }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.aside ref={panelRef} className="chatbot-panel" role="dialog" aria-label={config.title} initial={{ opacity: 0, y: 16, scale: .975 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .985 }} transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}>
      <div className="chatbot-glow" />
      <header><div className="chatbot-avatar"><Bot size={19} /></div><div className="chatbot-heading"><b>{config.title}</b><small>{config.subtitle}</small><div className={`chatbot-model-picker ${modelOpen ? 'open' : ''}`} ref={modelPickerRef}><button type="button" onClick={() => setModelOpen(!modelOpen)} aria-haspopup="listbox" aria-expanded={modelOpen}><i /><span>{CHAT_MODELS.find((model) => model.value === selectedModel)?.label}</span><ChevronDown size={12} /></button><AnimatePresence>{modelOpen && <motion.div role="listbox" className="chatbot-model-menu" initial={{ opacity: 0, y: -5, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .99 }} transition={{ duration: .22, ease: [0.16, 1, 0.3, 1] }}>{CHAT_MODELS.map((model) => <button type="button" role="option" aria-selected={selectedModel === model.value} key={model.value} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setSelectedModel(model.value); setModelOpen(false); }}><span>{model.label}</span>{selectedModel === model.value && <Check size={13} />}</button>)}</motion.div>}</AnimatePresence></div></div><div className="chatbot-header-actions"><button onClick={() => { localStorage.removeItem('finpixel-edith-chat'); setMessages([{ id: Date.now(), role: 'assistant', content: config.welcome }]); setInput(''); }} aria-label="Clear conversation"><Trash2 size={16} /></button><button onClick={onClose} aria-label="Close EDITH"><X size={18} /></button></div></header>
      <div className="chatbot-messages" ref={messagesRef}>{messages.map((message) => <div className={`chat-message chat-message--${message.role}${message.error ? ' chat-message--error' : ''}`} key={message.id}><ChatMessageContent text={message.content} /></div>)}{sending && <div className="chat-message chat-message--assistant chatbot-typing"><i /><i /><i /></div>}</div>
      {messages.length === 1 && <div className="chatbot-prompts">{config.quickPrompts.map((prompt: string) => <button key={prompt} onClick={() => { void sendMessage(prompt); }}>{prompt}<ArrowRight size={13} /></button>)}</div>}
      <form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder={config.placeholder} maxLength={1800} aria-label="Message Finpixel AI concierge" /><button type="submit" disabled={!input.trim() || sending} aria-label="Send message"><Send size={17} /></button></form>
      <footer>{config.note}</footer>
    </motion.aside>
  );
}

function Button({ children, variant = 'primary', onClick, href, className = '', type = 'button' }: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'darkGhost';
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const classes = `button button--${variant} ${className}`;
  if (href) {
    const external = /^https?:\/\//.test(href);
    return <a className={classes} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>;
  }
  return <button className={classes} type={type} onClick={onClick}>{children}</button>;
}

function BrowserProduct({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`browser-product ${compact ? 'browser-product--compact' : ''}`} aria-label="Premium website interface preview">
      <div className="browser-topbar">
        <div className="traffic"><i /><i /><i /></div>
        <div className="browser-address"><LockKeyhole size={11} /><span>finpixel.in</span></div>
        <div className="topbar-dot" />
      </div>
      <div className="browser-canvas">
        <aside className="mock-sidebar">
          <div className="mini-brand"><span />FP</div>
          <i className="active" /><i /><i /><i />
        </aside>
        <div className="mock-main">
          <div className="mock-nav"><span>FINPIXEL / 01</span><div><i /><i /><i /></div></div>
          <div className="mock-hero-copy">
            <span className="mock-pill">HAND-CODED STUDIO</span>
            <h3>Digital craft.<br /><em>Measured impact.</em></h3>
            <div className="mock-button">Start a project <ArrowRight size={10} /></div>
          </div>
          <div className="mock-orb"><span /><span /><span /><i /></div>
          <div className="mock-metrics"><span>LIGHTHOUSE</span><strong>100</strong><i>PERFORMANCE</i></div>
        </div>
      </div>
      <div className="browser-reflection" />
    </div>
  );
}

function ShieldProduct() {
  return (
    <div className="security-product" aria-label="Secure global hosting illustration">
      <div className="server-stack server-stack--left"><i /><i /><i /><span /></div>
      <div className="server-stack server-stack--right"><i /><i /><i /><span /></div>
      <div className="security-rings"><i /><i /><i /></div>
      <div className="shield-core"><ShieldCheck size={70} strokeWidth={1.2} /><span>SSL</span></div>
      <div className="security-status"><span /><div><b>All systems operational</b><small>Global network · Live</small></div></div>
    </div>
  );
}

function DashboardProduct() {
  return (
    <div className="dashboard-product" aria-label="Conversion analytics dashboard illustration">
      <div className="dashboard-bar"><div className="mini-brand"><span />FP</div><span>Conversion overview</span><div className="avatar">IN</div></div>
      <div className="dashboard-body">
        <aside><i /><i className="active" /><i /><i /><i /></aside>
        <main>
          <div className="dash-heading"><div><small>THIS MONTH</small><b>Performance</b></div><span>Live data</span></div>
          <div className="metric-row"><div><small>CONVERSION</small><b>8.42%</b><em>+24.8%</em></div><div><small>LEADS</small><b>1,284</b><em>+18.2%</em></div><div><small>LOAD TIME</small><b>0.7s</b><em>Excellent</em></div></div>
          <div className="chart-card"><div className="chart-label"><span>Customer growth</span><b>+32.6%</b></div><svg viewBox="0 0 520 150" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d2ae68" stopOpacity=".32"/><stop offset="100%" stopColor="#d2ae68" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 130 C55 128 60 97 105 105 S165 72 205 82 S268 48 310 64 S375 35 405 47 S468 16 520 20 L520 150 L0 150Z"/><path className="line" d="M0 130 C55 128 60 97 105 105 S165 72 205 82 S268 48 310 64 S375 35 405 47 S468 16 520 20"/></svg></div>
        </main>
      </div>
    </div>
  );
}

function ProductVisual({ type }: { type: string }) {
  if (type === 'security') return <ShieldProduct />;
  if (type === 'analytics') return <DashboardProduct />;
  return <BrowserProduct compact />;
}

function IndustryVisual({ type }: { type: string }) {
  const Icon = iconMap[type] || Building2;
  return (
    <div className={`industry-visual industry-visual--${type}`}>
      <div className="industry-window">
        <div className="industry-windowbar"><span /><span /><span /><i /></div>
        <div className="industry-layout">
          <div className="industry-icon"><Icon size={25} strokeWidth={1.4} /></div>
          <div className="industry-copy"><i /><i /><i /></div>
          <div className="industry-cta" />
        </div>
        <div className="industry-panels"><i /><i /><i /></div>
      </div>
    </div>
  );
}

function PageFlashcard({ page, index, active, onToggle }: { page: any; index: number; active: boolean; onToggle: () => void }) {
  const Icon = iconMap[page.icon] || Code2;
  return (
    <motion.button
      type="button"
      className={`page-flashcard ${active ? 'page-flashcard--active' : ''}`}
      onClick={(event) => { onToggle(); event.currentTarget.blur(); }}
      aria-pressed={active}
      whileTap={{ scale: .985 }}
    >
      <span className="page-liquid page-liquid--one" />
      <span className="page-liquid page-liquid--two" />
      <span className="page-card-front">
        <span className="page-card-top"><i>0{index + 1}</i><em>{page.kicker}</em></span>
        <span className="page-card-icon"><Icon size={25} strokeWidth={1.45} /></span>
        <strong>{page.title}</strong>
        <span className="page-card-prompt">{page.prompt}<ArrowRight size={15} /></span>
      </span>
      <span className="page-card-back">
        <span className="page-card-top"><i>{page.metric}</i><em>{page.kicker}</em></span>
        <strong>{page.outcome}</strong>
        <span className="page-card-detail">{page.detail}</span>
        <span className="page-card-prompt">{page.closeLabel}<X size={15} /></span>
      </span>
    </motion.button>
  );
}

function AboutSection({ about }: { about: any }) {
  return (
    <section className="about-section section" id="about">
      <div className="container">
        <Reveal className="about-hero"><Eyebrow>{about.eyebrow}</Eyebrow><h2>{about.headline}</h2><p>{about.tagline}</p></Reveal>
        <div className="about-story-grid">
          <Reveal className="about-side-title"><span>01</span><h3>{about.who.title}</h3></Reveal>
          <Reveal className="about-story" delay={.06}>{about.who.paragraphs.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}</Reveal>
        </div>
        <div className="about-principles">
          {[about.vision, about.goal].map((item: any, index: number) => <Reveal className="about-principle" key={item.title} delay={index * .06}><span>0{index + 2}</span><h3>{item.title}</h3><p>{item.description}</p></Reveal>)}
        </div>
        <Reveal className="about-heading"><span>Capabilities</span><h3>{about.whatWeDo.title}</h3></Reveal>
        <div className="about-capability-grid">
          {about.whatWeDo.items.map((item: any, index: number) => { const Icon = iconMap[item.icon] || Code2; return <Reveal className="about-capability" key={item.title} delay={(index % 2) * .06}><div><Icon size={21} strokeWidth={1.5} /><span>0{index + 1}</span></div><h4>{item.title}</h4><p>{item.description}</p></Reveal>; })}
        </div>
        <Reveal className="about-heading"><span>Why Finpixel</span><h3>{about.strengths.title}</h3></Reveal>
        <div className="about-strengths">
          {about.strengths.items.map((item: any, index: number) => <Reveal className="about-strength" key={item.title} delay={(index % 2) * .05}><span>0{index + 1}</span><div><h4>{item.title}</h4><p>{item.description}</p></div></Reveal>)}
        </div>
        <Reveal className="about-heading centered"><span>Beyond Websites</span><h3>{about.otherWork.title}</h3><p>{about.otherWork.intro}</p></Reveal>
        <div className="growth-grid">
          {about.otherWork.items.map((item: any, index: number) => <Reveal className="growth-card" key={item.trapTitle} delay={(index % 3) * .05}><div className="growth-card-top"><span>{item.service}</span><i>0{index + 1}</i></div><small>{item.trapLabel}</small><h4>{item.trapTitle}</h4><blockquote>{item.quote}</blockquote><div className="growth-solution"><small>{item.solutionLabel}</small><h5>{item.solutionTitle}</h5><p>{item.solution}</p></div></Reveal>)}
        </div>
        <Reveal className="about-closing"><span>Finpixel / Bharat / 2026</span><h3>{about.promise.title}</h3>{about.promise.paragraphs.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}</Reveal>
      </div>
    </section>
  );
}

function PrivacyPage({ privacy, theme, setTheme }: { privacy: any; theme: Theme; setTheme: (theme: Theme) => void }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = privacy.metaTitle;
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => { document.title = previousTitle; };
  }, [privacy.metaTitle]);

  return (
    <motion.div className="privacy-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .38, ease: [0.16, 1, 0.3, 1] }}>
      <header className="privacy-nav"><a href="/" className="privacy-brand"><BrandMark /><small>{privacy.brandNote}</small></a><div><a className="privacy-back" href="/"><ArrowLeft size={15} />{privacy.backLabel}</a><button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button></div></header>
      <main className="container privacy-main">
        <div className="privacy-hero"><Eyebrow>{privacy.eyebrow}</Eyebrow><h1>{privacy.title}</h1><p>{privacy.intro}</p><div><span>{privacy.effectiveLabel}</span><b>{privacy.effectiveDate}</b></div></div>
        <div className="privacy-layout">
          <aside><b>{privacy.contentsLabel}</b>{privacy.sections.map((section: any, index: number) => <a href={`#privacy-${index + 1}`} key={section.title}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a>)}</aside>
          <article>
            <div className="privacy-callout"><ShieldCheck size={22} /><div><b>{privacy.callout.title}</b><p>{privacy.callout.description}</p></div></div>
            {privacy.sections.map((section: any, index: number) => <section id={`privacy-${index + 1}`} key={section.title}><span>{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2>{section.paragraphs.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map((item: string) => <li key={item}>{item}</li>)}</ul>}</section>)}
            <div className="privacy-contact"><span>{privacy.contact.eyebrow}</span><h2>{privacy.contact.title}</h2><p>{privacy.contact.description}</p><a href={`mailto:${privacy.contact.email}`}>{privacy.contact.email}<ArrowRight size={16} /></a></div>
          </article>
        </div>
      </main>
      <footer className="privacy-footer"><div className="container"><span>{privacy.footer}</span><a href="/">{privacy.backLabel}</a></div></footer>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <BrandMark />
      <div className="loading-line"><span /></div>
      <p>Defining every pixel with precision.</p>
    </main>
  );
}

function LeadModal({ state, onClose, formContent, onSubmitted, whatsappLink }: {
  state: ModalState;
  onClose: () => void;
  formContent: any;
  onSubmitted: () => void;
  whatsappLink: string;
}) {
  const [form, setForm] = useState<LeadForm>({ ...emptyLead, business_type: state.interest });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [submittedLead, setSubmittedLead] = useState<LeadForm | null>(null);
  const [businessOpen, setBusinessOpen] = useState(false);
  const businessMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm({ ...emptyLead, business_type: state.interest });
    setStatus('idle');
    setMessage('');
    setReference('');
    setSubmittedLead(null);
    setBusinessOpen(false);
    setFieldErrors({});
  }, [state.interest, state.open]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (businessOpen) setBusinessOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = state.open ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [state.open, onClose, businessOpen]);

  useEffect(() => {
    if (!businessOpen) return;
    const closeDropdown = (event: PointerEvent) => {
      if (!businessMenuRef.current?.contains(event.target as Node)) setBusinessOpen(false);
    };
    document.addEventListener('pointerdown', closeDropdown, true);
    return () => document.removeEventListener('pointerdown', closeDropdown, true);
  }, [businessOpen]);

  const update = (key: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = formContent.validation.name;
    if (!/^[+\d][\d\s-]{8,16}$/.test(form.phone.trim())) errors.phone = formContent.validation.phone;
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = formContent.validation.email;
    if (!form.business_type) errors.business_type = formContent.validation.business;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || formContent.error);
      setStatus('success');
      setMessage(result.email_sent ? formContent.successEmail : formContent.success);
      setReference(result.reference || 'FP-REQUEST');
      setSubmittedLead({ ...form });
      setForm(emptyLead);
      onSubmitted();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : formContent.error);
    }
  };

  const detailedWhatsAppLink = useMemo(() => {
    if (!submittedLead) return whatsappLink;
    const baseUrl = whatsappLink.split('?')[0];
    const formattedMessage = [
      '*FINPIXEL INDIA — FREE DEMO REQUEST*',
      '',
      `*Reference:* ${reference || 'Pending'}`,
      `*Name:* ${submittedLead.name}`,
      `*WhatsApp:* ${submittedLead.phone}`,
      `*Email:* ${submittedLead.email || 'Not provided'}`,
      `*Business / Project Type:* ${submittedLead.business_type}`,
      '',
      '*What I want my website to achieve:*',
      submittedLead.message || 'I would like to discuss the right website for my business.',
      '',
      '_I submitted this request through the Finpixel India website and would like to continue the conversation._',
    ].join('\n');
    return `${baseUrl}?text=${encodeURIComponent(formattedMessage)}`;
  }, [submittedLead, reference, whatsappLink]);

  useEffect(() => {
    if (status !== 'success' || !submittedLead) return;
    const redirectTimer = window.setTimeout(() => window.location.assign(detailedWhatsAppLink), 2200);
    return () => window.clearTimeout(redirectTimer);
  }, [status, submittedLead, detailedWhatsAppLink]);

  return (
    <AnimatePresence>
      {state.open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title" initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .99 }} transition={{ duration: .48, ease: [0.16, 1, 0.3, 1] }} onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose} aria-label="Close form"><X size={20} /></button>
            {status === 'success' ? (
              <div className="success-state" role="status" aria-live="polite">
                <span><CheckCircle2 size={32} /></span>
                <Eyebrow>{formContent.successEyebrow}</Eyebrow>
                <h2>{formContent.successTitle}</h2>
                <p>{message}</p>
                <div className="success-reference"><span>{formContent.referenceLabel}</span><b>{reference}</b></div>
                {submittedLead && <div className="success-lead-summary"><span><b>{formContent.summaryName}</b>{submittedLead.name}</span><span><b>{formContent.summaryProject}</b>{submittedLead.business_type}</span></div>}
                <div className="success-next"><small>{formContent.nextLabel}</small>{formContent.successSteps.map((step: any, index: number) => <div key={step.title}><i>{index + 1}</i><span><b>{step.title}</b><em>{step.description}</em></span></div>)}</div>
                <p className="success-whatsapp-note"><WhatsAppIcon size={14} />{formContent.whatsappNote}</p>
                <div className="success-actions"><a className="button button--primary" href={detailedWhatsAppLink}>{formContent.whatsappCta}<WhatsAppIcon size={17} /></a><Button variant="secondary" onClick={onClose}>{formContent.done}</Button></div>
              </div>
            ) : (
              <>
                <Eyebrow>{formContent.eyebrow}</Eyebrow>
                <h2 id="lead-title">{formContent.title}</h2>
                <p className="modal-intro">{formContent.subheadline}</p>
                <form onSubmit={submit} noValidate>
                  <div className="form-grid">
                    <label><span>{formContent.fields.name}</span><input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={formContent.placeholders.name} autoFocus />{fieldErrors.name && <small>{fieldErrors.name}</small>}</label>
                    <label><span>{formContent.fields.phone}</span><input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder={formContent.placeholders.phone} inputMode="tel" />{fieldErrors.phone && <small>{fieldErrors.phone}</small>}</label>
                    <label><span>{formContent.fields.email}</span><input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder={formContent.placeholders.email} inputMode="email" />{fieldErrors.email && <small>{fieldErrors.email}</small>}</label>
                    <div className="form-field"><span>{formContent.fields.business}</span><div className={`custom-select ${businessOpen ? 'custom-select--open' : ''}`} ref={businessMenuRef}><button className="custom-select-trigger" type="button" onClick={() => setBusinessOpen(!businessOpen)} aria-haspopup="listbox" aria-expanded={businessOpen}><span className={form.business_type ? '' : 'placeholder'}>{form.business_type || formContent.placeholders.business}</span><ChevronDown size={15} /></button><AnimatePresence>{businessOpen && <motion.div className="custom-select-menu" role="listbox" initial={{ opacity: 0, y: -6, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .99 }} transition={{ duration: .24, ease: [0.16, 1, 0.3, 1] }}>{formContent.businessTypes.map((item: string) => <button type="button" role="option" aria-selected={form.business_type === item} key={item} onClick={() => { update('business_type', item); setBusinessOpen(false); }}><span>{item}</span>{form.business_type === item && <Check size={14} />}</button>)}</motion.div>}</AnimatePresence></div>{fieldErrors.business_type && <small>{fieldErrors.business_type}</small>}</div>
                    <label className="form-span"><span>{formContent.fields.message}</span><textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder={formContent.placeholders.message} rows={3} /></label>
                  </div>
                  {status === 'error' && <div className="form-error">{message}</div>}
                  <Button type="submit" className="form-submit">{status === 'sending' ? formContent.sending : formContent.submit}<ArrowRight size={17} /></Button>
                  <p className="form-note"><ShieldCheck size={14} />{formContent.note}</p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const lightweightMotion = reduceMotion || navigator.hardwareConcurrency <= 4 || window.matchMedia('(max-width: 820px), (pointer: coarse), (update: slow)').matches;
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('finpixel-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, interest: '' });
  const [snowEnabled, setSnowEnabled] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const heroProductRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const snowflakes = useMemo(() => Array.from({ length: 18 }, (_, index) => ({ left: (index * 37 + 9) % 100, size: 3 + (index % 4), delay: -((index * 1.13) % 9), duration: 8 + (index % 5) * 1.1 })), []);

  const fetchContent = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const response = await fetch('/api/content');
      const rows = await response.json();
      if (!response.ok) throw new Error(rows.error || 'Unable to load the site.');
      const mapped = (rows as SiteRow[]).reduce<ContentMap>((result, row) => {
        result[row.section] = row.content;
        return result;
      }, {});
      setContent(mapped);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Unable to load the site.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('finpixel-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0d11' : '#ffffff');
  }, [theme]);
  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lite = navigator.hardwareConcurrency <= 4 || (device.deviceMemory ?? 8) <= 4 || Boolean(device.connection?.saveData);
    document.documentElement.toggleAttribute('data-lite', lite);
    return () => document.documentElement.removeAttribute('data-lite');
  }, []);
  useEffect(() => {
    let frame = 0;
    const updateNav = () => {
      frame = 0;
      const next = window.scrollY > 24;
      setScrolled((current) => current === next ? current : next);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateNav);
    };
    updateNav();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (loading || !heroProductRef.current || window.matchMedia('(max-width: 820px), (pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const offset = Math.min(window.scrollY * .025, 14);
      heroProductRef.current?.style.setProperty('--parallax-y', `${offset}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [loading]);

  const tiltHero = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    event.currentTarget.style.setProperty('--tilt-x', `${(2 - y * 5).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
  };

  const resetHeroTilt = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '2deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  const toggleAudioDescription = async () => {
    if (audioPlaying) {
      audioRef.current?.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }

    const tracks = ['/audio/finpixel-description.mp3', '/audio/finpixel-description.ogg'];
    for (const track of tracks) {
      try {
        const response = await fetch(track, { method: 'HEAD' });
        if (!response.ok || !audioRef.current) continue;
        audioRef.current.src = track;
        await audioRef.current.play();
        setAudioPlaying(true);
        return;
      } catch { /* Try the next format, then use speech. */ }
    }

    if ('speechSynthesis' in window) {
      const description = `${content.hero.title}. ${content.hero.subheadline} Finpixel India creates hand-coded websites, hosting, conversion-focused design, automation, and digital growth systems for ambitious organisations across India.`;
      const speech = new SpeechSynthesisUtterance(description);
      speech.rate = .94;
      speech.pitch = .96;
      speech.onend = () => setAudioPlaying(false);
      speech.onerror = () => setAudioPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
      setAudioPlaying(true);
    }
  };

  useEffect(() => () => {
    audioRef.current?.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const navigateToSection = (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (!href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const needsFullLayout = href === '#contact';
    if (needsFullLayout) document.documentElement.classList.add('force-layout');
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', href);
      if (needsFullLayout) window.setTimeout(() => document.documentElement.classList.remove('force-layout'), 900);
    });
  };

  const openDemo = (interest = '') => {
    setMenuOpen(false);
    setModal({ open: true, interest });
  };

  const whatsappLink = useMemo(() => {
    if (!content.footer) return '#';
    return `https://wa.me/${content.footer.whatsappRaw}?text=${encodeURIComponent(content.footer.whatsappMessage)}`;
  }, [content.footer]);

  if (loading) return <AnimatePresence mode="wait"><motion.div key="loading" className="loading-stage" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .28, ease: [0.16, 1, 0.3, 1] }}><LoadingScreen /></motion.div></AnimatePresence>;
  if (error || !content.hero) return (
    <main className="error-screen">
      <div><BrandMark /><h1>Precision hit a pause.</h1><p>{error || 'Site content is currently unavailable.'}</p><Button onClick={fetchContent}>Try again <ArrowRight size={16} /></Button></div>
    </main>
  );

  const { nav, hero, trust, about, services, comparison, pricing, industries, codeShowcase, promise, process, pageShowcase, cta, footer, leadForm, privacy, chatbot } = content;

  if (window.location.pathname === '/privacy' && privacy) return <PrivacyPage privacy={privacy} theme={theme} setTheme={setTheme} />;

  return (
    <AnimatePresence mode="wait">
    <motion.div key="site" className="site-shell" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .38, ease: [0.16, 1, 0.3, 1] }}>
      <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <a className="nav-brand" href="#top" onClick={(event) => navigateToSection(event, '#top')}><BrandMark /><small>{nav.tagline}</small></a>
          <nav className="desktop-links" aria-label="Primary navigation">
            {nav.links.map((link: any) => <a href={link.href} key={link.label} onClick={(event) => navigateToSection(event, link.href)}>{link.label}</a>)}
          </nav>
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><motion.span key={theme} initial={{ opacity: 0, rotate: -18, scale: .88 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ duration: .32, ease: [0.16, 1, 0.3, 1] }}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</motion.span></button>
          <Button className="nav-cta" onClick={() => openDemo()}>{nav.cta}<ArrowRight size={15} /></Button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        <AnimatePresence>
          {menuOpen && <motion.div className="mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>{nav.links.map((link: any) => <a href={link.href} key={link.label} onClick={(event) => navigateToSection(event, link.href)}>{link.label}<ChevronRight size={17} /></a>)}<Button onClick={() => openDemo()}>{nav.cta}<ArrowRight size={15} /></Button></motion.div>}
        </AnimatePresence>
      </header>

      <main>
        <section className="hero section" id="top">
          <div className="hero-glow" />
          <div className="container hero-inner">
            <div className="hero-copy">
              <motion.div initial={lightweightMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .54, delay: .02, ease: [0.16, 1, 0.3, 1] }}><Eyebrow>{hero.eyebrow}</Eyebrow></motion.div>
              <motion.h1 initial={lightweightMotion ? false : { opacity: 0, y: 11 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .58, delay: .08, ease: [0.16, 1, 0.3, 1] }}>{hero.title}</motion.h1>
              <motion.p initial={lightweightMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .58, delay: .14, ease: [0.16, 1, 0.3, 1] }}>{hero.subheadline}</motion.p>
              <motion.div className="hero-actions" initial={lightweightMotion ? false : { opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .56, delay: .2, ease: [0.16, 1, 0.3, 1] }}><Button onClick={() => openDemo()}>{hero.primary}<ArrowRight size={17} /></Button><Button variant="secondary" href="#work">{hero.secondary}<MousePointer2 size={16} /></Button></motion.div>
              <motion.div className="hero-assurance" initial={lightweightMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .54, delay: .26, ease: [0.16, 1, 0.3, 1] }}><span><Check size={13} />{hero.assurances[0]}</span><span><Check size={13} />{hero.assurances[1]}</span></motion.div>
            </div>
            <motion.div ref={heroProductRef} className="hero-product" initial={lightweightMotion ? false : { opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .72, delay: .22, ease: [0.16, 1, 0.3, 1] }} onPointerMove={tiltHero} onPointerLeave={resetHeroTilt}>
              <div className="product-halo" /><div className="browser-bob"><BrowserProduct /></div>
              <div className="floating-chip floating-chip--speed"><Zap size={14} /><span><small>{hero.floatingCards[0].label}</small><b>{hero.floatingCards[0].value}</b></span></div>
              <div className="floating-chip floating-chip--location"><Globe2 size={14} /><span><small>{hero.floatingCards[1].label}</small><b>{hero.floatingCards[1].value}</b></span></div>
            </motion.div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Finpixel guarantees">
          <div className="container trust-inner">
            <span className="trust-label">{trust.label}</span>
            <div className="trust-list">{trust.stats.map((stat: any) => <span key={stat.label}><CheckCircle2 size={16} /><CountUpText value={stat.value} />{stat.label}</span>)}</div>
          </div>
        </section>

        <section className="services-wrap" id="services">
          <div className="container services-intro">
            <Reveal><Eyebrow>{services.eyebrow}</Eyebrow><h2>{services.headline}</h2><p>{services.subheadline}</p></Reveal>
          </div>
          {services.items.map((service: any, index: number) => (
            <section className={`service-section ${index % 2 ? 'service-section--reverse' : ''}`} key={service.title}>
              <div className="container service-grid">
                <Reveal className="service-copy">
                  <span className="section-index">0{index + 1} / 03</span>
                  <Eyebrow>{service.eyebrow}</Eyebrow>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {service.badge && <div className="stat-badge"><Zap size={15} />{service.badge}</div>}
                  <button className="text-link" onClick={() => openDemo(service.interest)}>{service.cta}<ArrowRight size={16} /></button>
                </Reveal>
                <Reveal className="service-visual" delay={.08} zoom><div className="visual-surface"><div className="visual-glow" /><ProductVisual type={service.visual} /></div></Reveal>
              </div>
            </section>
          ))}
        </section>

        <section className="comparison-section section" id="comparison">
          <div className="container">
            <Reveal className="section-heading centered"><Eyebrow>{comparison.eyebrow}</Eyebrow><h2>{comparison.headline}</h2><p>{comparison.subheadline}</p></Reveal>
            <Reveal className="comparison-card" delay={.08}>
              <div className="comparison-grid comparison-head">
                <div>{comparison.criteriaLabel}</div>
                {comparison.columns.map((column: any) => <div className={column.featured ? 'featured-cell' : ''} key={column.name}>{column.featured && <span>{comparison.winnerLabel}</span>}<b>{column.name}</b><small>{column.note}</small></div>)}
              </div>
              {comparison.rows.map((row: any) => (
                <div className="comparison-grid comparison-row" key={row.label}>
                  <div><b>{row.label}</b><small>{row.note}</small></div>
                  {row.values.map((value: any, index: number) => <div className={index === 0 ? 'featured-cell' : ''} key={`${row.label}-${index}`}>{value.positive ? <CheckCircle2 className="positive" size={20} /> : <CircleX className="negative" size={20} />}<span>{value.text}</span></div>)}
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="industries-section section" id="work">
          <div className="container">
            <Reveal className="section-heading industry-heading"><Eyebrow>{industries.eyebrow}</Eyebrow><h2>{industries.headline}</h2><p>{industries.subheadline}</p></Reveal>
            <motion.div className="industry-grid" initial={lightweightMotion ? false : "hidden"} whileInView={lightweightMotion ? undefined : "visible"} viewport={{ once: true, amount: .04, margin: "0px 0px 140px 0px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: .055, delayChildren: .02 } } }}>{industries.items.map((industry: any) => { const Icon = iconMap[industry.icon] || Building2; return <motion.div className="industry-reveal" key={industry.title} variants={{ hidden: { opacity: 0, y: 12, scale: .985 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .62, ease: [0.16, 1, 0.3, 1] } } }}><article className="industry-card"><IndustryVisual type={industry.icon} /><div className="industry-content"><span><Icon size={15} />{industry.label}</span><h3>{industry.title}</h3><p>{industry.description}</p><div className="industry-actions"><button className="industry-arrow" onClick={() => openDemo(industry.title)} aria-label={`Start a ${industry.title} project`}><ArrowRight size={17} /></button></div></div></article></motion.div>; })}</motion.div>
          </div>
        </section>

        {codeShowcase && <LiveCodeWindow config={codeShowcase} />}

        <section className="promise-section section">
          <div className="container">
            <Reveal className="section-heading centered"><Eyebrow>{promise.eyebrow}</Eyebrow><h2>{promise.headline}</h2><p>{promise.subheadline}</p></Reveal>
            <div className="promise-grid">{promise.items.map((item: any, index: number) => { const Icon = iconMap[item.icon] || Check; return <Reveal className="promise-card" key={item.title} delay={index * .05}><div className="promise-number">0{index + 1}</div><div className="gold-icon"><Icon size={23} strokeWidth={1.6} /></div><h3>{item.title}</h3><p>{item.description}</p></Reveal>; })}</div>
          </div>
        </section>

        <section className="process-section section">
          <div className="container">
            <Reveal className="section-heading"><Eyebrow>{process.eyebrow}</Eyebrow><h2>{process.headline}</h2><p>{process.subheadline}</p></Reveal>
            <div className="process-grid">{process.steps.map((step: any, index: number) => <Reveal className="process-step" key={step.title} delay={index * .07}><div className="step-line"><span>0{index + 1}</span></div><small>{step.timing}</small><h3>{step.title}</h3><p>{step.description}</p></Reveal>)}</div>
          </div>
        </section>

        {pageShowcase && <section className="pages-section section">
          <div className="pages-ambient pages-ambient--one" />
          <div className="pages-ambient pages-ambient--two" />
          <div className="container pages-inner">
            <Reveal className="section-heading centered"><Eyebrow>{pageShowcase.eyebrow}</Eyebrow><h2>{pageShowcase.headline}</h2><p>{pageShowcase.subheadline}</p></Reveal>
            <div className="page-card-grid">
              {pageShowcase.items.map((page: any, index: number) => <Reveal key={page.title} delay={(index % 3) * .06}><PageFlashcard page={page} index={index} active={activePage === index} onToggle={() => setActivePage(activePage === index ? null : index)} /></Reveal>)}
            </div>
            <Reveal className="pages-note"><i className="note-pixel" aria-hidden="true" /><span>{pageShowcase.note}</span></Reveal>
          </div>
        </section>}

        {pricing && <section className="pricing-section section" id="pricing">
          <div className="pricing-orb pricing-orb--one" /><div className="pricing-orb pricing-orb--two" />
          <div className="container pricing-inner">
            <Reveal className="section-heading centered"><Eyebrow>{pricing.eyebrow}</Eyebrow><h2>{pricing.headline}</h2><p>{pricing.subheadline}</p></Reveal>
            <div className="pricing-grid">
              {pricing.plans.map((plan: any, index: number) => <Reveal className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`} key={plan.name} delay={index * .06}>
                <div className="pricing-card-head"><span>{plan.label}</span>{plan.badge && <b>{plan.badge}</b>}</div>
                <h3>{plan.name}</h3><p>{plan.description}</p>
                <div className="price"><small>{plan.prefix}</small><strong>{plan.price}</strong><span>{plan.suffix}</span></div>
                <div className="pricing-rule" />
                <ul>{plan.features.map((feature: string) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                <Button variant={plan.featured ? 'primary' : 'secondary'} onClick={() => openDemo(plan.interest)}>{plan.cta}<ArrowRight size={16} /></Button>
              </Reveal>)}
            </div>
            <Reveal className="pricing-note"><ShieldCheck size={16} /><span>{pricing.note}</span></Reveal>
          </div>
        </section>}

        {about && <AboutSection about={about} />}

        <section className="cta-section" id="contact">
          <div className="cta-noise" />
          <div className="cta-glow" />
          <Reveal className="container cta-inner">
            <Eyebrow dark>{cta.eyebrow}</Eyebrow>
            <h2>{cta.headline}</h2>
            <p>{cta.subheadline}</p>
            <div className="cta-actions"><Button onClick={() => openDemo()}>{cta.primary}<ArrowRight size={18} /></Button><Button variant="darkGhost" href={whatsappLink}>{cta.secondary}<WhatsAppIcon size={18} /></Button></div>
            <div className="cta-proof">{cta.proofs.map((item: string) => <span key={item}><Check size={13} />{item}</span>)}</div>
            <div className="contact-options-grid">{footer.contactOptions.map((option: any) => { const external = /^https?:\/\//.test(option.href); return <a href={option.href} key={option.type} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}><i><ContactIcon type={option.type} /></i><span><b>{option.label}</b><small>{option.value}</small></span><ArrowRight className="contact-arrow" size={15} /></a>; })}</div>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand"><a className="footer-logo-link" href="#top" onClick={(event) => navigateToSection(event, '#top')}><BrandMark /></a><p>{footer.description}</p><span><span />{footer.availability}</span></div>
            <div className="footer-links"><div><b>{footer.navLabel}</b>{footer.links.map((link: any) => <a href={link.href} key={link.label} onClick={(event) => navigateToSection(event, link.href)}>{link.label}</a>)}</div><div><b>{footer.contactLabel}</b><a href={whatsappLink} target="_blank" rel="noreferrer">{footer.whatsapp}</a><a href={`mailto:${footer.email}`}>{footer.email}</a><small>{footer.location}</small></div><div><b>{footer.socialLabel}</b><div className="socials footer-contact-icons">{footer.contactOptions.map((option: any) => { const external = /^https?:\/\//.test(option.href); return <a href={option.href} key={option.type} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} aria-label={option.label} title={option.label}><ContactIcon type={option.type} size={16} /></a>; })}</div></div></div>
          </div>
          <div className="footer-bottom"><p>{footer.copyright}</p><div>{footer.legal.map((link: any) => <a href={link.href} key={link.label}>{link.label}</a>)}</div></div>
        </div>
      </footer>

      <div className={`support-controls ${chatOpen ? 'support-controls--chat-open' : ''}`}><button className={chatOpen ? 'chatbot-toggle active' : 'chatbot-toggle'} type="button" onClick={() => setChatOpen(!chatOpen)} aria-label={`${chatOpen ? 'Close' : 'Open'} Finpixel AI chatbot`}><Bot size={21} /></button><motion.a className="whatsapp-float" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat with Finpixel India on WhatsApp" initial={{ opacity: 0, x: 12, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: .55, delay: .5, ease: [0.16, 1, 0.3, 1] }}><i><WhatsAppIcon size={23} /></i></motion.a></div>

      <AnimatePresence>{snowEnabled && <motion.div className="snow-layer" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .4 }}>{snowflakes.map((flake, index) => <span key={index} style={{ left: `${flake.left}%`, width: `${flake.size}px`, height: `${flake.size}px`, animationDelay: `${flake.delay}s`, animationDuration: `${flake.duration}s` }} />)}</motion.div>}</AnimatePresence>
      <div className="experience-controls" aria-label="Experience controls"><button type="button" className={snowEnabled ? 'active' : ''} onClick={() => setSnowEnabled(!snowEnabled)} aria-label={`${snowEnabled ? 'Turn off' : 'Turn on'} snow effect`} data-label="Snow"><Snowflake size={17} /></button><button type="button" className={audioPlaying ? 'active' : ''} onClick={() => { void toggleAudioDescription(); }} aria-label={`${audioPlaying ? 'Stop' : 'Play'} audio description`} data-label="Listen">{audioPlaying ? <VolumeX size={17} /> : <Volume2 size={17} />}</button></div>
      <audio ref={audioRef} preload="none" onEnded={() => setAudioPlaying(false)} />

      <AnimatePresence>{chatOpen && chatbot && <AiChatbot config={chatbot} onClose={() => setChatOpen(false)} />}</AnimatePresence>

      <LeadModal state={modal} onClose={() => setModal({ open: false, interest: '' })} formContent={leadForm} whatsappLink={whatsappLink} onSubmitted={() => { void fetchContent(true); }} />
    </motion.div>
    </AnimatePresence>
  );
}
