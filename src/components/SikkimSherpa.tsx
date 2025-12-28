import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Mountain, User, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { chatWithSherpa, getChatSessionId, setChatSessionId, clearChatSession } from '../services/ai';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    parts: string;
}

export const SikkimSherpa = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', parts: "Namaste! I am Himato, your personal Sikkim tourism guide. From hidden monasteries to snow-capped peaks, I'm here to help you plan the perfect Sikkim tourism journey. What Sikkim tourism destination would you like to explore today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
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
                { role: 'model', parts: "Namaste! I am Himato, your personal Sikkim tourism guide. From hidden monasteries to snow-capped peaks, I'm here to help you plan the perfect Sikkim tourism journey. What Sikkim tourism destination would you like to explore today?" }
            ]);
            setShowClearConfirm(false);
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            alert('Failed to clear chat history. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className={`fixed z-50 flex flex-col items-end transition-all duration-300 ${isFullScreen ? 'inset-0 bg-ai-dark/95 backdrop-blur-md' : 'bottom-6 right-6'}`}>
            <AnimatePresence>
                {(isOpen || isFullScreen) && (
                    <motion.div
                        initial={isFullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                        animate={isFullScreen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                        exit={isFullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                        className={`bg-ai-card border border-white/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl ${isFullScreen
                            ? 'w-full h-full rounded-none'
                            : 'mb-4 w-[90vw] sm:w-96 h-[500px] rounded-2xl'
                            }`}
                    >
                        {/* Header */}
                        <div className="p-4 bg-ai-accent/10 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-ai-accent/20 rounded-full">
                                    <Mountain className="w-5 h-5 text-ai-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Himato AI</h3>
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
                                    className="p-2 hover:bg-white/5 rounded-full text-ai-muted hover:text-white transition-colors"
                                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                >
                                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
                                    className="p-2 hover:bg-white/5 rounded-full text-ai-muted hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-ai-accent/20'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-ai-accent" />}
                                    </div>
                                    <div className={`max-w-[85%] p-5 rounded-2xl text-base leading-loose ${msg.role === 'user'
                                        ? 'bg-ai-accent text-white rounded-tr-none'
                                        : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none shadow-lg backdrop-blur-sm'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            msg.parts
                                        ) : (
                                            <div className="prose prose-invert prose-lg max-w-none prose-p:leading-loose prose-p:mb-6 prose-strong:text-ai-accent prose-ul:my-4 prose-li:mb-2">
                                                <ReactMarkdown>{msg.parts}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-ai-accent/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-ai-accent" />
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-ai-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-ai-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-ai-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className={`p-4 border-t border-white/10 bg-black/20 ${isFullScreen ? 'pb-8' : ''}`}>
                            <div className={`flex gap-2 ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about Sikkim tourism destinations..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ai-accent/50 placeholder-ai-muted transition-all"
                                />
                                <button
                                    onClick={handleSend}
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

            {!isFullScreen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-4 rounded-full shadow-lg shadow-ai-accent/20 transition-all ${isOpen ? 'bg-ai-card border border-white/10 text-white' : 'bg-ai-accent text-white'
                        }`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
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
