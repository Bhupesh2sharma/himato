import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Link as LinkIcon, Upload, Trash2, CheckCircle2, Wallet, MessageCircle, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';
import { useAuth } from '../contexts/AuthContext';
import { heroImageForItinerary, imageForLocation } from '../utils/locationImages';

interface BusinessShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    itineraryId?: string | null;
}

const MAX_LOGO_BYTES = 250 * 1024; // 250 KB cap so the itinerary record stays small

export const BusinessShareModal = ({ isOpen, onClose, data, itineraryId }: BusinessShareModalProps) => {
    const { isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        agentName: '',
        contactNumber: '',
        welcomeNote: '',
        brandColor: '#22C55E',
        brandLogo: '' as string, // base64 data URL
        totalPrice: '',
        pricePerGuest: '',
        includes: '',
        notes: '',
    });
    const [copied, setCopied] = useState(false);
    const [logoError, setLogoError] = useState('');

    // Brand Color Presets
    const brandColors = [
        { name: 'Growth Green', value: '#22C55E' },
        { name: 'Trust Blue', value: '#3B82F6' },
        { name: 'Royal Gold', value: '#EAB308' },
        { name: 'Passion Red', value: '#EF4444' },
        { name: 'Creative Purple', value: '#A855F7' },
    ];

    // Load saved agent details from localStorage
    useEffect(() => {
        if (!isOpen) return;
        const savedProfile = localStorage.getItem('himato_agent_profile');
        if (savedProfile) {
            try {
                const saved = JSON.parse(savedProfile);
                setFormData((prev) => ({
                    ...prev,
                    businessName: saved.businessName || '',
                    agentName: saved.agentName || '',
                    contactNumber: saved.contactNumber || '',
                    brandColor: saved.brandColor || '#22C55E',
                    brandLogo: saved.brandLogo || '',
                    welcomeNote: saved.welcomeNote || '',
                }));
            } catch {
                /* ignore */
            }
        }
    }, [isOpen]);

    const generateSlug = (name: string) => {
        return (
            name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '') +
            '-' +
            Math.random().toString(36).substr(2, 5)
        );
    };

    const handleLogoUpload = (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setLogoError('Please pick an image file (PNG / JPG / SVG).');
            return;
        }
        if (file.size > MAX_LOGO_BYTES) {
            setLogoError(`Logo too large. Keep it under ${Math.floor(MAX_LOGO_BYTES / 1024)} KB.`);
            return;
        }
        setLogoError('');
        const reader = new FileReader();
        reader.onload = () => {
            setFormData((prev) => ({ ...prev, brandLogo: String(reader.result || '') }));
        };
        reader.readAsDataURL(file);
    };

    const handleShare = async () => {
        // Save agent profile (including logo) for next time
        localStorage.setItem(
            'himato_agent_profile',
            JSON.stringify({
                businessName: formData.businessName,
                agentName: formData.agentName,
                contactNumber: formData.contactNumber,
                brandColor: formData.brandColor,
                brandLogo: formData.brandLogo,
                welcomeNote: formData.welcomeNote,
            })
        );

        const shareData = {
            ...data,
            businessName: formData.businessName,
            agentName: formData.agentName,
            contactNumber: formData.contactNumber,
            brandColor: formData.brandColor,
            brandLogo: formData.brandLogo,
            welcomeNote: formData.welcomeNote,
            pricing: {
                total: formData.totalPrice,
                perGuest: formData.pricePerGuest,
                includes: formData.includes,
            },
            notes: formData.notes,
        };

        try {
            let url = '';

            if (itineraryId) {
                const { apiClient } = await import('../services/api');
                const slug = generateSlug(formData.businessName || 'itinerary');
                const isOneTime = !isAuthenticated;

                await apiClient.updateItinerary(itineraryId, {
                    itineraryData: shareData,
                    shared: true,
                    slug,
                    isOneTime,
                });

                url = `${window.location.origin}/${slug}`;
            } else {
                url = encodeItineraryToUrl(shareData);
            }

            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Share failed:', error);
            alert('Failed to generate link. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-ai-card border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl max-h-[92vh] overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
                    >
                        {/* === Form pane === */}
                        <div className="overflow-y-auto px-6 py-6 sm:px-7 sm:py-7">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-ai-accent mb-1">
                                        Share as Business
                                    </p>
                                    <h3 className="text-xl font-bold text-white">Send to your client</h3>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Business name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Business name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none"
                                        placeholder="e.g. Dream Travels"
                                    />
                                </div>

                                {/* Agent + WhatsApp */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Your name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.agentName}
                                            onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none"
                                            placeholder="Rahul Sharma"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none"
                                            placeholder="919876543210"
                                        />
                                    </div>
                                </div>

                                {/* Brand styling — logo + color */}
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                            Agency logo
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden bg-black/30 flex-none"
                                                style={
                                                    !formData.brandLogo
                                                        ? {
                                                              background: `linear-gradient(135deg, ${formData.brandColor}, ${formData.brandColor}cc)`,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {formData.brandLogo ? (
                                                    <img src={formData.brandLogo} alt="logo preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-black">
                                                        {(formData.agentName?.[0] || formData.businessName?.[0] || 'A').toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold text-white border border-white/10"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    {formData.brandLogo ? 'Replace logo' : 'Upload logo (PNG / JPG)'}
                                                </button>
                                                {formData.brandLogo && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, brandLogo: '' })}
                                                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/15 rounded-lg text-xs font-bold text-red-400 border border-red-500/20"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                                            />
                                        </div>
                                        {logoError && <p className="text-xs text-red-400 mt-2">{logoError}</p>}
                                        <p className="text-[11px] text-gray-500 mt-2">
                                            Square logo works best · max 250 KB · transparent PNG recommended.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                            Brand color
                                        </label>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {brandColors.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, brandColor: color.value })}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                        formData.brandColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                                                    }`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                    aria-label={color.name}
                                                />
                                            ))}
                                            <div className="flex items-center gap-2 ml-2">
                                                <input
                                                    type="color"
                                                    value={formData.brandColor}
                                                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                                                    aria-label="Custom color"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.brandColor}
                                                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                                                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-mono w-24 focus:border-ai-accent/50 focus:outline-none"
                                                    placeholder="#22C55E"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Welcome message <span className="text-gray-500 normal-case font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            value={formData.welcomeNote}
                                            onChange={(e) => setFormData({ ...formData, welcomeNote: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none h-20 resize-none text-sm"
                                            placeholder="Hi Rahul, here is the itinerary we discussed…"
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Total price
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.totalPrice}
                                            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none"
                                            placeholder="₹50,000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Per guest
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.pricePerGuest}
                                            onChange={(e) => setFormData({ ...formData, pricePerGuest: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none"
                                            placeholder="₹12,500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Includes <span className="text-gray-500 normal-case font-normal">(comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.includes}
                                        onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none"
                                        placeholder="Hotels, cab, permits, breakfast"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Notes / terms
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-ai-accent/50 focus:outline-none h-20 resize-none"
                                        placeholder="Cancellation, payment terms, anything else the client should know."
                                    />
                                </div>

                                <button
                                    onClick={handleShare}
                                    className="w-full mt-2 bg-ai-accent hover:bg-ai-secondary text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Link copied to clipboard
                                        </>
                                    ) : (
                                        <>
                                            <LinkIcon className="w-5 h-5" />
                                            Generate business link
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* === Live preview pane === */}
                        <aside className="hidden lg:flex flex-col bg-gradient-to-b from-[#0a0a0c] to-black border-l border-white/10 relative">
                            <div className="px-6 pt-6 pb-2 flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase font-bold text-gray-500">
                                <Sparkles className="w-3 h-3" />
                                Live preview · what your client sees
                            </div>
                            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                                <PhonePreview data={data} formData={formData} />
                            </div>
                        </aside>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --------------------------------------------------------------------------
// Live phone-frame mock that mirrors ClientItineraryView with the form data.
// Intentionally simplified — shows the parts agents care most about during
// review (header brand, hero, pricing, day-1 first activity).
// --------------------------------------------------------------------------
function PhonePreview({ data, formData }: { data: any; formData: any }) {
    const accentColor = formData.brandColor || '#22C55E';
    const heroImage = useMemo(() => heroImageForItinerary(data), [data]);
    const firstDay = data?.days?.[0];
    const firstActivity = firstDay?.activities?.[0];
    const firstActivityImage = useMemo(
        () => imageForLocation(firstActivity?.location || firstActivity?.title),
        [firstActivity]
    );

    const includesList: string[] = (formData.includes ?? '')
        .split(/[,\|\n]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);

    const initial = (formData.agentName?.[0] || formData.businessName?.[0] || 'A').toUpperCase();

    return (
        <div
            className="w-[300px] h-[600px] rounded-[2.4rem] border border-white/10 bg-[#050505] overflow-hidden shadow-2xl relative flex flex-col"
            style={{ boxShadow: '0 24px 60px -20px rgba(0,0,0,0.8)' }}
        >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-30" />

            {/* Header */}
            <div className="flex-none h-12 px-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 min-w-0">
                    {formData.brandLogo ? (
                        <img src={formData.brandLogo} alt="logo" className="w-6 h-6 rounded-md object-cover bg-white" />
                    ) : (
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-black text-[11px]"
                            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
                        >
                            {initial}
                        </div>
                    )}
                    <span className="text-[11px] font-bold text-white truncate">
                        {formData.businessName || 'Your Agency'}
                    </span>
                </div>
            </div>

            {/* Scrollable mock body */}
            <div className="flex-1 overflow-y-auto px-3 pb-24 scrollbar-hide">
                {/* Hero */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-3">
                    <img
                        src={heroImage}
                        alt="hero"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to top, rgba(5,5,5,0.92), rgba(5,5,5,0.4) 50%, transparent)',
                        }}
                    />
                    <div className="absolute inset-x-3 bottom-3">
                        <span
                            className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase mb-1.5"
                            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                        >
                            Your itinerary
                        </span>
                        <p className="text-white text-base font-bold leading-tight">
                            {data?.days?.length || 0}-Day Sikkim Journey
                        </p>
                    </div>
                </div>

                {/* Pricing card */}
                {(formData.totalPrice || formData.pricePerGuest || includesList.length > 0) && (
                    <div className="rounded-2xl p-3 bg-[#111] border border-white/5 mb-3">
                        <div className="flex items-center gap-1.5 mb-2 text-gray-400">
                            <Wallet className="w-3 h-3" style={{ color: accentColor }} />
                            <span className="text-[8px] uppercase tracking-widest font-bold">Pricing</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {formData.totalPrice && (
                                <div className="rounded-lg p-2 bg-black/30 border border-white/5">
                                    <p className="text-[8px] uppercase tracking-wider text-gray-500">Total</p>
                                    <p className="text-sm font-bold text-white">{formData.totalPrice}</p>
                                </div>
                            )}
                            {formData.pricePerGuest && (
                                <div className="rounded-lg p-2 bg-black/30 border border-white/5">
                                    <p className="text-[8px] uppercase tracking-wider text-gray-500">Per guest</p>
                                    <p className="text-sm font-bold text-white">{formData.pricePerGuest}</p>
                                </div>
                            )}
                        </div>
                        {includesList.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {includesList.slice(0, 4).map((item: string) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border"
                                        style={{
                                            background: `${accentColor}1a`,
                                            borderColor: `${accentColor}40`,
                                            color: '#e5e7eb',
                                        }}
                                    >
                                        <CheckCircle2 className="w-2.5 h-2.5" style={{ color: accentColor }} />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Welcome note */}
                {formData.welcomeNote && (
                    <div className="rounded-2xl p-3 bg-[#161616] border border-white/5 mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                            {formData.brandLogo ? (
                                <img src={formData.brandLogo} alt="logo" className="w-5 h-5 rounded-md object-cover bg-white" />
                            ) : (
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-black text-[10px]"
                                    style={{ background: accentColor }}
                                >
                                    {initial}
                                </div>
                            )}
                            <p className="text-[8px] tracking-widest uppercase font-bold text-gray-500">Message from</p>
                        </div>
                        <p className="text-[10px] italic text-gray-300 leading-relaxed line-clamp-3">
                            "{formData.welcomeNote}"
                        </p>
                    </div>
                )}

                {/* First activity preview */}
                {firstActivity && (
                    <div className="rounded-2xl overflow-hidden bg-[#111] border border-white/5 mb-3">
                        <div className="relative aspect-[16/8]">
                            <img
                                src={firstActivityImage}
                                alt={firstActivity.location}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        'linear-gradient(to top, rgba(17,17,17,0.95), rgba(17,17,17,0.3) 50%, transparent)',
                                }}
                            />
                            <span
                                className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-mono"
                                style={{ background: `${accentColor}30`, color: accentColor }}
                            >
                                {firstActivity.time}
                            </span>
                            <p className="absolute inset-x-2 bottom-1.5 text-[10px] font-bold text-white leading-tight line-clamp-2">
                                {firstActivity.title}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky CTA preview */}
            {formData.contactNumber && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center px-4 pointer-events-none">
                    <div
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold shadow-2xl"
                        style={{
                            background: accentColor,
                            color: '#0e1116',
                            boxShadow: `0 8px 20px -4px ${accentColor}aa`,
                        }}
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        Confirm this trip
                    </div>
                </div>
            )}

            {!formData.contactNumber && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center px-4 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-medium text-gray-500 bg-white/5 border border-white/10">
                        <MessageCircle className="w-3 h-3" />
                        Add WhatsApp to enable Confirm CTA
                    </div>
                </div>
            )}
        </div>
    );
}
