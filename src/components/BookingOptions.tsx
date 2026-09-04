import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, BadgeCheck, Loader2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { SendToAgentModal } from './SendToAgentModal';

interface Agent {
    _id: string;
    name: string;
    businessName: string;
}

// Deterministic accent per card so the grid stays colourful and on-brand.
const ACCENTS = ['#2f4a3a', '#5a7a2a', '#c9a961', '#b73f25'];

function AgentInitials({ name, color }: { name: string; color: string }) {
    const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    return (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ background: color }}>
            {initials || 'A'}
        </div>
    );
}

export const BookingOptions = ({ data }: { data?: any }) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalAgentId, setModalAgentId] = useState<string | null>(null);

    useEffect(() => {
        apiClient
            .getRegisteredAgents()
            .then((res) => setAgents(res.data.agents || []))
            .catch(() => setAgents([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 mt-8 border-t border-black/8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-ai-muted mb-2">Verified Partners</p>
                    <h2 className="text-3xl sm:text-4xl text-ai-text leading-tight" style={{ fontWeight: 600 }}>
                        Trusted Travel<br />
                        <em className="not-italic" style={{ color: '#2f4a3a' }}>Agents in Sikkim</em>
                    </h2>
                    <p className="text-sm text-ai-muted mt-3 max-w-sm leading-relaxed">
                        Your AI itinerary, brought to life by local experts. Send it over and they'll call you back with a quote.
                    </p>
                </div>

                <motion.a
                    href="mailto:list@himato.in"
                    whileHover={{ y: -2 }}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-black/15 text-sm font-semibold text-ai-muted hover:border-ai-accent hover:text-ai-accent transition-all"
                >
                    <span className="text-lg leading-none">+</span>
                    List Your Agency
                </motion.a>
            </div>

            {/* Agent cards */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : agents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center">
                    <p className="text-sm text-ai-muted">No agents have registered yet — check back soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {agents.map((agent, i) => {
                        const accent = ACCENTS[i % ACCENTS.length];
                        return (
                            <motion.div
                                key={agent._id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="group bg-white rounded-2xl border border-black/8 p-6 hover:shadow-md hover:border-black/15 transition-all duration-300 flex flex-col gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <AgentInitials name={agent.businessName} color={accent} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-bold text-ai-text leading-snug">{agent.businessName}</h3>
                                            <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: '#2f4a3a' }} />
                                        </div>
                                        <p className="text-xs text-ai-muted mt-0.5">Registered Himato partner{agent.name ? ` · ${agent.name}` : ''}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-black/6 mt-auto">
                                    <button
                                        onClick={() => setModalAgentId(agent._id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 group-hover:-translate-y-px"
                                        style={{ background: accent }}
                                    >
                                        Get a Free Quote
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Bottom CTA banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 rounded-2xl overflow-hidden relative flex flex-col sm:flex-row items-center justify-between gap-6 p-8"
                style={{ background: '#2f4a3a' }}
            >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(201,169,97,0.2) 0%, transparent 60%)' }} />
                <div className="relative z-10 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                        <Shield className="w-4 h-4 text-[#c9a961]" />
                        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c9a961]">For Travel Businesses</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">Are you a Sikkim travel agent?</h3>
                    <p className="text-white/60 text-sm mt-1">Get discovered by travellers with a ready-made AI itinerary.</p>
                </div>
                <a href="/register"
                    className="relative z-10 shrink-0 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                    style={{ background: '#f6f1e7', color: '#0e1116', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.35)' }}>
                    Apply to be Listed →
                </a>
            </motion.div>

            {/* Quote modal — preselected to the chosen agent */}
            <SendToAgentModal
                isOpen={modalAgentId !== null}
                onClose={() => setModalAgentId(null)}
                data={data}
                preselectAgentId={modalAgentId || undefined}
            />
        </section>
    );
};
