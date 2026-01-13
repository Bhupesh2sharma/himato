import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Instagram, Facebook, Twitter, Send, Copy, Check, Loader2, Image as ImageIcon, History, Clock } from 'lucide-react';
import { apiClient } from '../../services/api';

export const AISocialGenerator = () => {
    const [platform, setPlatform] = useState('Instagram');
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('Travelers');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const fetchHistory = async () => {
        try {
            const response = await apiClient.getSocialContentHistory();
            if (response.status === 'success') {
                setHistory(response.data.history);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsGenerating(true);
        setGeneratedContent(null);
        try {
            const response = await apiClient.generateSocialContent({
                platform,
                topic,
                targetAudience: audience
            });
            if (response.status === 'success') {
                setGeneratedContent(response.data.content);
                fetchHistory(); // Refresh history after generation
            }
        } catch (error: any) {
            console.error('Failed to generate content:', error);
            alert(error.message || 'Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (content: any) => {
        if (!content) return;
        const textToCopy = `${content.caption}\n\n${content.hashtags.join(' ')}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="glass-card rounded-2xl p-6 md:p-8 bg-gradient-to-br from-ai-accent/5 to-transparent border-ai-accent/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-ai-accent/10">
                        <Sparkles className="w-6 h-6 text-ai-accent" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Content Creator</h2>
                        <p className="text-ai-muted text-sm">Generate high-engagement social posts in seconds</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-ai-muted mb-3 text-glow-accent">Target Platform</label>
                            <div className="flex gap-4">
                                {[
                                    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                                    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
                                    { name: 'Twitter', icon: Twitter, color: 'text-sky-400' }
                                ].map((p) => (
                                    <button
                                        key={p.name}
                                        type="button"
                                        onClick={() => setPlatform(p.name)}
                                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${platform === p.name
                                            ? 'bg-ai-accent/10 border-ai-accent text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                            : 'bg-white/5 border-white/10 text-ai-muted hover:border-white/20'
                                            }`}
                                    >
                                        <p.icon className={`w-6 h-6 ${platform === p.name ? p.color : ''}`} />
                                        <span className="text-xs font-semibold">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ai-muted mb-3 text-glow-accent">What's the post about?</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. A 5-day romantic gateway to North Sikkim with zero-point visit..."
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-ai-accent/40 focus:bg-white/10 transition-all min-h-[120px] resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ai-muted mb-3 text-glow-accent">Target Audience</label>
                            <select
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-ai-accent/40 transition-all appearance-none"
                            >
                                <option value="Travelers">General Travelers</option>
                                <option value="Honeymooners">Honeymooners / Couples</option>
                                <option value="Adventurers">Adventure Lovers</option>
                                <option value="Families">Families</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isGenerating || !topic}
                            className="w-full py-4 bg-ai-accent text-ai-dark font-bold rounded-2xl hover:bg-ai-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_4px_30px_rgba(34,197,94,0.5)] active:scale-95"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Trends...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Generate Magic Post
                                </>
                            )}
                        </button>
                    </form>

                    {/* Result */}
                    <div className="relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {generatedContent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full flex flex-col gap-6"
                                >
                                    <div className="glass p-6 rounded-3xl border-ai-accent/20 relative group overflow-hidden flex-1">
                                        <div className="absolute top-0 right-0 p-4">
                                            <button
                                                onClick={() => copyToClipboard(generatedContent)}
                                                className="p-2 bg-white/10 hover:bg-ai-accent rounded-lg transition-all"
                                                title="Copy all"
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        <div className="mb-6">
                                            <div className="text-xs font-mono text-ai-accent mb-2 uppercase tracking-widest">Caption</div>
                                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                                                {generatedContent.caption}
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <div className="text-xs font-mono text-ai-accent mb-2 uppercase tracking-widest">Hashtags</div>
                                            <div className="flex flex-wrap gap-2">
                                                {generatedContent.hashtags.map((tag: string, i: number) => (
                                                    <span key={i} className="text-sky-400 text-xs hover:underline cursor-pointer">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs font-mono text-ai-accent mb-2 uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" />
                                                Visual Suggestion
                                            </div>
                                            <p className="text-ai-muted text-xs italic">
                                                {generatedContent.imageSuggestions}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-center text-ai-muted uppercase tracking-[0.2em]">
                                        Pro Tip: Pair this with a high-quality vertical video for better reach.
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-12 text-center text-ai-muted">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Sparkles className="w-8 h-8 opacity-20" />
                                    </div>
                                    <h3 className="text-white font-medium mb-2 uppercase tracking-widest text-sm">Waiting for your Spark</h3>
                                    <p className="text-xs max-w-[200px] leading-relaxed">
                                        Fill out the form on the left to generate viral social media content.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-ai-accent" />
                        <h3 className="text-xl font-bold text-white">Generation History</h3>
                    </div>
                </div>

                {isLoadingHistory ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-ai-accent animate-spin" />
                    </div>
                ) : history.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {history.map((item) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 border-white/5 hover:border-ai-accent/20 transition-all flex flex-col gap-4 group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg bg-white/5 ${item.platform === 'Instagram' ? 'text-pink-500' :
                                                item.platform === 'Facebook' ? 'text-blue-500' :
                                                    'text-sky-400'
                                            }`}>
                                            {item.platform === 'Instagram' && <Instagram className="w-4 h-4" />}
                                            {item.platform === 'Facebook' && <Facebook className="w-4 h-4" />}
                                            {item.platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                                        </div>
                                        <span className="text-xs font-bold text-white">{item.platform}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-ai-muted">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-ai-accent uppercase tracking-widest">Topic</p>
                                    <p className="text-sm text-white font-medium line-clamp-2">{item.topic}</p>
                                </div>

                                <div className="flex-1">
                                    <p className="text-xs text-ai-muted line-clamp-3 italic">
                                        "{item.content.caption}"
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] text-ai-muted uppercase tracking-widest">For {item.targetAudience}</span>
                                    <button
                                        onClick={() => copyToClipboard(item.content)}
                                        className="text-xs text-ai-accent hover:text-ai-accent/80 font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy Post
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center glass-card border-dashed border-white/5">
                        <p className="text-ai-muted italic">No generated posts yet. Start creating!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
