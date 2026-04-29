import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Check,
    Link as LinkIcon,
    Upload,
    Trash2,
    CheckCircle2,
    Wallet,
    MessageCircle,
    Sparkles,
    Image as ImageIcon,
    RotateCcw,
    Calendar,
    MapPin,
    Pencil,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';
import { useAuth } from '../contexts/AuthContext';
import { heroImageForItinerary } from '../utils/locationImages';

interface BusinessShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    itineraryId?: string | null;
}

const MAX_LOGO_BYTES = 250 * 1024;
const MAX_HERO_BYTES = 600 * 1024;

const inputCls =
    'w-full bg-white border border-black/10 rounded-lg px-4 py-2.5 text-ai-text placeholder:text-ai-muted/60 focus:border-ai-accent focus:ring-2 focus:ring-ai-accent/15 focus:outline-none transition';
const labelCls = 'block text-[11px] font-bold text-ai-muted mb-1.5 uppercase tracking-[0.12em]';

type ShareMode = 'branded' | 'plain';

export const BusinessShareModal = ({ isOpen, onClose, data, itineraryId }: BusinessShareModalProps) => {
    const { isAuthenticated } = useAuth();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<ShareMode>('branded');
    // Editable copy of data.days — agent can tweak the AI output before sharing.
    const [editedDays, setEditedDays] = useState<any[]>(() => deepCloneDays(data?.days));
    const [showEditHint, setShowEditHint] = useState(true);
    const [formData, setFormData] = useState({
        businessName: '',
        agentName: '',
        contactNumber: '',
        welcomeNote: '',
        brandColor: '#2f4a3a',
        brandLogo: '' as string,
        customHeroImage: '' as string,
        totalPrice: '',
        pricePerGuest: '',
        includes: '',
        notes: '',
    });
    const [copied, setCopied] = useState(false);
    const [logoError, setLogoError] = useState('');
    const [heroError, setHeroError] = useState('');

    const brandColors = [
        { name: 'Forest Moss', value: '#2f4a3a' },
        { name: 'Trust Blue', value: '#3B82F6' },
        { name: 'Royal Gold', value: '#c9a961' },
        { name: 'Vermilion', value: '#b73f25' },
        { name: 'Saffron', value: '#d97a2c' },
        { name: 'Plum', value: '#7c3aed' },
    ];

    // Reset editable days each time the modal opens (or the underlying
    // itinerary is regenerated). This way the agent always starts with the
    // latest AI output — but their tweaks survive while the modal is open.
    useEffect(() => {
        if (!isOpen) return;
        setEditedDays(deepCloneDays(data?.days));
        setShowEditHint(true);
    }, [isOpen, data]);

    // --- Edit helpers ---
    const updateDayTitle = (dayIdx: number, value: string) => {
        setShowEditHint(false);
        setEditedDays((prev) => {
            const next = [...prev];
            next[dayIdx] = { ...next[dayIdx], title: value };
            return next;
        });
    };
    const updateActivity = (dayIdx: number, actIdx: number, field: string, value: string) => {
        setShowEditHint(false);
        setEditedDays((prev) => {
            const next = [...prev];
            const day = { ...next[dayIdx] };
            const acts = [...(day.activities ?? [])];
            acts[actIdx] = { ...acts[actIdx], [field]: value };
            day.activities = acts;
            next[dayIdx] = day;
            return next;
        });
    };
    const deleteActivity = (dayIdx: number, actIdx: number) => {
        setShowEditHint(false);
        setEditedDays((prev) => {
            const next = [...prev];
            const day = { ...next[dayIdx] };
            day.activities = (day.activities ?? []).filter((_: any, i: number) => i !== actIdx);
            next[dayIdx] = day;
            return next;
        });
    };

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
                    brandColor: saved.brandColor || '#2f4a3a',
                    brandLogo: saved.brandLogo || '',
                    welcomeNote: saved.welcomeNote || '',
                }));
            } catch {
                /* ignore */
            }
        }
    }, [isOpen]);

    /**
     * Build a clean, shareable slug.
     * - With business name: "dream-travels-x4kf2"
     * - Without:            "sikkim-trip-a3hg7q"
     */
    const generateSlug = (name?: string): string => {
        const suffix = Math.random().toString(36).slice(2, 8);
        const cleaned = (name || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .slice(0, 32);
        const base = cleaned || 'sikkim-trip';
        return `${base}-${suffix}`;
    };

    const readImageAsBase64 = (
        file: File,
        maxBytes: number,
        onErr: (msg: string) => void,
        onOk: (base64: string) => void
    ) => {
        if (!file.type.startsWith('image/')) {
            onErr('Please pick an image file (PNG / JPG / SVG / WEBP).');
            return;
        }
        if (file.size > maxBytes) {
            onErr(`Image too large. Keep it under ${Math.floor(maxBytes / 1024)} KB.`);
            return;
        }
        onErr('');
        const reader = new FileReader();
        reader.onload = () => onOk(String(reader.result || ''));
        reader.readAsDataURL(file);
    };

    const handleShare = async () => {
        const isBranded = mode === 'branded';

        if (isBranded) {
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
        }

        const shareData = isBranded
            ? {
                  ...data,
                  days: editedDays, // agent's edits override AI output
                  businessName: formData.businessName,
                  agentName: formData.agentName,
                  contactNumber: formData.contactNumber,
                  brandColor: formData.brandColor,
                  brandLogo: formData.brandLogo,
                  customHeroImage: formData.customHeroImage,
                  welcomeNote: formData.welcomeNote,
                  pricing: {
                      total: formData.totalPrice,
                      perGuest: formData.pricePerGuest,
                      includes: formData.includes,
                  },
                  notes: formData.notes,
              }
            : { ...data, days: editedDays }; // plain share — keep edits, strip agent fields

        // Always prefer a clean slug URL stored on the backend. Long ?plan=
        // URLs are a last-resort fallback if both the update and create
        // endpoints fail (e.g. backend down, or share endpoint not deployed).
        try {
            const slug = generateSlug(isBranded ? formData.businessName : undefined);
            const isOneTime = !isAuthenticated;
            const { apiClient } = await import('../services/api');

            let url = '';

            if (itineraryId) {
                // Logged-in / saved itinerary: update existing record.
                await apiClient.updateItinerary(itineraryId, {
                    itineraryData: shareData,
                    shared: true,
                    slug,
                    isOneTime,
                });
                url = `${window.location.origin}/${slug}`;
            } else {
                // No saved record yet — create one purely for sharing.
                try {
                    const res = await apiClient.createSharedItinerary({
                        itineraryData: shareData,
                        slug,
                        isOneTime,
                    });
                    const finalSlug = res?.data?.itinerary?.slug || slug;
                    url = `${window.location.origin}/${finalSlug}`;
                } catch (err: any) {
                    // Endpoint not deployed yet, or transient failure — fall
                    // back to the encoded long URL so sharing still works.
                    console.warn(
                        'createSharedItinerary failed, falling back to long URL:',
                        err?.message || err
                    );
                    url = encodeItineraryToUrl(shareData);
                }
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

    // Combined data the preview should render (form values applied to the
    // raw itinerary data). For 'plain' mode we intentionally strip all
    // agent fields so the preview is honest.
    const previewData = useMemo(() => {
        if (mode === 'plain') return { ...data, days: editedDays };
        return {
            ...data,
            days: editedDays,
            businessName: formData.businessName,
            agentName: formData.agentName,
            contactNumber: formData.contactNumber,
            brandColor: formData.brandColor,
            brandLogo: formData.brandLogo,
            customHeroImage: formData.customHeroImage,
            welcomeNote: formData.welcomeNote,
            pricing: {
                total: formData.totalPrice,
                perGuest: formData.pricePerGuest,
                includes: formData.includes,
            },
            notes: formData.notes,
        };
    }, [data, formData, mode, editedDays]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-black/5 flex flex-col"
                        style={{ height: 'min(92vh, 880px)' }}
                    >
                        {/* === Top header (full width) === */}
                        <header className="flex-none px-6 sm:px-8 pt-6 pb-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-ai-accent mb-1.5">
                                    Share itinerary
                                </p>
                                <h3 className="text-2xl font-bold text-ai-text leading-tight">
                                    {mode === 'branded' ? 'Send to your client' : 'Share a plain link'}
                                </h3>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mode toggle */}
                                <div className="inline-flex p-1 rounded-full bg-[#f0ebdf] border border-black/5">
                                    <button
                                        onClick={() => setMode('branded')}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                            mode === 'branded'
                                                ? 'bg-ai-accent text-white shadow'
                                                : 'text-ai-muted hover:text-ai-text'
                                        }`}
                                    >
                                        With branding
                                    </button>
                                    <button
                                        onClick={() => setMode('plain')}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                            mode === 'plain'
                                                ? 'bg-ai-accent text-white shadow'
                                                : 'text-ai-muted hover:text-ai-text'
                                        }`}
                                    >
                                        Without branding
                                    </button>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-ai-muted hover:text-ai-text transition-colors p-1"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* === Body grid: form | preview === */}
                        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                            {/* --- Form pane (light, scrollable) --- */}
                            <div className="min-h-0 overflow-y-auto px-6 sm:px-8 py-6 bg-white border-b lg:border-b-0 lg:border-r border-black/5">
                                {mode === 'plain' ? (
                                    <PlainCallout onShare={handleShare} copied={copied} />
                                ) : (
                                    <BrandingForm
                                        formData={formData}
                                        setFormData={setFormData}
                                        brandColors={brandColors}
                                        labelCls={labelCls}
                                        inputCls={inputCls}
                                        logoInputRef={logoInputRef}
                                        heroInputRef={heroInputRef}
                                        onLogoUpload={(file: File) =>
                                            readImageAsBase64(
                                                file,
                                                MAX_LOGO_BYTES,
                                                setLogoError,
                                                (b64) => setFormData((p) => ({ ...p, brandLogo: b64 }))
                                            )
                                        }
                                        onHeroUpload={(file: File) =>
                                            readImageAsBase64(
                                                file,
                                                MAX_HERO_BYTES,
                                                setHeroError,
                                                (b64) => setFormData((p) => ({ ...p, customHeroImage: b64 }))
                                            )
                                        }
                                        logoError={logoError}
                                        heroError={heroError}
                                        autoHeroImage={heroImageForItinerary(data)}
                                        onShare={handleShare}
                                        copied={copied}
                                    />
                                )}
                            </div>

                            {/* --- Live preview pane (dark, scrollable, full itinerary) --- */}
                            <aside
                                className="min-h-0 overflow-y-auto relative"
                                style={{
                                    background:
                                        'linear-gradient(160deg, #0a0a0c 0%, #14181b 50%, #050505 100%)',
                                }}
                            >
                                <InlineSharePreview
                                    data={previewData}
                                    mode={mode}
                                    showEditHint={showEditHint}
                                    onUpdateDayTitle={updateDayTitle}
                                    onUpdateActivity={updateActivity}
                                    onDeleteActivity={deleteActivity}
                                />
                            </aside>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --------------------------------------------------------------------------
// Plain-share callout — shown when user picks "Without branding"
// --------------------------------------------------------------------------
function PlainCallout({ onShare, copied }: { onShare: () => void; copied: boolean }) {
    return (
        <div className="h-full flex flex-col">
            <div className="rounded-2xl bg-[#fafaf6] border border-black/8 p-6">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-ai-accent/10 mb-4">
                    <LinkIcon className="w-5 h-5 text-ai-accent" />
                </div>
                <h4 className="text-lg font-bold text-ai-text mb-2">A clean Himato share link.</h4>
                <p className="text-sm text-ai-muted leading-relaxed mb-1">
                    Skips your agency branding entirely. The recipient sees the itinerary on the default Himato design — perfect for sending to a friend, sharing on social, or testing how the planner looks.
                </p>
                <p className="text-sm text-ai-muted leading-relaxed">
                    No business name, logo, pricing, or welcome note attached. Just the itinerary.
                </p>
            </div>

            <div className="mt-auto pt-6">
                <button
                    onClick={onShare}
                    className="w-full bg-ai-accent hover:bg-ai-secondary text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                    {copied ? (
                        <>
                            <Check className="w-5 h-5" />
                            Link copied to clipboard
                        </>
                    ) : (
                        <>
                            <LinkIcon className="w-5 h-5" />
                            Generate plain share link
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------
// Branding form
// --------------------------------------------------------------------------
function BrandingForm({
    formData,
    setFormData,
    brandColors,
    labelCls,
    inputCls,
    logoInputRef,
    heroInputRef,
    onLogoUpload,
    onHeroUpload,
    logoError,
    heroError,
    autoHeroImage,
    onShare,
    copied,
}: any) {
    const heroPreview = formData.customHeroImage || autoHeroImage;

    return (
        <div className="space-y-5">
            {/* Business name */}
            <div>
                <label className={labelCls}>Business name</label>
                <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e: any) => setFormData({ ...formData, businessName: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Dream Travels"
                />
            </div>

            {/* Agent + WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Your name</label>
                    <input
                        type="text"
                        value={formData.agentName}
                        onChange={(e: any) => setFormData({ ...formData, agentName: e.target.value })}
                        className={inputCls}
                        placeholder="Rahul Sharma"
                    />
                </div>
                <div>
                    <label className={labelCls}>WhatsApp</label>
                    <input
                        type="text"
                        value={formData.contactNumber}
                        onChange={(e: any) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className={inputCls}
                        placeholder="919876543210"
                    />
                </div>
            </div>

            {/* Hero image card */}
            <div className="rounded-2xl border border-black/8 bg-[#fafaf6] p-5 space-y-3">
                <p className="text-[11px] font-bold text-ai-accent uppercase tracking-[0.18em]">Hero image</p>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-black/8 bg-black">
                    <img
                        src={heroPreview}
                        alt="hero preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    {!formData.customHeroImage && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-bold bg-black/55 text-white backdrop-blur">
                            Auto-picked from itinerary
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => heroInputRef.current?.click()}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-ai-accent hover:bg-ai-secondary text-white rounded-lg text-xs font-bold transition-colors"
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {formData.customHeroImage ? 'Replace hero' : 'Upload your own hero'}
                    </button>
                    {formData.customHeroImage && (
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, customHeroImage: '' })}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-black/5 text-ai-text rounded-lg text-xs font-bold border border-black/10 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Use auto
                        </button>
                    )}
                </div>
                <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onHeroUpload(file);
                    }}
                />
                {heroError && <p className="text-xs text-red-600">{heroError}</p>}
                <p className="text-[11px] text-ai-muted">
                    Wide landscape works best · max 600 KB. We auto-pick a Sikkim photo from your itinerary if you don't upload one.
                </p>
            </div>

            {/* Branding card */}
            <div className="rounded-2xl border border-black/8 bg-[#fafaf6] p-5 space-y-5">
                <p className="text-[11px] font-bold text-ai-accent uppercase tracking-[0.18em]">Branding</p>

                <div>
                    <label className={labelCls}>Agency logo</label>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-14 h-14 rounded-xl border border-black/8 flex items-center justify-center overflow-hidden bg-white flex-none shadow-sm"
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
                                <span className="text-xl font-bold text-white">
                                    {(formData.agentName?.[0] || formData.businessName?.[0] || 'A').toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-ai-accent hover:bg-ai-secondary text-white rounded-lg text-xs font-bold transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {formData.brandLogo ? 'Replace logo' : 'Upload logo'}
                            </button>
                            {formData.brandLogo && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, brandLogo: '' })}
                                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                </button>
                            )}
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onLogoUpload(file);
                            }}
                        />
                    </div>
                    {logoError && <p className="text-xs text-red-600 mt-2">{logoError}</p>}
                    <p className="text-[11px] text-ai-muted mt-2">
                        Square logo, max 250 KB · transparent PNG works best.
                    </p>
                </div>

                <div>
                    <label className={labelCls}>Brand color</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {brandColors.map((color: any) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, brandColor: color.value })}
                                className={`w-8 h-8 rounded-full transition-all ${
                                    formData.brandColor === color.value
                                        ? 'ring-2 ring-offset-2 ring-ai-accent scale-110'
                                        : 'ring-1 ring-black/10 hover:scale-105'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                                aria-label={color.name}
                            />
                        ))}
                        <div className="flex items-center gap-2 ml-1">
                            <input
                                type="color"
                                value={formData.brandColor}
                                onChange={(e: any) => setFormData({ ...formData, brandColor: e.target.value })}
                                className="w-8 h-8 rounded-full cursor-pointer border border-black/10 bg-transparent"
                                aria-label="Custom color"
                            />
                            <input
                                type="text"
                                value={formData.brandColor}
                                onChange={(e: any) => setFormData({ ...formData, brandColor: e.target.value })}
                                className="bg-white border border-black/10 rounded-lg px-3 py-1.5 text-ai-text text-xs font-mono w-24 focus:border-ai-accent focus:outline-none"
                                placeholder="#2f4a3a"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelCls}>
                        Welcome message <span className="text-ai-muted normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={formData.welcomeNote}
                        onChange={(e: any) => setFormData({ ...formData, welcomeNote: e.target.value })}
                        className={`${inputCls} h-20 resize-none text-sm`}
                        placeholder="Hi Rahul, here is the itinerary we discussed…"
                    />
                </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Total price</label>
                    <input
                        type="text"
                        value={formData.totalPrice}
                        onChange={(e: any) => setFormData({ ...formData, totalPrice: e.target.value })}
                        className={inputCls}
                        placeholder="₹50,000"
                    />
                </div>
                <div>
                    <label className={labelCls}>Per guest</label>
                    <input
                        type="text"
                        value={formData.pricePerGuest}
                        onChange={(e: any) => setFormData({ ...formData, pricePerGuest: e.target.value })}
                        className={inputCls}
                        placeholder="₹12,500"
                    />
                </div>
            </div>

            <div>
                <label className={labelCls}>
                    Includes <span className="text-ai-muted normal-case font-normal">(comma separated)</span>
                </label>
                <input
                    type="text"
                    value={formData.includes}
                    onChange={(e: any) => setFormData({ ...formData, includes: e.target.value })}
                    className={inputCls}
                    placeholder="Hotels, cab, permits, breakfast"
                />
            </div>

            <div>
                <label className={labelCls}>Notes / terms</label>
                <textarea
                    value={formData.notes}
                    onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                    className={`${inputCls} h-20 resize-none`}
                    placeholder="Cancellation, payment terms, anything else the client should know."
                />
            </div>

            <button
                onClick={onShare}
                className="w-full mt-2 bg-ai-accent hover:bg-ai-secondary text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
    );
}

// --------------------------------------------------------------------------
// Click-to-edit text. Renders as a subtle hoverable span until clicked,
// then swaps to an input/textarea bound to a local draft. Blur saves,
// Esc cancels, Enter (single-line only) saves and blurs.
// --------------------------------------------------------------------------
function EditableText({
    value,
    onChange,
    placeholder,
    multiline,
    className = '',
    style,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        if (!editing) setDraft(value);
    }, [value, editing]);

    const commit = () => {
        const trimmed = draft.trim();
        if (trimmed !== value) onChange(trimmed);
        setEditing(false);
    };

    const cancel = () => {
        setDraft(value);
        setEditing(false);
    };

    const handleKey = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
        } else if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            commit();
        }
    };

    if (editing) {
        const sharedProps = {
            value: draft,
            onChange: (e: any) => setDraft(e.target.value),
            onBlur: commit,
            onKeyDown: handleKey,
            autoFocus: true,
            className: `${className} bg-white/10 outline-none rounded px-1 -mx-1 ring-1 ring-white/20 focus:ring-white/40`,
            style,
        };
        return multiline ? (
            <textarea {...sharedProps} rows={3} className={`${sharedProps.className} w-full resize-none`} />
        ) : (
            <input type="text" {...sharedProps} />
        );
    }

    const isEmpty = !value || !value.trim();
    return (
        <span
            role="button"
            tabIndex={0}
            onClick={() => setEditing(true)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setEditing(true);
                }
            }}
            className={`${className} cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors`}
            style={style}
        >
            {isEmpty ? <span className="text-gray-500 italic">{placeholder || 'Click to edit'}</span> : value}
        </span>
    );
}

// Deep clone day data so edits don't mutate parent props.
function deepCloneDays(days: any[] | undefined): any[] {
    if (!Array.isArray(days)) return [];
    return days.map((d) => ({
        ...d,
        activities: Array.isArray(d?.activities) ? d.activities.map((a: any) => ({ ...a })) : [],
    }));
}

// --------------------------------------------------------------------------
// Inline website-style preview that shows the FULL itinerary the way it
// will render on the client share page. Scrolls independently of the form.
// --------------------------------------------------------------------------
function InlineSharePreview({
    data,
    mode,
    showEditHint,
    onUpdateDayTitle,
    onUpdateActivity,
    onDeleteActivity,
}: {
    data: any;
    mode: ShareMode;
    showEditHint: boolean;
    onUpdateDayTitle: (dayIdx: number, value: string) => void;
    onUpdateActivity: (dayIdx: number, actIdx: number, field: string, value: string) => void;
    onDeleteActivity: (dayIdx: number, actIdx: number) => void;
}) {
    const accentColor = (mode === 'branded' && data.brandColor) || '#2f4a3a';
    const heroImage = useMemo(
        () => data.customHeroImage || heroImageForItinerary(data),
        [data]
    );
    const days: any[] = data?.days ?? [];
    const initial = ((mode === 'branded'
        ? data.agentName?.[0] || data.businessName?.[0]
        : 'H') || 'H').toUpperCase();

    const includesList: string[] = (mode === 'branded' ? data.pricing?.includes ?? '' : '')
        .split(/[,\|\n]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);

    const hasPricing =
        mode === 'branded' &&
        (data.pricing?.total || data.pricing?.perGuest || includesList.length > 0);

    return (
        <div className="relative">
            {/* Browser chrome */}
            <div className="sticky top-0 z-20 px-4 py-3 backdrop-blur-md bg-black/40 border-b border-white/5 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex items-center gap-2 ml-2 text-[10px] text-white/50 font-mono truncate">
                    <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
                    Live preview · what your client sees
                </div>
            </div>

            {/* Site header */}
            <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    {mode === 'branded' && data.brandLogo ? (
                        <img
                            src={data.brandLogo}
                            alt="logo"
                            className="w-7 h-7 rounded-lg object-cover bg-white"
                        />
                    ) : (
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
                        >
                            {initial}
                        </div>
                    )}
                    <span className="text-xs font-bold text-white truncate">
                        {mode === 'branded' ? data.businessName || 'Your Agency' : 'Himato'}
                    </span>
                </div>
            </div>

            {/* Hero */}
            <div className="px-4 sm:px-5">
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
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
                    <div
                        className="absolute inset-0 mix-blend-soft-light pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at 80% 0%, ${accentColor}aa, transparent 70%)`,
                        }}
                    />
                    <div className="absolute inset-x-4 bottom-4">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase mb-2"
                            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                        >
                            <Sparkles className="w-2.5 h-2.5" style={{ color: accentColor }} />
                            Your itinerary
                        </span>
                        <p className="text-white text-xl font-bold leading-tight">
                            {days.length}-Day Sikkim Journey
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/80">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {days.length} days
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Sikkim, India
                            </span>
                            {mode === 'branded' && data.pricing?.total && (
                                <span className="flex items-center gap-1">
                                    <Wallet className="w-3 h-3" /> {data.pricing.total}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-5 py-4 space-y-4">
                {/* Pricing card */}
                {hasPricing && (
                    <div className="rounded-2xl p-4 bg-[#111] border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: `${accentColor}22`, color: accentColor }}
                            >
                                <Wallet className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400">
                                Pricing & Inclusions
                            </p>
                        </div>
                        {(data.pricing?.total || data.pricing?.perGuest) && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {data.pricing?.total && (
                                    <div className="rounded-xl p-3 bg-black/30 border border-white/5">
                                        <p className="text-[9px] uppercase tracking-wider text-gray-500">Total</p>
                                        <p className="text-base font-bold text-white">{data.pricing.total}</p>
                                    </div>
                                )}
                                {data.pricing?.perGuest && (
                                    <div className="rounded-xl p-3 bg-black/30 border border-white/5">
                                        <p className="text-[9px] uppercase tracking-wider text-gray-500">Per guest</p>
                                        <p className="text-base font-bold text-white">{data.pricing.perGuest}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {includesList.length > 0 && (
                            <>
                                <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1.5">Includes</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {includesList.map((item) => (
                                        <span
                                            key={item}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
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
                            </>
                        )}
                    </div>
                )}

                {/* Welcome note */}
                {mode === 'branded' && data.welcomeNote && (
                    <div className="rounded-2xl p-4 bg-[#161616] border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            {data.brandLogo ? (
                                <img
                                    src={data.brandLogo}
                                    alt="logo"
                                    className="w-6 h-6 rounded-md object-cover bg-white"
                                />
                            ) : (
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px]"
                                    style={{ background: accentColor }}
                                >
                                    {initial}
                                </div>
                            )}
                            <p className="text-[9px] tracking-widest uppercase font-bold text-gray-500">
                                Message from {data.agentName || data.businessName || 'agency'}
                            </p>
                        </div>
                        <p className="text-[12px] italic text-gray-300 leading-relaxed">
                            "{data.welcomeNote}"
                        </p>
                    </div>
                )}

                {/* Edit hint — dismissed after first edit */}
                {showEditHint && days.length > 0 && (
                    <div
                        className="rounded-xl border flex items-center gap-2 px-3 py-2 text-[11px]"
                        style={{
                            background: `${accentColor}14`,
                            borderColor: `${accentColor}40`,
                            color: '#e5e7eb',
                        }}
                    >
                        <Pencil className="w-3 h-3 flex-none" style={{ color: accentColor }} />
                        <span>Click any day title, activity, time, or location below to edit before sharing.</span>
                    </div>
                )}

                {/* Full itinerary — every day, every activity (editable) */}
                {days.map((day, dayIdx) => (
                    <div key={day.day ?? dayIdx} className="rounded-2xl bg-[#111] border border-white/5 overflow-hidden">
                        <div
                            className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5"
                            style={{ background: `${accentColor}14` }}
                        >
                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-[10px] tracking-[0.2em] uppercase font-bold"
                                    style={{ color: accentColor }}
                                >
                                    Day {day.day}
                                </p>
                                <EditableText
                                    value={day.title || ''}
                                    onChange={(v) => onUpdateDayTitle(dayIdx, v)}
                                    placeholder="Add a title for this day"
                                    className="text-sm font-bold text-white"
                                />
                            </div>
                            <span className="text-[10px] text-gray-500 flex-none">
                                {day.activities?.length || 0} stops
                            </span>
                        </div>

                        <div className="p-3 space-y-2.5">
                            {(day.activities ?? []).map((activity: any, actIdx: number) => (
                                <div
                                    key={actIdx}
                                    className="group rounded-xl bg-black/30 border border-white/5 p-3 relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() => onDeleteActivity(dayIdx, actIdx)}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/30 hover:text-red-300 text-gray-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                        title="Remove this activity"
                                        aria-label="Remove activity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    <div className="flex items-start justify-between gap-2 mb-1.5 pr-7">
                                        <EditableText
                                            value={activity.title || ''}
                                            onChange={(v) => onUpdateActivity(dayIdx, actIdx, 'title', v)}
                                            placeholder="Activity title"
                                            className="text-[12px] font-bold text-white leading-snug flex-1"
                                        />
                                        <EditableText
                                            value={activity.time || ''}
                                            onChange={(v) => onUpdateActivity(dayIdx, actIdx, 'time', v)}
                                            placeholder="time"
                                            className="flex-none text-[9px] font-mono px-2 py-0.5 rounded-full"
                                            style={{
                                                background: `${accentColor}1f`,
                                                color: accentColor,
                                                border: `1px solid ${accentColor}55`,
                                            }}
                                        />
                                    </div>
                                    <EditableText
                                        value={activity.description || ''}
                                        onChange={(v) => onUpdateActivity(dayIdx, actIdx, 'description', v)}
                                        placeholder="Add a description"
                                        multiline
                                        className="block text-[11px] text-gray-400 leading-snug mb-1.5"
                                    />
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                        <MapPin className="w-2.5 h-2.5 flex-none" />
                                        <EditableText
                                            value={activity.location || ''}
                                            onChange={(v) => onUpdateActivity(dayIdx, actIdx, 'location', v)}
                                            placeholder="Location"
                                            className="text-[10px] text-gray-500"
                                        />
                                    </div>
                                </div>
                            ))}
                            {(day.activities ?? []).length === 0 && (
                                <div className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-[11px] text-gray-500 text-center">
                                    No activities left for this day.
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Notes */}
                {mode === 'branded' && data.notes && (
                    <div className="rounded-2xl p-4 bg-[#0e0e0e] border border-white/5">
                        <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-2">
                            Terms & Notes
                        </p>
                        <p className="whitespace-pre-line text-[11px] text-gray-400 leading-relaxed">
                            {data.notes}
                        </p>
                    </div>
                )}

                {/* CTA — Confirm this trip */}
                {mode === 'branded' && data.contactNumber ? (
                    <div className="pt-2 pb-4 flex justify-center">
                        <div
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl"
                            style={{
                                background: accentColor,
                                color: '#fff',
                                boxShadow: `0 16px 32px -8px ${accentColor}aa`,
                            }}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirm this trip on WhatsApp
                        </div>
                    </div>
                ) : mode === 'branded' && !data.contactNumber ? (
                    <div className="pt-2 pb-4 flex justify-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium text-gray-500 bg-white/5 border border-white/10">
                            <MessageCircle className="w-3 h-3" />
                            Add WhatsApp to enable Confirm CTA
                        </div>
                    </div>
                ) : (
                    <div className="pt-2 pb-4 flex justify-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium text-gray-400 bg-white/5 border border-white/10">
                            <Sparkles className="w-3 h-3" />
                            Plain Himato share — no agency CTA
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
