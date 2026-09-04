import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, User, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { chatWithSherpa, getChatSessionId, setChatSessionId, clearChatSession } from '../services/ai';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';
import { getSeason } from '../data/seasonalPlaces';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    parts: string;
}

const isLoadingMessages = [
    "Himato is thinking...",
    "Consulting the mountains...",
    "Mapping your request...",
    "Gathering local insights...",
    "Whispering to the winds...",
    "Finding hidden gems..."
];

// Season-aware opener + one tailored quick-reply, keyed to getSeason().key.
const SEASON_META: Record<string, { tip: string; chip: string }> = {
    winter:      { tip: "Snow season — Tsomgo Lake and Mt. Katao are magical right now.",            chip: "Plan a winter snow trip" },
    spring:      { tip: "Rhododendrons are blooming across the valleys this time of year.",           chip: "Plan a spring blooms trip" },
    summer:      { tip: "Pre-monsoon high season — ideal for North Sikkim's high passes.",            chip: "Plan a North Sikkim trip" },
    monsoon:     { tip: "Monsoon means lush hills and full-flow waterfalls — lower spots shine.",     chip: "Plan a monsoon-safe trip" },
    postMonsoon: { tip: "Post-monsoon — waterfalls are roaring and the hills are their greenest.",    chip: "Plan a September-friendly trip" },
    autumn:      { tip: "Clearest skies of the year — prime time for Kanchenjunga views.",            chip: "Plan an autumn views trip" },
};

// Evergreen starter questions shown alongside the seasonal one.
const STARTER_QUESTIONS = [
    "Best time to visit Sikkim",
    "Show me hidden gems",
    "Permits for North Sikkim",
    "Plan a 5-day itinerary",
];

// Short, warm opener (shared by the first load and the "clear chat" reset).
const WELCOME_MESSAGE = "Namaste! 🙏 I'm Himato, your Sikkim guide. What shall we plan today?";

