import { FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { DEFAULT_CONTENT } from './defaultContent';
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
  Github,
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
  Pause,
  Play,
  Rocket,
  RotateCcw,
  Server,
  Send,
  ShieldCheck,
  Snowflake,
  Sparkles,
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
  if (type === 'github') return <Github size={size} />;
  if (type === 'fiverr') return <span className="brand-glyph brand-glyph--fiverr" style={{ fontSize: size * 0.72, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1 }}>fi</span>;
  if (type === 'x') return <span className="brand-glyph brand-glyph--x" style={{ fontSize: size * 0.88, fontWeight: 700, lineHeight: 1 }}>𝕏</span>;
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

function PreciseWorkCard({ item, index }: { item: any; index: number }) {
  const [active, setActive] = useState(false);
  const isSocial = Boolean(item.service?.toLowerCase().includes('social'));

  return (
    <div
      className={`growth-card ${active ? 'growth-card--active' : ''}`}
      onClick={() => setActive((prev) => !prev)}
      onMouseLeave={() => setActive(false)}
      role="button"
      tabIndex={0}
      aria-label={`${item.trapTitle} - Click or hover to toggle solution`}
    >
      <div className="growth-liquid-specular" />

      {/* Front Side: The Trap / Problem */}
      <div className="growth-card-side growth-card-front">
        <div className="growth-card-head">
          <span className="growth-glass-tag">
            {isSocial ? <Sparkles size={12} /> : <Zap size={12} />}
            <span>{item.service}</span>
          </span>
          <span className="growth-card-num">0{index + 1}</span>
        </div>

        <div className="growth-card-main">
          <span className="growth-trap-badge">{item.trapLabel}</span>
          <h4 className="growth-card-heading">{item.trapTitle}</h4>
          <blockquote className="growth-quote-clean">{item.quote}</blockquote>
        </div>

        <div className="growth-card-foot">
          <span className="growth-reveal-prompt">
            <span>Reveal Solution</span>
            <ArrowRight size={13} />
          </span>
          <span className="growth-tap-note">Tap / Hover</span>
        </div>
      </div>

      {/* Back Side: The Engineered Solution */}
      <div className="growth-card-side growth-card-back">
        <div className="growth-card-head">
          <span className="growth-glass-tag growth-glass-tag--solution">
            <CheckCircle2 size={12} />
            <span>{item.solutionLabel || 'Engineered Solution'}</span>
          </span>
          <span className="growth-card-num">0{index + 1}</span>
        </div>

        <div className="growth-card-main">
          <span className="growth-solution-badge">Precision Fix</span>
          <h4 className="growth-card-heading">{item.solutionTitle}</h4>
          <p className="growth-solution-text">{item.solution}</p>
        </div>

        <div className="growth-card-foot">
          <span className="growth-guarantee-note">
            <ShieldCheck size={12} />
            <span>Finpixel Architecture</span>
          </span>
          <span className="growth-close-action">Tap to close</span>
        </div>
      </div>
    </div>
  );
}

function AboutSection({ about }: { about: any }) {
  const whoParagraphs: string[] = about?.who?.paragraphs || [];
  const principles: any[] = [about?.vision, about?.goal].filter(Boolean);
  const capabilityItems: any[] = about?.whatWeDo?.items || [];
  const strengthItems: any[] = about?.strengths?.items || [];
  const otherWorkItems: any[] = about?.otherWork?.items || [];
  const promiseParagraphs: string[] = about?.promise?.paragraphs || [];

  return (
    <section className="about-section section" id="about">
      <div className="container">
        <Reveal className="about-hero">
          <Eyebrow>{about?.eyebrow || 'We Are Finpixel India'}</Eyebrow>
          <h2>{about?.headline || 'The Digital Architects of Bharat'}</h2>
          <p>{about?.tagline || 'Bridging traditional Bharat with the digital future through uncompromising hand-crafted technology.'}</p>
        </Reveal>
        <div className="about-story-grid">
          <Reveal className="about-side-title"><span>01</span><h3>{about?.who?.title || 'Who We Are'}</h3></Reveal>
          <Reveal className="about-story" delay={.06}>
            {whoParagraphs.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}
          </Reveal>
        </div>
        {principles.length > 0 && (
          <div className="about-principles">
            {principles.map((item: any, index: number) => (
              <Reveal className="about-principle" key={item.title || index} delay={index * .06}>
                <span>0{index + 2}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="about-heading">
          <span>Capabilities</span>
          <h3>{about?.whatWeDo?.title || 'High-Performance Static Web Development'}</h3>
          {about?.whatWeDo?.subtitle && <p className="about-subtitle" style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '14px' }}>{about.whatWeDo.subtitle}</p>}
        </Reveal>
        <div className="about-capability-grid">
          {capabilityItems.map((item: any, index: number) => {
            const Icon = iconMap[item.icon] || Code2;
            return (
              <Reveal className="about-capability" key={item.title || index} delay={(index % 2) * .06}>
                <div>
                  <Icon size={21} strokeWidth={1.5} />
                  <span>0{index + 1}</span>
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="about-heading">
          <span>Why Finpixel</span>
          <h3>{about?.strengths?.title || 'Our Unmatched Strengths'}</h3>
        </Reveal>
        <div className="about-strengths">
          {strengthItems.map((item: any, index: number) => (
            <Reveal className="about-strength" key={item.title || index} delay={(index % 2) * .05}>
              <span>0{index + 1}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="about-heading centered">
          <span>Beyond Websites</span>
          <h3>{about?.otherWork?.title || 'Our Other Precise Works'}</h3>
          <p>{about?.otherWork?.intro || 'Beyond websites, we engineer growth using Influence and Automation.'}</p>
        </Reveal>
        <div className="growth-grid">
          {otherWorkItems.map((item: any, index: number) => (
            <Reveal key={item.trapTitle || index} delay={(index % 3) * .05}>
              <PreciseWorkCard item={item} index={index} />
            </Reveal>
          ))}
        </div>
        <Reveal className="about-closing">
          <span>Finpixel / Bharat / 2026</span>
          <h3>{about?.promise?.title || 'The Finpixel Promise'}</h3>
          {promiseParagraphs.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}
        </Reveal>
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
    const formattedMessage = [
      '👋 *Hello Finpixel India Team!*',
      '',
      'I have just submitted an enquiry on your website. Here are my details:',
      '',
      `📋 *Reference ID:* ${reference || 'FP-NEW'}`,
      `👤 *Full Name:* ${submittedLead.name}`,
      `📱 *Phone/WhatsApp:* ${submittedLead.phone}`,
      `📧 *Email:* ${submittedLead.email || 'Not provided'}`,
      `🏢 *Business Type:* ${submittedLead.business_type}`,
      '',
      '💬 *Project Requirements & Description:*',
      submittedLead.message ? `"${submittedLead.message}"` : 'I would like to discuss a custom website for my business and explore the free demo.',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━',
      '🌐 *Origin:* Finpixel India Official (finpixelindia.pages.dev)',
      '⏰ *Time:* ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      '',
      'Please let me know the next steps. Looking forward to connecting with you! 🚀'
    ].join('\n');
    return `https://wa.me/917004176367?text=${encodeURIComponent(formattedMessage)}`;
  }, [submittedLead, reference, whatsappLink]);

  return (
    <AnimatePresence>
      {state.open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-title"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close dialog" type="button">
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  className="modal-success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  role="status"
                  aria-live="polite"
                >
                  <div className="success-header">
                    <motion.div
                      className="success-confetti-ring"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.06 }}
                    >
                      <motion.div
                        className="success-inner-ring"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.18 }}
                      >
                        <CheckCircle2 size={34} strokeWidth={2} />
                      </motion.div>
                    </motion.div>
                    <div className="success-header-text">
                      <Eyebrow>{formContent?.successEyebrow || 'Query Sent'}</Eyebrow>
                      <h2 className="success-headline">Query Sent!</h2>
                      <p className="success-msg">{message || "We've received your query and our team will get back to you within 24 hours."}</p>
                    </div>
                  </div>

                  <div className="success-ref-card">
                    <div className="success-ref-row">
                      <span className="ref-label">Reference ID</span>
                      <strong className="ref-code">{reference || 'FP-REQUEST'}</strong>
                    </div>
                    {submittedLead && (
                      <div className="success-lead-pills">
                        <div>
                          <span>Client Name</span>
                          <b>{submittedLead.name}</b>
                        </div>
                        <div>
                          <span>WhatsApp</span>
                          <b>{submittedLead.phone}</b>
                        </div>
                        <div>
                          <span>Email</span>
                          <b>{submittedLead.email || '—'}</b>
                        </div>
                        <div>
                          <span>Business Type</span>
                          <b>{submittedLead.business_type}</b>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="success-steps">
                    <p className="success-steps-label">What Happens Next</p>
                    <div className="success-steps-list">
                      <div className="success-step">
                        <div className="success-step-num">1</div>
                        <div className="success-step-content">
                          <b>Instant Verification</b>
                          <em>Your enquiry details have been securely logged in our system.</em>
                        </div>
                      </div>
                      <div className="success-step">
                        <div className="success-step-num">2</div>
                        <div className="success-step-content">
                          <b>Direct WhatsApp Connect</b>
                          <em>Chat with our team right away to share design preferences.</em>
                        </div>
                      </div>
                      <div className="success-step">
                        <div className="success-step-num">3</div>
                        <div className="success-step-content">
                          <b>Free Prototype in 48h</b>
                          <em>Review your interactive prototype with zero upfront payment.</em>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="success-cta-block">
                    <a className="success-wa-button" href={detailedWhatsAppLink} target="_blank" rel="noreferrer">
                      <span className="success-wa-icon"><WhatsAppIcon size={22} /></span>
                      <span className="success-wa-text">
                        <b>Chat on WhatsApp</b>
                        <small>Direct priority chat with pre-filled enquiry</small>
                      </span>
                      <ArrowRight size={17} className="success-wa-arrow" />
                    </a>
                    <button className="success-return-button" onClick={onClose} type="button">
                      <ArrowLeft size={16} />
                      <span>Go Back to Website</span>
                    </button>
                  </div>

                  <p className="success-footer-note">
                    <ShieldCheck size={13} />
                    <span>Your information is encrypted & 100% confidential. No spam ever.</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="modal-form-header">
                    <Eyebrow>{formContent?.eyebrow || 'Free Demo Request'}</Eyebrow>
                    <h2 id="lead-title">{formContent?.title || "Let's Build Your Website"}</h2>
                    <p className="modal-intro">{formContent?.subheadline || "Fill in your details and we'll have a first draft ready for you within 48 hours."}</p>
                  </div>
                  <form onSubmit={submit} noValidate>
                    <div className="form-grid">
                      <label>
                        <span>{formContent?.fields?.name || 'Your Name'}</span>
                        <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={formContent?.placeholders?.name || 'Ashish Singh'} autoFocus />
                        {fieldErrors.name && <small>{fieldErrors.name}</small>}
                      </label>
                      <label>
                        <span>{formContent?.fields?.phone || 'WhatsApp Number'}</span>
                        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder={formContent?.placeholders?.phone || '+91 70041 76367'} inputMode="tel" />
                        {fieldErrors.phone && <small>{fieldErrors.phone}</small>}
                      </label>
                      <label>
                        <span>{formContent?.fields?.email || 'Email Address'}</span>
                        <input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder={formContent?.placeholders?.email || 'finpixelindia@gmail.com'} inputMode="email" />
                        {fieldErrors.email && <small>{fieldErrors.email}</small>}
                      </label>
                      <div className="form-field">
                        <span>{formContent?.fields?.business || 'Business / Industry'}</span>
                        <div className={`custom-select ${businessOpen ? 'custom-select--open' : ''}`} ref={businessMenuRef}>
                          <button className="custom-select-trigger" type="button" onClick={() => setBusinessOpen(!businessOpen)} aria-haspopup="listbox" aria-expanded={businessOpen}>
                            <span className={form.business_type ? '' : 'placeholder'}>{form.business_type || (formContent?.placeholders?.business || 'Select industry...')}</span>
                            <ChevronDown size={15} />
                          </button>
                          <AnimatePresence>
                            {businessOpen && (
                              <motion.div className="custom-select-menu" role="listbox" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} transition={{ type: 'spring', damping: 22, stiffness: 300 }}>
                                {(formContent?.businessTypes || ['Fintech & Finance', 'Corporate & Agency', 'E-Commerce & Retail', 'Healthcare & Wellness', 'Real Estate & Builders', 'Tech & AI Startups', 'Other Services']).map((item: string) => (
                                  <button type="button" role="option" aria-selected={form.business_type === item} key={item} onClick={() => { update('business_type', item); setBusinessOpen(false); }}>
                                    <span>{item}</span>
                                    {form.business_type === item && <Check size={14} />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {fieldErrors.business_type && <small>{fieldErrors.business_type}</small>}
                      </div>
                      <label className="form-span">
                        <span>{formContent?.fields?.message || 'Project Details / Goal'}</span>
                        <textarea value={form.message} onChange={(e) => update('message', e.target.value)} placeholder={formContent?.placeholders?.message || 'Tell us about your business, features you want, and your design ideas...'} rows={3} />
                      </label>
                    </div>
                    {status === 'error' && (
                      <motion.div className="form-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {message}
                      </motion.div>
                    )}
                    <Button type="submit" className="form-submit">{status === 'sending' ? (formContent?.sending || 'Sending...') : (formContent?.submit || 'Send Query')}<ArrowRight size={17} /></Button>
                    <p className="form-note"><ShieldCheck size={14} />{formContent?.note || 'No commitment required. 100% free first draft.'}</p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AudioPlayerBar({
  audioRef,
  playing,
  onToggle,
  onClose,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    if (audio.currentTime) setCurrentTime(audio.currentTime);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioRef]);

  const handleSeek = (e: ReactMouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = percent * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleRewind10 = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.aside
      className="floating-audio-bar"
      aria-label="Brand Audio Player"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 25, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div className="audio-bar-wave" aria-hidden="true">
        <span className={`wave-bar ${playing ? 'wave-bar--animating' : ''}`} style={{ animationDelay: '0s' }} />
        <span className={`wave-bar ${playing ? 'wave-bar--animating' : ''}`} style={{ animationDelay: '0.2s' }} />
        <span className={`wave-bar ${playing ? 'wave-bar--animating' : ''}`} style={{ animationDelay: '0.4s' }} />
      </div>

      <div className="audio-bar-info">
        <div className="audio-bar-title-wrap">
          <strong className="audio-bar-title">Finpixel Brand Story</strong>
          <span className="audio-bar-pill">Audio Tour</span>
        </div>
        <div className="audio-bar-time">
          <span>{formatTime(currentTime)}</span>
          <div
            className="audio-bar-track"
            onClick={handleSeek}
            role="slider"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            <div className="audio-bar-progress" style={{ width: `${progress}%` }} />
            <div className="audio-bar-thumb" style={{ left: `${progress}%` }} />
          </div>
          <span>{formatTime(duration || 70)}</span>
        </div>
      </div>

      <div className="audio-bar-actions">
        <button
          type="button"
          onClick={handleRewind10}
          className="audio-bar-btn"
          aria-label="Rewind 10 seconds"
          title="Rewind 10s"
        >
          <RotateCcw size={13} />
          <small className="rewind-10-num">10</small>
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="audio-bar-btn audio-bar-btn--play"
          aria-label={playing ? 'Pause audio' : 'Play audio'}
        >
          {playing ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="audio-bar-btn audio-bar-btn--close"
          aria-label="Close audio player"
          title="Close player"
        >
          <X size={13} />
        </button>
      </div>
    </motion.aside>
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
  const [content, setContent] = useState<ContentMap>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, interest: '' });
  const [snowEnabled, setSnowEnabled] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioBarOpen, setAudioBarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const heroProductRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const snowflakes = useMemo(() => Array.from({ length: 18 }, (_, index) => ({ left: (index * 37 + 9) % 100, size: 3 + (index % 4), delay: -((index * 1.13) % 9), duration: 8 + (index % 5) * 1.1 })), []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content');
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) return;
      const rows = await response.json();
      if (!Array.isArray(rows)) return;
      const mapped = (rows as SiteRow[]).reduce<ContentMap>((result, row) => {
        if (row && row.section && row.content) {
          result[row.section] = row.content;
        }
        return result;
      }, {});
      if (Object.keys(mapped).length > 0) {
        setContent((prev) => ({ ...prev, ...mapped }));
      }
    } catch (err) {
      console.warn('Content sync notice: running on high-speed built-in content.', err);
    }
  };

  useEffect(() => { void fetchContent(); }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('finpixel-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0d11' : '#ffffff');
  }, [theme]);
  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lite = navigator.hardwareConcurrency <= 2 || (device.deviceMemory ?? 8) <= 2 || Boolean(device.connection?.saveData);
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
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setAudioPlaying(false);
      return;
    }

    try {
      setAudioBarOpen(true);
      if (!audio.src || !audio.src.includes('brand_explanation.mp3')) {
        audio.src = '/brand_explanation.mp3';
      }
      if (audio.readyState === 0) {
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      setAudioPlaying(true);
    } catch (err) {
      console.warn('Playback error, retrying load and play:', err);
      try {
        audio.load();
        await audio.play();
        setAudioPlaying(true);
      } catch (retryErr) {
        console.error('Audio play failed completely:', retryErr);
        setAudioPlaying(false);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setAudioPlaying(true);
      setAudioBarOpen(true);
    };
    const onPause = () => setAudioPlaying(false);
    const onEnded = () => {
      setAudioPlaying(false);
      audio.currentTime = 0;
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    });

    let frameId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    (window as any).__lenis = lenis;

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [reduceMotion]);

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (!lenis) return;
    if (modal.open || chatOpen || menuOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [modal.open, chatOpen, menuOpen]);

  const navigateToSection = (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (!href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    document.documentElement.classList.add('force-layout');

    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(target, {
        offset: -40,
        duration: 1.2,
        onComplete: () => {
          document.documentElement.classList.remove('force-layout');
          window.history.replaceState(null, '', href);
        },
      });
    } else {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(null, '', href);
        window.setTimeout(() => document.documentElement.classList.remove('force-layout'), 850);
      });
    }
  };

  const openDemo = (interest = '') => {
    setMenuOpen(false);
    setModal({ open: true, interest });
  };

  const whatsappLink = useMemo(() => {
    const defaultMsg = 'Hello Finpixel India! I visited your website and would like to know more about your services.';
    const msg = content.footer?.whatsappMessage || defaultMsg;
    return `https://wa.me/917004176367?text=${encodeURIComponent(msg)}`;
  }, [content.footer]);

  const CONTACT_OPTIONS = [
    { type: 'whatsapp', label: 'WhatsApp', value: '+91 70041 76367', href: 'https://wa.me/917004176367' },
    { type: 'email', label: 'Email', value: 'finpixelindia@gmail.com', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=finpixelindia@gmail.com' },
    { type: 'instagram', label: 'Instagram', value: '@finpixel.india', href: 'https://instagram.com/finpixel.india' },
    { type: 'linkedin', label: 'LinkedIn', value: 'Ashish Singh', href: 'https://www.linkedin.com/in/ashish-singh-9212563a3' },
    { type: 'fiverr', label: 'Fiverr', value: 'finpixelindia', href: 'https://www.fiverr.com/finpixelindia' },
    { type: 'x', label: 'X (Twitter)', value: '@Finpixelindia', href: 'https://x.com/Finpixelindia' },
    { type: 'github', label: 'GitHub', value: 'finpixel-india', href: 'https://github.com/finpixel-india' },
    { type: 'linktree', label: 'Linktree', value: 'linktr.ee/finpixelindia', href: 'https://linktr.ee/finpixelindia' },
    { type: 'notion', label: 'Portfolio', value: 'FinPixel India', href: 'https://www.notion.so/FinPixel-India-official-2dff04948ec9806ba968fdaab1925f53' },
  ];

  const contactOptions = useMemo(() => {
    const rawOptions = content.footer?.contactOptions?.length ? content.footer.contactOptions : CONTACT_OPTIONS;
    return rawOptions.map((opt: any) => {
      if (opt.type === 'whatsapp') {
        return { ...opt, value: '+91 70041 76367', href: 'https://wa.me/917004176367?text=Hello%20Finpixel%20India!%20I%20am%20interested%20in%20a%20free%20demo.' };
      }
      if (opt.type === 'email') {
        return { ...opt, value: 'finpixelindia@gmail.com', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=finpixelindia@gmail.com' };
      }
      return opt;
    });
  }, [content.footer]);

  const { nav, hero, trust, about, services, comparison, pricing, industries, codeShowcase, promise, process, pageShowcase, cta, footer, leadForm, privacy, chatbot } = content;

  const heroData = useMemo(() => ({
    ...hero,
    eyebrow: hero?.eyebrow || "India's Premium Web Design Studio",
    title: 'We Build Brands, Not Just Websites.',
    subheadline: 'We build high-performance websites for Schools, Colleges, Hotels, Restaurants and Brands across India. Fast. Secure. Affordable.',
    primary: hero?.primary || 'Get Your Free Demo',
    secondary: hero?.secondary || 'See Our Work',
    assurances: Array.isArray(hero?.assurances) && hero.assurances.length >= 2
      ? hero.assurances
      : ['Demo First, Pay After Approval', '100% Code Ownership'],
    floatingCards: Array.isArray(hero?.floatingCards) && hero.floatingCards.length >= 2
      ? hero.floatingCards
      : [
          { label: 'Google Speed', value: '100 / 100' },
          { label: 'Pan-India', value: 'Remote-First' },
        ],
  }), [hero]);

  const aboutData = useMemo(() => ({
    ...about,
    eyebrow: 'We Are Finpixel India',
    headline: 'The Digital Architects of Bharat',
    tagline: 'Bridging traditional Bharat with the digital future through uncompromising hand-crafted technology.',
    who: {
      title: 'Who We Are',
      paragraphs: [
        'Finpixel India is not your typical corporate agency. We are an agile, remote-first technology studio born out of a simple necessity: Local businesses deserve world-class digital tools.',
        'Founded by Ashish Singh (Tech Lead) and the team, we operate from the heart of Bihar with a Pan-India vision. We are the bridge between the traditional "brick-and-mortar" India and the explosive "Digital India" of tomorrow. While big city agencies chase million-dollar contracts, we are busy empowering the schools, hospitals, and businesses that actually build our nation.',
      ],
    },
    vision: {
      title: 'Our Vision',
      description: 'To democratize premium web technology. We believe a small private school in a village should have a website that is just as fast, secure, and professional as a top university in Mumbai.',
    },
    goal: {
      title: 'Our Goal',
      description: "To digitize 1,000 local institutions across India by 2027. We aren't just building websites; we are building Digital Assets that solve real business problems—increasing admissions for schools, patient trust for doctors, and footfall for local brands.",
    },
    whatWeDo: {
      title: 'High-Performance Static Web Development',
      items: [
        {
          title: 'Hand-Coded Perfection',
          description: 'We do not use slow, bloated website builders like Wix or WordPress. We write raw, clean HTML5, CSS3, and JavaScript. This means our sites load in under 1 second, even on 4G mobile networks.',
          icon: 'code',
        },
        {
          title: 'School & College Ecosystems',
          description: 'We build digital infrastructures for education—admission inquiry portals, mobile-responsive galleries, and notice boards that principals can actually use.',
          icon: 'graduation',
        },
        {
          title: 'Hyper-Local SEO & Maps',
          description: 'A website is useless if no one can find it. We specialize in Google Maps Optimization, ensuring our clients dominate the "Near Me" searches in their districts.',
          icon: 'maps',
        },
        {
          title: 'Zero-Maintenance Hosting',
          description: 'By leveraging global CDNs (Content Delivery Networks) like Netlify, we ensure 99.99% uptime with military-grade SSL security, all without forcing expensive server costs on our clients.',
          icon: 'hosting',
        },
      ],
    },
    strengths: {
      title: 'Our Unmatched Strengths',
      items: [
        {
          title: "1. The 'Trust First' Model (Our Secret Weapon)",
          description: "In an industry full of scams and over-promising, we flipped the script. We operate on a 'Demo First, Pay Later' philosophy. We build a working prototype of the client's website before we ask for a single rupee. We don't demand trust; we earn it.",
        },
        {
          title: "2. The 'Spiderman' Agility",
          description: "We run lean. We don't have bloated teams or fancy offices. Using advanced AI-augmented coding workflows (Gemini/Antigravity), we can deploy a full-scale commercial website in 48 hours—something traditional agencies take weeks to do.",
        },
        {
          title: "3. The 'Local Empathy' Advantage",
          description: "We understand the Indian market. We know that a local business in India cares more about trust (Bharosa) and value than technical jargon. We speak their language, offering solutions that fit their budget without compromising on the 'Big City' quality.",
        },
        {
          title: "4. 100/100 Performance Obsession",
          description: "We are obsessed with the Google PageSpeed Score. While competitors deliver heavy sites that score a '40/100' and lose customers, we aim for a perfect 100/100. We treat speed as a feature, not an afterthought.",
        },
      ],
    },
    otherWork: {
      title: 'Our Other Precise Works',
      intro: 'Beyond websites, we engineer growth using Influence and Automation.',
      items: [
        {
          service: 'Social Media Promotion',
          trapLabel: 'The Visibility Trap',
          trapTitle: "The 'Ghost Town' Feed",
          quote: '"Posting every single day but nobody cares? You are shouting in an empty room."',
          solutionLabel: 'The Solution',
          solutionTitle: 'Viral Engineering',
          solution: "We don't guess algorithms; we master them. We turn your social media into a traffic engine that drives real customers, not just random likes.",
        },
        {
          service: 'Social Media Promotion',
          trapLabel: 'The Aesthetic Trap',
          trapTitle: "Design by 'My Nephew'",
          quote: '"Ugly Canva posts ruin your brand reputation faster than a bad review ever could."',
          solutionLabel: 'The Solution',
          solutionTitle: 'Premium Brand Authority',
          solution: 'Your feed is your digital showroom. We curate a cohesive, high-end aesthetic that makes your brand look expensive, trustworthy, and unignorable.',
        },
        {
          service: 'Social Media Promotion',
          trapLabel: 'The ROI Trap',
          trapTitle: "'Likes' Don't Pay Bills",
          quote: '"Vanity metrics are fun to look at. Bank deposits are better to live with."',
          solutionLabel: 'The Solution',
          solutionTitle: 'Conversion Strategy',
          solution: 'We stop chasing hearts and start chasing leads. We align your content strategy to funnel users directly to your "Buy Now" button.',
        },
        {
          service: 'Automation & AI',
          trapLabel: 'The Data Trap',
          trapTitle: 'Excel Sheet Hell',
          quote: '"Still manually copying data from emails to spreadsheets? It’s 2026. Stop working like it\'s 1999."',
          solutionLabel: 'The Solution',
          solutionTitle: 'n8n Workflow Automation',
          solution: 'We build invisible robots that sync your data instantly. Form submission → CRM → WhatsApp → Invoice. Zero human effort required.',
        },
        {
          service: 'Automation & AI',
          trapLabel: 'The Speed Trap',
          trapTitle: 'Leads Going Cold',
          quote: '"If you take 6 hours to reply to a potential customer, they are already buying from your competitor."',
          solutionLabel: 'The Solution',
          solutionTitle: 'Instant AI Agents',
          solution: 'We deploy intelligent auto-responders that engage leads instantly, 24/7. Capture the customer while their interest is hot.',
        },
        {
          service: 'Automation & AI',
          trapLabel: 'The Accuracy Trap',
          trapTitle: 'Human Error is Expensive',
          quote: '"Typos in invoices? Missed follow-ups? Humans get tired and make mistakes."',
          solutionLabel: 'The Solution',
          solutionTitle: 'Flawless Execution',
          solution: "Robots don't need coffee breaks. We automate your boring repetitive tasks so you can focus on growing the business.",
        },
      ],
    },
    promise: {
      title: 'The Finpixel Promise',
      paragraphs: [
        "We are not just service providers; we are Co-Founders in our clients' digital journey. When a school works with Finpixel, they don't just get a URL. They get a 24/7 technical partner, a business growth consultant, and a team that takes their success personally.",
        'We are Finpixel India. We build the web, so you can build your business.',
      ],
    },
  }), [about]);

  const privacyData = privacy || {
    metaTitle: 'Privacy Policy — Finpixel India',
    brandNote: 'Privacy Policy',
    backLabel: 'Back to Home',
    eyebrow: 'Legal Document',
    title: 'Privacy Policy',
    intro: 'At Finpixel India, we are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and safeguard your data when you visit our website or request our services.',
    effectiveLabel: 'Effective Date',
    effectiveDate: '01 September 2026',
    contentsLabel: 'Contents',
    callout: {
      title: 'Your Privacy Matters',
      description: 'We collect only what is necessary, never sell your data, and you retain full ownership of your information at all times.',
    },
    sections: [
      {
        title: 'Information We Collect',
        paragraphs: ['When you fill out our demo request form, we collect your name, phone number, email address, and business type to respond to your enquiry.', 'We may also collect basic analytics data (page views, device type) through privacy-respecting tools to improve our website.'],
        items: ['Name and contact details provided via our forms', 'Business type and project requirements', 'Basic technical data (browser type, country) via analytics'],
      },
      {
        title: 'How We Use Your Information',
        paragraphs: ['We use your information solely to respond to your demo request, communicate about our services, and deliver your project. We do not use your data for advertising or sell it to third parties.'],
        items: ['To respond to your enquiries and demo requests', 'To communicate project details and deliverables', 'To send important service-related updates (never spam)'],
      },
      {
        title: 'Data Storage & Security',
        paragraphs: ['Your data is stored securely using Supabase (PostgreSQL) with encrypted connections. Access is restricted to authorised personnel only. We retain enquiry data for up to 24 months unless you request deletion.'],
      },
      {
        title: 'Third-Party Services',
        paragraphs: ['We use WhatsApp Business for direct communication, and Cloudflare for hosting and DDoS protection. These services have their own privacy policies. We do not share your personal data with any other third parties.'],
        items: ['WhatsApp Business (Meta Platforms)', 'Cloudflare (hosting & security)', 'Supabase (secure database)'],
      },
      {
        title: 'Your Rights',
        paragraphs: ['You have the right to access, correct, or delete any personal data we hold about you. To exercise these rights, email us at finpixelindia@gmail.com. We will respond within 7 business days.'],
      },
      {
        title: 'Cookies',
        paragraphs: ['Our website uses only essential cookies to remember your theme preference (light/dark mode). We do not use advertising or tracking cookies. You can clear cookies anytime via your browser settings.'],
      },
      {
        title: 'Changes to This Policy',
        paragraphs: ['We may update this policy periodically. Changes will be posted on this page with an updated effective date. Continued use of our website after changes constitutes acceptance of the revised policy.'],
      },
    ],
    contact: {
      eyebrow: 'Questions?',
      title: 'Contact Us',
      description: 'If you have any questions about this Privacy Policy or how we handle your data, please reach out to us directly.',
      email: 'finpixelindia@gmail.com',
    },
    footer: '© 2026 Finpixel India. All rights reserved.',
  };

  if (window.location.pathname === '/privacy') return <PrivacyPage privacy={privacyData} theme={theme} setTheme={setTheme} />;

  return (
    <AnimatePresence mode="wait">
    <motion.div key="site" className="site-shell" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .38, ease: [0.16, 1, 0.3, 1] }}>
      <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <a className="nav-brand" href="#top" onClick={(event) => navigateToSection(event, '#top')}><BrandMark /><small>{nav?.tagline || 'Defining every pixel with precision'}</small></a>
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
              <motion.div initial={lightweightMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .54, delay: .02, ease: [0.16, 1, 0.3, 1] }}><Eyebrow>{heroData.eyebrow}</Eyebrow></motion.div>
              <motion.h1 initial={lightweightMotion ? false : { opacity: 0, y: 11 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .58, delay: .08, ease: [0.16, 1, 0.3, 1] }}>{heroData.title}</motion.h1>
              <motion.p initial={lightweightMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .58, delay: .14, ease: [0.16, 1, 0.3, 1] }}>{heroData.subheadline}</motion.p>
              <motion.div className="hero-actions" initial={lightweightMotion ? false : { opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .56, delay: .2, ease: [0.16, 1, 0.3, 1] }}><Button onClick={() => openDemo()}>{heroData.primary}<ArrowRight size={17} /></Button><Button variant="secondary" href="#work">{heroData.secondary}<MousePointer2 size={16} /></Button></motion.div>
              <motion.div className="hero-assurance" initial={lightweightMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .54, delay: .26, ease: [0.16, 1, 0.3, 1] }}><span><Check size={13} />{heroData.assurances[0]}</span><span><Check size={13} />{heroData.assurances[1]}</span></motion.div>
            </div>
            <motion.div ref={heroProductRef} className="hero-product" initial={lightweightMotion ? false : { opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .72, delay: .22, ease: [0.16, 1, 0.3, 1] }} onPointerMove={tiltHero} onPointerLeave={resetHeroTilt}>
              <div className="product-halo" /><div className="browser-bob"><BrowserProduct /></div>
              <div className="floating-chip floating-chip--speed"><Zap size={14} /><span><small>{heroData.floatingCards[0].label}</small><b>{heroData.floatingCards[0].value}</b></span></div>
              <div className="floating-chip floating-chip--location"><Globe2 size={14} /><span><small>{heroData.floatingCards[1].label}</small><b>{heroData.floatingCards[1].value}</b></span></div>
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

        {promise && <section className="promise-section section">
          <div className="container">
            <Reveal className="section-heading centered"><Eyebrow>{promise.eyebrow}</Eyebrow><h2>{promise.headline}</h2><p>{promise.subheadline}</p></Reveal>
            <div className="promise-grid">{promise.items.map((item: any, index: number) => { const Icon = iconMap[item.icon] || ShieldCheck; return <Reveal className="promise-card" key={item.title} delay={index * .06}><span className="promise-number">0{index + 1}</span><div className="gold-icon"><Icon size={24} strokeWidth={1.5} /></div><h3>{item.title}</h3><p>{item.description}</p></Reveal>; })}</div>
          </div>
        </section>}

        {process && (
          <section className="process-section section" id="process">
            <div className="container">
              <Reveal className="section-heading centered">
                <Eyebrow>{process.eyebrow || 'How It Works'}</Eyebrow>
                <h2>{process.headline || 'From Idea to Live Site'}</h2>
                <p>{process.subheadline || 'A simple, transparent process with no surprises.'}</p>
              </Reveal>

              <div className="process-container-wrap">
                <div className="process-grid-modern">
                  {process.steps.map((step: any, index: number) => {
                    const stepIcons = [MessageCircle, Code2, RotateCcw, Rocket];
                    const StepIcon = stepIcons[index % stepIcons.length];
                    return (
                      <Reveal className="process-card-modern" key={step.title || index} delay={index * 0.08}>
                        <div className="process-card-top-bar">
                          <span className="process-step-badge">
                            <i>0{index + 1}</i>
                            <span className="badge-dot" />
                          </span>
                          <span className="process-timing-tag">{step.timing || `Phase 0${index + 1}`}</span>
                        </div>

                        <div className="process-icon-box">
                          <StepIcon size={22} strokeWidth={1.75} />
                        </div>

                        <h3 className="process-step-title">{step.title}</h3>
                        <p className="process-step-desc">{step.description}</p>

                        {step.deliverable && (
                          <div className="process-deliverable-pill">
                            <CheckCircle2 size={13} />
                            <span>{step.deliverable}</span>
                          </div>
                        )}
                        {step.highlight && (
                          <div className="process-highlight-tag">
                            <span>{step.highlight}</span>
                          </div>
                        )}
                      </Reveal>
                    );
                  })}
                </div>
              </div>

              <Reveal className="process-footer-trust">
                <ShieldCheck size={16} />
                <span>Zero advance deposit. We build your working prototype first — you pay only when you approve.</span>
              </Reveal>
            </div>
          </section>
        )}

        {pageShowcase && Array.isArray(pageShowcase.items) && <section className="pages-section section">
          <div className="container">
            <Reveal className="section-heading centered"><Eyebrow>{pageShowcase.eyebrow}</Eyebrow><h2>{pageShowcase.headline}</h2><p>{pageShowcase.subheadline}</p></Reveal>
            <div className="pages-grid">{pageShowcase.items.map((page: any, index: number) => <Reveal className="page-card" key={page.title || index} delay={index * .06}><div className="page-card-top"><span>0{index + 1}</span><div className="page-card-icon"><Sparkles size={17} /></div></div><span className="page-card-prompt">{page.prompt || page.kicker || ''}</span><h3>{page.title}</h3><p>{page.description || page.detail || ''}</p><div className="page-card-metric"><CheckCircle2 size={14} /><span>{page.highlight || page.metric || ''}</span></div></Reveal>)}</div>
            {pageShowcase.footnote && <Reveal className="pages-footer"><p className="pages-note">{pageShowcase.footnote}</p></Reveal>}
          </div>
        </section>}

        {pricing && (
          <section className="pricing-section section" id="pricing">
            <div className="pricing-orb pricing-orb--one" />
            <div className="pricing-orb pricing-orb--two" />
            <div className="container pricing-inner">
              <Reveal className="section-heading centered">
                <Eyebrow>{pricing.eyebrow || 'Simple Pricing'}</Eyebrow>
                <h2>{pricing.headline || 'Plans for Every Budget'}</h2>
                <p>{pricing.subheadline || 'Transparent pricing. No hidden fees. Final cost based on your scope.'}</p>
              </Reveal>

              <div className="pricing-grid-modern">
                {pricing.plans.map((plan: any, index: number) => {
                  const isFeatured = Boolean(plan.featured);
                  return (
                    <Reveal
                      className={`pricing-card-modern ${isFeatured ? 'pricing-card-modern--featured' : ''}`}
                      key={plan.name}
                      delay={index * 0.07}
                    >
                      {isFeatured && (
                        <div className="pricing-featured-ribbon">
                          <Sparkles size={13} />
                          <span>{pricing.popularBadge || 'Most Popular · Best Value'}</span>
                        </div>
                      )}

                      <div className="pricing-card-header">
                        <span className="pricing-card-subtitle">{plan.subtitle}</span>
                        {plan.idealFor && <span className="pricing-ideal-tag">{plan.idealFor}</span>}
                      </div>

                      <h3 className="pricing-plan-title">{plan.name}</h3>
                      <p className="pricing-plan-summary">{plan.description}</p>

                      <div className="pricing-price-display">
                        <div className="price-number-wrap">
                          <small className="price-currency">{plan.currency || '₹'}</small>
                          <strong className="price-val">{plan.price}</strong>
                          <span className="price-period">/{plan.period || 'onwards'}</span>
                        </div>
                        <span className="price-guarantee-tag">Pay after demo approval</span>
                      </div>

                      <div className="pricing-divider" />

                      <ul className="pricing-feature-list">
                        {plan.features.map((feature: string) => (
                          <li key={feature}>
                            <Check size={15} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={isFeatured ? 'primary' : 'secondary'}
                        className="pricing-action-btn"
                        onClick={() => openDemo(plan.interest || plan.name)}
                      >
                        {plan.cta || 'Request Free Demo'}
                        <ArrowRight size={16} />
                      </Button>

                      <div className="pricing-trust-stamp">
                        <ShieldCheck size={13} />
                        <span>Demo First · 100% Code Ownership</span>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              <Reveal className="pricing-note">
                <ShieldCheck size={16} />
                <span>{pricing.note || 'All plans include Demo-First guarantee. Pay only after you approve.'}</span>
              </Reveal>
            </div>
          </section>
        )}

        {aboutData && <AboutSection about={aboutData} />}

        <section className="cta-section" id="contact">
          <div className="cta-noise" />
          <div className="cta-glow" />
          <Reveal className="container cta-inner">
            <Eyebrow dark>{cta.eyebrow}</Eyebrow>
            <h2>{cta.headline}</h2>
            <p>{cta.subheadline}</p>
            <div className="cta-actions"><Button onClick={() => openDemo()}>{cta.primary}<ArrowRight size={18} /></Button><Button variant="darkGhost" href={whatsappLink}>{cta.secondary}<WhatsAppIcon size={18} /></Button></div>
            <div className="cta-proof">{cta.proofs.map((item: string) => <span key={item}><Check size={13} />{item}</span>)}</div>
            <div className="contact-options-grid">
              {contactOptions.map((option: any, index: number) => {
                const isEmail = option.type === 'email';
                const isCentered = index === contactOptions.length - 1 && contactOptions.length % 4 === 1;
                const emailHref = 'https://mail.google.com/mail/?view=cm&fs=1&to=finpixelindia@gmail.com';
                const targetHref = isEmail ? emailHref : option.href;
                const external = isEmail || /^https?:\/\//.test(targetHref);
                return (
                  <a
                    href={targetHref}
                    key={option.type}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    className={`contact-option-card ${isCentered ? 'contact-card--centered' : ''}`}
                    onClick={(e) => {
                      if (isEmail) {
                        e.preventDefault();
                        window.open(emailHref, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <i><ContactIcon type={option.type} /></i>
                    <span><b>{option.label}</b><small>{option.value}</small></span>
                    <ArrowRight className="contact-arrow" size={15} />
                  </a>
                );
              })}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand"><a className="footer-logo-link" href="#top" onClick={(event) => navigateToSection(event, '#top')}><BrandMark /></a><p>{footer.description}</p><span><span />{footer.availability}</span></div>
            <div className="footer-links">
              <div><b>{footer.navLabel}</b>{footer.links.map((link: any) => <a href={link.href} key={link.label} onClick={(event) => navigateToSection(event, link.href)}>{link.label}</a>)}</div>
              <div>
                <b>{footer.contactLabel || 'Contact'}</b>
                <a href={whatsappLink} target="_blank" rel="noreferrer">+91 70041 76367</a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=finpixelindia@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=finpixelindia@gmail.com', '_blank', 'noopener,noreferrer');
                  }}
                >
                  finpixelindia@gmail.com
                </a>
                <small>{footer.location}</small>
              </div>
              <div>
                <b>{footer.socialLabel || 'Connect'}</b>
                <div className="socials footer-contact-icons">
                  {contactOptions.map((option: any) => {
                    const isEmail = option.type === 'email';
                    const emailHref = 'https://mail.google.com/mail/?view=cm&fs=1&to=finpixelindia@gmail.com';
                    const targetHref = isEmail ? emailHref : option.href;
                    const external = isEmail || /^https?:\/\//.test(targetHref);
                    return (
                      <a
                        href={targetHref}
                        key={option.type}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        aria-label={option.label}
                        title={option.label}
                        onClick={(e) => {
                          if (isEmail) {
                            e.preventDefault();
                            window.open(emailHref, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <ContactIcon type={option.type} size={16} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{footer.copyright}</p>
            <div>
              {footer.legal?.map((link: any) => <a href={link.href} key={link.label}>{link.label}</a>)}
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <div className={`support-controls ${chatOpen ? 'support-controls--chat-open' : ''}`}><button className={chatOpen ? 'chatbot-toggle active' : 'chatbot-toggle'} type="button" onClick={() => setChatOpen(!chatOpen)} aria-label={`${chatOpen ? 'Close' : 'Open'} Finpixel AI chatbot`}><Bot size={21} /></button><motion.a className="whatsapp-float" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat with Finpixel India on WhatsApp" initial={{ opacity: 0, x: 12, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: .55, delay: .5, ease: [0.16, 1, 0.3, 1] }}><i><WhatsAppIcon size={23} /></i></motion.a></div>

      <AnimatePresence>{snowEnabled && <motion.div className="snow-layer" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .4 }}>{snowflakes.map((flake, index) => <span key={index} style={{ left: `${flake.left}%`, width: `${flake.size}px`, height: `${flake.size}px`, animationDelay: `${flake.delay}s`, animationDuration: `${flake.duration}s` }} />)}</motion.div>}</AnimatePresence>
      <div className="experience-controls" aria-label="Experience controls">
        <button type="button" className={snowEnabled ? 'active' : ''} onClick={() => setSnowEnabled(!snowEnabled)} aria-label={`${snowEnabled ? 'Turn off' : 'Turn on'} snow effect`} data-label="Snow"><Snowflake size={17} /></button>
        <button type="button" className={audioPlaying ? 'active audio-playing' : ''} onClick={() => { void toggleAudioDescription(); }} aria-label={`${audioPlaying ? 'Pause' : 'Play'} audio description`} data-label={audioPlaying ? 'Pause' : 'Listen'}>
          {audioPlaying ? <VolumeX size={17} /> : <Volume2 size={17} />}
          {audioPlaying && <span className="audio-pulse-ring" aria-hidden="true" />}
        </button>
      </div>
      <audio
        ref={audioRef}
        src="/brand_explanation.mp3"
        preload="auto"
        playsInline
      />

      <AnimatePresence>{chatOpen && chatbot && <AiChatbot config={chatbot} onClose={() => setChatOpen(false)} />}</AnimatePresence>

      <AnimatePresence>
        {audioBarOpen && (
          <AudioPlayerBar
            audioRef={audioRef}
            playing={audioPlaying}
            onToggle={() => { void toggleAudioDescription(); }}
            onClose={() => setAudioBarOpen(false)}
          />
        )}
      </AnimatePresence>

      <LeadModal state={modal} onClose={() => setModal({ open: false, interest: '' })} formContent={leadForm} whatsappLink={whatsappLink} onSubmitted={() => { void fetchContent(); }} />
    </motion.div>
    </AnimatePresence>
  );
}