export const SikkimSherpa = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', parts: WELCOME_MESSAGE }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showNudge, setShowNudge] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const season = getSeason(new Date().getMonth() + 1);
    const seasonMeta = SEASON_META[season.key];

    // One-time proactive greeting bubble, a short beat after load.
    useEffect(() => {
        if (localStorage.getItem('himato_sherpa_nudge_seen')) return;
        const t = setTimeout(() => setShowNudge(true), 1600);
        return () => clearTimeout(t);
    }, []);

    const dismissNudge = () => {
        setShowNudge(false);
        try { localStorage.setItem('himato_sherpa_nudge_seen', '1'); } catch { /* ignore */ }
    };

    // Load chat history on component mount
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                let history;

                if (isAuthenticated) {
                    // For authenticated users, no sessionId needed
                    history = await apiClient.getChatHistory(undefined, true);
                } else {
                    // For guest users, use sessionId from storage
                    const sessionId = getChatSessionId();
                    if (sessionId) {
                        history = await apiClient.getChatHistory(sessionId, false);
                    }
                }

                if (history && history.status === 'success' && history.data.messages && history.data.messages.length > 0) {
                    // Convert backend format to frontend format
                    const formattedMessages = history.data.messages.map((msg: { role: string; content: string }) => ({
                        role: msg.role as 'user' | 'model',
                        parts: msg.content
                    }));
                    setMessages(formattedMessages);

                    // Update sessionId for guest users if returned from backend
                    if (!isAuthenticated && history.data.sessionId) {
                        setChatSessionId(history.data.sessionId);
                    }
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
                // Continue with default welcome message if history load fails
            }
        };

        loadChatHistory();
    }, [isAuthenticated]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (override?: string) => {
        const userMessage = (override ?? input).trim();
        if (!userMessage || isLoading) return;

        if (override === undefined) setInput('');
        setMessages(prev => [...prev, { role: 'user', parts: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatWithSherpa(userMessage, isAuthenticated);
            setMessages(prev => [...prev, { role: 'model', parts: response }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'model', parts: error.message || "The connection to the Himalayas is weak right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        setIsClearing(true);
        try {
            if (isAuthenticated) {
                // For authenticated users, clear from backend
                await apiClient.clearChatHistory(undefined, true);
            } else {
                // For guest users, clear from backend and local storage
                const sessionId = getChatSessionId();
                if (sessionId) {
                    await apiClient.clearChatHistory(sessionId, false);
                }
                clearChatSession();
            }

            // Reset to welcome message
            setMessages([
                { role: 'model', parts: WELCOME_MESSAGE }
            ]);
            setShowClearConfirm(false);
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            alert('Failed to clear chat history. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setMessageIndex((prev) => (prev + 1) % isLoadingMessages.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <div className={`fixed z-50 flex flex-col items-end transition-all duration-300 ${isFullScreen ? 'inset-0 bg-ai-dark/95 backdrop-blur-md' : 'bottom-6 right-6'}`}>
            <AnimatePresence>
                {(isOpen || isFullScreen) && (
                    <motion.div
                        initial={isFullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                        animate={isFullScreen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                        exit={isFullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                        className={`bg-ai-card border border-black/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl ${isFullScreen
                            ? 'w-full h-full rounded-none'
                            : 'mb-4 w-[90vw] sm:w-96 h-[500px] rounded-2xl'
                            }`}
                    >
                        {/* Header */}
                        <div className="p-4 bg-ai-accent/10 border-b border-black/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-ai-accent/20 rounded-full">
                                    <img src="/logo-mark.png" alt="Himato" className="w-6 h-6 object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-ai-text">Himato AI</h3>
                                    <p className="text-xs text-ai-muted flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Online Guide
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {messages.length > 1 && (
                                    <button
                                        onClick={() => setShowClearConfirm(true)}
                                        disabled={isClearing}
                                        className="p-2 hover:bg-red-500/10 rounded-full text-ai-muted hover:text-red-400 transition-colors disabled:opacity-50"
                                        title="Clear chat history"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    className="p-2 hover:bg-black/5 rounded-full text-ai-muted hover:text-ai-text transition-colors"
                                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                >
                                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
                                    className="p-2 hover:bg-black/5 rounded-full text-ai-muted hover:text-ai-text transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                            <AnimatePresence>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-ai-accent/20'}`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-ai-accent" />}
                                        </div>
                                        <div className={`max-w-[85%] p-5 rounded-2xl text-base leading-loose ${msg.role === 'user'
                                            ? 'bg-ai-accent text-white rounded-tr-none'
                                            : 'bg-black/5 text-ai-text border border-black/10 rounded-tl-none shadow-lg backdrop-blur-sm'
                                            }`}>
                                            {msg.role === 'user' ? (
                                                msg.parts
                                            ) : (
                                                <div className="prose prose-invert prose-lg max-w-none prose-p:leading-loose prose-p:mb-6 prose-strong:text-ai-accent prose-ul:my-4 prose-li:mb-2">
                                                    <ReactMarkdown>{msg.parts}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-ai-accent/20 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-ai-accent" />
                                        </div>
                                        <div className="bg-black/5 p-4 rounded-2xl rounded-tl-none border border-black/10 flex flex-col gap-2">
                                            <div className="flex gap-1.5 mb-1">
                                                <span className="w-2 h-2 bg-ai-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-ai-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-ai-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <p className="text-xs text-ai-muted italic animate-pulse">
                                                {isLoadingMessages[messageIndex]}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quick-start: season-aware tip + tappable starter questions */}
                            {messages.length === 1 && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="pl-11 space-y-3"
                                >
                                    <div className="flex items-start gap-2 text-xs text-ai-text bg-ai-accent/5 border border-ai-accent/20 rounded-xl p-3">
                                        <span className="text-sm leading-none">{season.emoji}</span>
                                        <span>{seasonMeta.tip}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[seasonMeta.chip, ...STARTER_QUESTIONS].map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => handleSend(q)}
                                                className="px-3 py-1.5 rounded-full bg-ai-card border border-ai-accent/30 text-xs text-ai-accent hover:bg-ai-accent/10 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className={`p-4 border-t border-black/10 bg-black/5 ${isFullScreen ? 'pb-8' : ''}`}>
                            <div className={`flex gap-2 ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about Sikkim tourism destinations..."
                                    className="flex-1 bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-ai-text focus:outline-none focus:border-ai-accent/50 placeholder-ai-muted transition-all"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 bg-ai-accent hover:bg-ai-secondary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Proactive one-time greeting nudge */}
            <AnimatePresence>
                {showNudge && !isOpen && !isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.9 }}
                        className="mb-3 mr-1 w-60 relative bg-ai-card border border-black/10 shadow-xl rounded-2xl rounded-br-sm p-3.5 pr-8"
                    >
                        <button
                            onClick={dismissNudge}
                            aria-label="Dismiss"
                            className="absolute top-2 right-2 p-1 rounded-full text-ai-muted hover:text-ai-text hover:bg-black/5 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-sm font-semibold text-ai-text">Namaste 👋</p>
                        <p className="text-xs text-ai-muted mt-0.5 leading-relaxed">
                            Planning a Sikkim trip? I can help — ask me anything.
                        </p>
                        <button
                            onClick={() => { setIsOpen(true); dismissNudge(); }}
                            className="mt-2 text-xs font-semibold text-ai-accent hover:underline"
                        >
                            Open guide →
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isFullScreen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsOpen(!isOpen); dismissNudge(); }}
                    aria-label={isOpen ? 'Close Himato guide' : 'Open Himato guide'}
                    className={`relative p-4 rounded-full shadow-lg shadow-ai-accent/25 transition-all ${isOpen ? 'bg-ai-card border border-black/10 text-ai-text' : 'bg-ai-accent text-white'
                        }`}
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <img src="/logo-mark.png" alt="" className="w-6 h-6 object-contain brightness-0 invert" />
                            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white">
                                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
                            </span>
                        </>
                    )}
                </motion.button>
            )}

            {/* Clear Chat Confirmation Modal */}
            <ConfirmationModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearChat}
                title="Clear Chat History"
                message="Are you sure you want to clear all chat messages? This action cannot be undone."
                confirmText="Clear"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={isClearing}
            />
        </div>
    );
};
